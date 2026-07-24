import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { PRAYER_CHANNEL_ID, PRAYER_TIME_TITLE, WAQT_ORDER, missedLine, notificationIdFor, startedLine } from '../notifications/config';
import type { CompletionMap } from './usePrayerLogs';
import { getCurrentWaqt, type DayPrayerTimes, type WaqtName } from '../prayerTimes';
import type { Locale } from '../../store/useLocaleStore';

let setupPromise: Promise<void> | null = null;

// Cache the in-flight/succeeded promise itself, not a boolean flag set
// before the await — flipping a "done" flag before the channel actually
// gets created meant a transient failure here would permanently skip
// creating the Android notification channel for the rest of the process,
// silently breaking every future scheduled notification tied to it.
function ensureSetup() {
  if (!setupPromise) {
    setupPromise = Notifications.setNotificationChannelAsync(PRAYER_CHANNEL_ID, {
      name: 'Prayer time updates',
      importance: Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    })
      .then(() => undefined)
      .catch((err) => {
        setupPromise = null; // allow retry on next call
        throw err;
      });
  }
  return setupPromise;
}

export async function requestPrayerNotificationPermission() {
  await ensureSetup();
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: requested } = await Notifications.requestPermissionsAsync();
  return requested === 'granted';
}

// Keeps the tray to (at most) the current waqt's notification, and
// (re)schedules every not-yet-fired waqt for today with fresh "previous
// prayer missed" context. Local scheduled notifications can't wake JS in
// the background on delivery, so this is best-effort: it runs whenever the
// app is foregrounded / this data changes, not continuously.
async function cancelAllWaqtNotifications() {
  for (const waqt of WAQT_ORDER) {
    await Notifications.cancelScheduledNotificationAsync(notificationIdFor(waqt)).catch(() => {});
  }
  const presented = await Notifications.getPresentedNotificationsAsync();
  for (const notif of presented) {
    await Notifications.dismissNotificationAsync(notif.request.identifier).catch(() => {});
  }
}

async function syncNotifications(
  times: DayPrayerTimes,
  dateString: string,
  completed: CompletionMap,
  locale: Locale,
  enabled: boolean,
) {
  if (!enabled) {
    await cancelAllWaqtNotifications();
    return;
  }

  const granted = (await Notifications.getPermissionsAsync()).status === 'granted';
  if (!granted) return;

  const now = new Date();
  const currentWaqt = getCurrentWaqt(times.windows, now).current.name;

  const presented = await Notifications.getPresentedNotificationsAsync();
  for (const notif of presented) {
    const data = notif.request.content.data as { waqt?: WaqtName } | undefined;
    if (data?.waqt && data.waqt !== currentWaqt) {
      await Notifications.dismissNotificationAsync(notif.request.identifier).catch(() => {});
    }
  }

  for (let i = 0; i < times.windows.length; i++) {
    const w = times.windows[i];
    if (w.start <= now) continue; // already fired or in the past — leave alone
    const identifier = notificationIdFor(w.name);
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

    const prev = i > 0 ? times.windows[i - 1] : null;
    const bodyLines = [startedLine(w.name, locale)];
    if (prev && !completed[prev.name]) {
      bodyLines.unshift(missedLine(prev.name, locale));
    }

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: PRAYER_TIME_TITLE[locale],
        body: bodyLines.join('\n'),
        data: { waqt: w.name, dateString, locale },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: w.start, channelId: PRAYER_CHANNEL_ID },
    });
  }
}

export function usePrayerNotifications(
  times: DayPrayerTimes | null,
  dateString: string | null,
  completed: CompletionMap,
  locale: Locale,
  enabled: boolean,
) {
  const lastRun = useRef(0);
  // `times` is a fresh object every ~60s (usePrayerTimes' internal clock
  // tick), but its actual schedule-relevant content only changes once a
  // day. Read the latest value via ref instead of depending on it directly,
  // so this doesn't re-sync (cancel + reschedule 5 notifications) every
  // minute the app happens to be open.
  const timesRef = useRef(times);
  timesRef.current = times;

  useEffect(() => {
    ensureSetup();
  }, []);

  useEffect(() => {
    if (!timesRef.current || !dateString) return;
    syncNotifications(timesRef.current, dateString, completed, locale, enabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateString, completed, locale, enabled]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !timesRef.current || !dateString) return;
      const now = Date.now();
      if (now - lastRun.current < 5000) return; // avoid thrashing on rapid fg/bg
      lastRun.current = now;
      syncNotifications(timesRef.current, dateString, completed, locale, enabled);
    });
    return () => sub.remove();
  }, [dateString, completed, locale, enabled]);
}
