import * as Notifications from 'expo-notifications';
import type { WaqtName } from '../prayerTimes';
import type { Locale } from '../../store/useLocaleStore';
import { WAQT_ORDER, waqtDisplayKey } from '../../constants/waqt';
import { translate } from '../i18n/translations';

export { WAQT_ORDER };

// Without this, expo-notifications' default behavior is to show NOTHING
// while the app is in the foreground (its own docs: "the default behavior
// when the handler is not set... is not to show the notification") — this
// is why prayer-time notifications never appeared as a popup while the app
// was open. Module-scope so it runs once, as early as this file is first
// imported (usePrayerNotifications, on Home mount).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Bumped from 'prayer-updates' to 'prayer-updates-v2' when the ALARM audio
// stream was added: Android locks a channel's sound/importance/audio
// settings at creation — calling setNotificationChannelAsync again with new
// settings on an ID that already exists on-device is a no-op. A new ID is
// the only way to actually apply the change for already-installed users.
export const PRAYER_CHANNEL_ID = 'prayer-updates-v2';

// How many days ahead (including today) get their waqts pre-scheduled as
// local OS alarms every sync — so a user who's offline or doesn't open the
// app for a couple weeks still gets notified. 15 days x 5 waqts = 75
// concurrently scheduled alarms, well under Android's hard per-app ceiling
// of 500 concurrent AlarmManager alarms (IllegalStateException: "Too many
// alarms (500) registered"), with headroom to spare. Bump to 30 if wanted —
// still only 150, safely under the ceiling — just note every additional day
// adds 5 more cancel+reschedule calls to each sync.
export const NOTIFICATION_LOOKAHEAD_DAYS = 15;

// Date-scoped so today's and tomorrow's identifiers never collide — needed
// now that syncNotifications also schedules tomorrow's Fajr ahead of time
// (see usePrayerNotifications.ts) so notifications survive at least one day
// of the app not being opened, instead of silently stopping after today.
export function notificationIdFor(waqt: WaqtName, dateString: string) {
  return `prayer-waqt-${dateString}-${waqt}`;
}

export type PrayerNotificationData = {
  waqt: WaqtName;
  dateString: string;
  locale: Locale;
};

const STARTED_SUFFIX: Record<Locale, string> = {
  en: 'time has started',
  bn: 'সময় শুরু হয়েছে',
};

const MISSED_SUFFIX: Record<Locale, string> = {
  en: 'missed',
  bn: 'মিস হয়েছে',
};

// Android already shows the app's own name/icon in the notification's OS
// chrome — repeating "DeenTogether" as our own title just doubled it up.
export const PRAYER_TIME_TITLE: Record<Locale, string> = {
  en: 'Prayer Time',
  bn: 'নামাজের সময় হয়েছে',
};

// Reuses the single translations source of truth (constants/waqt.ts's
// WAQT_KEY maps a waqt to its translation key) instead of a second
// hardcoded English/Bengali label map that could silently drift from it —
// this is a plain function, not the useT() hook, so it works from
// notification-scheduling code that isn't inside a component tree.
// isJummah says the Dhuhr this notification/line is FOR fell on a Friday —
// callers decide that from that specific waqt's own window date, not
// "today" in general (a scheduled tomorrow-Fajr call has no bearing on it).
export function waqtLabel(waqt: WaqtName, locale: Locale, isJummah = false) {
  return translate(locale, waqtDisplayKey(waqt, isJummah));
}

export function startedLine(waqt: WaqtName, locale: Locale, isJummah = false) {
  return `${waqtLabel(waqt, locale, isJummah)} ${STARTED_SUFFIX[locale]}`;
}

export function missedLine(waqt: WaqtName, locale: Locale, isJummah = false) {
  return `${waqtLabel(waqt, locale, isJummah)} ${MISSED_SUFFIX[locale]}`;
}
