import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import type { NotificationResponse } from 'expo-notifications';
import { supabase } from '../supabase';
import { runOrQueue } from '../sync/runOrQueue';
import {
  BACKGROUND_NOTIFICATION_TASK,
  MARK_DONE_ACTION_ID,
  PRAYER_CATEGORY_ID,
  WAQT_ORDER,
  notificationIdFor,
  startedLine,
  type PrayerNotificationData,
} from './config';

// After marking a waqt done, the *next* waqt's notification may already be
// scheduled with a stale "❌ {this waqt} missed" line baked in from before
// it was completed. Rewrite it (same trigger, corrected body) so scenario 2
// from spec — "submit positive, next notification comes clean" — holds
// even when the app is never opened between the two.
async function clearMissedMarkOnNext(justCompleted: PrayerNotificationData) {
  const nextWaqt = WAQT_ORDER[(WAQT_ORDER.indexOf(justCompleted.waqt) + 1) % WAQT_ORDER.length];
  const identifier = notificationIdFor(nextWaqt);

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const next = scheduled.find((n) => n.identifier === identifier);
  if (!next || !next.trigger || !('date' in next.trigger)) return; // not scheduled yet, or already fired

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'DeenTogether',
      body: startedLine(nextWaqt, justCompleted.locale),
      data: { waqt: nextWaqt, dateString: justCompleted.dateString, locale: justCompleted.locale },
      sticky: true,
      autoDismiss: false,
      categoryIdentifier: PRAYER_CATEGORY_ID,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: next.trigger.date },
  });
}

// expo-notifications only wakes JS in the background for a remote push or
// an action-button press — plain delivery of a *local* scheduled
// notification does not run any code. So "mark done" can only happen here;
// day-to-day tray cleanup (dismissing stale ones, embedding "missed"
// status) happens separately whenever the app is foregrounded — see
// usePrayerNotifications.
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) return;
  const response = data as NotificationResponse | undefined;
  if (!response || !('actionIdentifier' in response)) return; // plain delivery, not an action press
  if (response.actionIdentifier !== MARK_DONE_ACTION_ID) return;
  const content = response.notification.request.content.data as PrayerNotificationData | undefined;
  if (!content?.waqt || !content?.dateString) return;

  // Headless context, no UI to fall back on — never let a hung/slow
  // AsyncStorage read (e.g. lock contention with the foreground app) block
  // this task indefinitely.
  const timeout = new Promise<{ data: { session: null } }>((resolve) =>
    setTimeout(() => resolve({ data: { session: null } }), 5000),
  );
  const {
    data: { session },
  } = await Promise.race([supabase.auth.getSession(), timeout]).catch(() => ({ data: { session: null } }));
  const userId = session?.user.id;
  if (!userId) return;

  // No React tree / QueryClient here (headless task) — runOrQueue's
  // enqueue path is plain AsyncStorage, so it works fine even here; a
  // queued action just waits for the next foreground resume to flush.
  // Row should already exist (ensure_today_prayer_rows ran whenever the
  // user last opened the app), but upsert defensively when actually
  // online — this runs with no UI to fall back on if it somehow doesn't.
  await runOrQueue({
    kind: 'prayerToggle',
    payload: { userId, prayerDate: content.dateString, prayerName: content.waqt, completed: true },
    run: async () => {
      const { error } = await supabase.from('prayer_logs').upsert(
        {
          user_id: userId,
          prayer_date: content.dateString,
          prayer_name: content.waqt,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,prayer_date,prayer_name' },
      );
      if (error) throw error;
    },
  });

  await clearMissedMarkOnNext(content).catch(() => {});

  // Marked done — the notification's job is finished; the next waqt's
  // already-scheduled trigger fires fresh on its own later.
  await Notifications.dismissNotificationAsync(response.notification.request.identifier);
});
