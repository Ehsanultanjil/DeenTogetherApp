import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { PRAYER_CHANNEL_ID, PRAYER_TIME_TITLE, notificationIdFor, startedLine } from '../notifications/config';
import { getCurrentWaqt, isJummahDay, locationDateString, type DayPrayerTimes, type WaqtName } from '../prayerTimes';
import type { Locale } from '../../store/useLocaleStore';

const NOTIFICATION_ID_PREFIX = 'prayer-waqt-';

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
      // Routes the sound through the ALARM stream instead of the default
      // NOTIFICATION stream — ringer silent/vibrate mode only mutes the
      // ringtone/notification streams, never ALARM (same reason an alarm
      // clock still rings on silent). No permission needed for this; it's
      // separate from (and doesn't require) Do Not Disturb bypass access,
      // which only matters for an actual DND session, not ringer mode.
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
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
// (re)schedules every not-yet-fired waqt across the lookahead window (see
// syncNotifications). Local scheduled notifications can't wake JS in the
// background on delivery, so this is best-effort: it runs whenever the app
// is foregrounded / this data changes, not continuously. Cancels by
// identifier prefix rather than a fixed list of today's 5 ids since
// identifiers are now date-scoped and future days may also be pending.
async function cancelAllWaqtNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const presented = await Notifications.getPresentedNotificationsAsync();
  await Promise.all([
    ...scheduled
      .filter((notif) => notif.identifier.startsWith(NOTIFICATION_ID_PREFIX))
      .map((notif) => Notifications.cancelScheduledNotificationAsync(notif.identifier).catch(() => {})),
    ...presented.map((notif) => Notifications.dismissNotificationAsync(notif.request.identifier).catch(() => {})),
  ]);
}

// Never throws — this runs fire-and-forget from a useEffect and an AppState
// listener with nothing awaiting the result, so an unhandled rejection here
// (e.g. a transient OS/Notifications API failure) would otherwise surface
// as an unhandled promise rejection with no caller able to react to it.
async function syncNotifications(
  times: DayPrayerTimes,
  dateString: string,
  locale: Locale,
  enabled: boolean,
  upcomingDays: DayPrayerTimes[],
  waqtPrefs?: Record<WaqtName, boolean>,
) {
  try {
    if (!enabled) {
      await cancelAllWaqtNotifications();
      return;
    }

    const granted = (await Notifications.getPermissionsAsync()).status === 'granted';
    if (!granted) return;

    const now = new Date();
    const currentWaqt = getCurrentWaqt(times.windows, now).current.name;

    const presented = await Notifications.getPresentedNotificationsAsync();
    await Promise.all(
      presented
        .filter((notif) => {
          const data = notif.request.content.data as { waqt?: WaqtName } | undefined;
          return data?.waqt && (data.waqt !== currentWaqt || (waqtPrefs && waqtPrefs[data.waqt] === false));
        })
        .map((notif) => Notifications.dismissNotificationAsync(notif.request.identifier).catch(() => {})),
    );

    // Built as a flat list of independent (cancel, then schedule) tasks and
    // run concurrently — with NOTIFICATION_LOOKAHEAD_DAYS days x 5 waqts,
    // this can be 50-75+ native calls per sync; awaiting them one at a time
    // in a loop would make every app-open/prayer-toggle visibly slow.
    const tasks: (() => Promise<void>)[] = [];

    for (let i = 0; i < times.windows.length; i++) {
      const w = times.windows[i];
      if (w.start <= now) continue; // already fired or in the past — leave alone
      const identifier = notificationIdFor(w.name, dateString);
      if (waqtPrefs && waqtPrefs[w.name] === false) {
        tasks.push(async () => {
          await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
        });
        continue;
      }
      const body = startedLine(w.name, locale, isJummahDay(times.timeZone, w.start));
      tasks.push(async () => {
        await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: { title: PRAYER_TIME_TITLE[locale], body, data: { waqt: w.name, dateString, locale } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: w.start, channelId: PRAYER_CHANNEL_ID },
        });
      });
    }

    for (const day of upcomingDays) {
      const dayDateString = locationDateString(day.timeZone, day.windows[0].start);
      for (const w of day.windows) {
        if (w.start <= now) continue;
        const identifier = notificationIdFor(w.name, dayDateString);
        if (waqtPrefs && waqtPrefs[w.name] === false) {
          tasks.push(async () => {
            await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
          });
          continue;
        }
        const body = startedLine(w.name, locale, isJummahDay(day.timeZone, w.start));
        tasks.push(async () => {
          await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
          await Notifications.scheduleNotificationAsync({
            identifier,
            content: { title: PRAYER_TIME_TITLE[locale], body, data: { waqt: w.name, dateString: dayDateString, locale } },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: w.start, channelId: PRAYER_CHANNEL_ID },
          });
        });
      }
    }

    await Promise.all(tasks.map((task) => task()));
  } catch {
    // Best-effort — next foreground/data change gets another chance to sync.
  }
}

export function usePrayerNotifications(
  times: DayPrayerTimes | null,
  dateString: string | null,
  locale: Locale,
  enabled: boolean,
  upcomingDays: DayPrayerTimes[] = [],
  waqtPrefs?: Record<WaqtName, boolean>,
) {
  const lastRun = useRef(0);
  const timesRef = useRef(times);
  timesRef.current = times;
  const upcomingDaysRef = useRef(upcomingDays);
  upcomingDaysRef.current = upcomingDays;
  const waqtPrefsRef = useRef(waqtPrefs);
  waqtPrefsRef.current = waqtPrefs;

  const waqtPrefsKey = JSON.stringify(waqtPrefs);

  useEffect(() => {
    ensureSetup().catch(() => {});
  }, []);

  useEffect(() => {
    if (!timesRef.current || !dateString) return;
    syncNotifications(timesRef.current, dateString, locale, enabled, upcomingDaysRef.current, waqtPrefsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateString, locale, enabled, waqtPrefsKey]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !timesRef.current || !dateString) return;
      const now = Date.now();
      if (now - lastRun.current < 5000) return; // avoid thrashing on rapid fg/bg
      lastRun.current = now;
      syncNotifications(timesRef.current, dateString, locale, enabled, upcomingDaysRef.current, waqtPrefsRef.current);
    });
    return () => sub.remove();
  }, [dateString, locale, enabled, waqtPrefsKey]);
}
