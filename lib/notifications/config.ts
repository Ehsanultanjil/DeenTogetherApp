import * as Notifications from 'expo-notifications';
import type { WaqtName } from '../prayerTimes';
import type { Locale } from '../../store/useLocaleStore';

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

export const PRAYER_CHANNEL_ID = 'prayer-updates';

export const WAQT_ORDER: WaqtName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function notificationIdFor(waqt: WaqtName) {
  return `prayer-waqt-${waqt}`;
}

export type PrayerNotificationData = {
  waqt: WaqtName;
  dateString: string;
  locale: Locale;
};

const WAQT_LABEL: Record<WaqtName, { en: string; bn: string }> = {
  fajr: { en: 'Fajr', bn: 'ফজর' },
  dhuhr: { en: 'Dhuhr', bn: 'যুহর' },
  asr: { en: 'Asr', bn: 'আসর' },
  maghrib: { en: 'Maghrib', bn: 'মাগরিব' },
  isha: { en: 'Isha', bn: 'ইশা' },
};

const STARTED_SUFFIX: Record<Locale, string> = {
  en: 'time has started',
  bn: 'সময় শুরু হয়েছে',
};

const MISSED_SUFFIX: Record<Locale, string> = {
  en: 'missed',
  bn: 'মিস হয়েছে',
};

export function waqtLabel(waqt: WaqtName, locale: Locale) {
  return WAQT_LABEL[waqt][locale];
}

export function startedLine(waqt: WaqtName, locale: Locale) {
  return `${waqtLabel(waqt, locale)} ${STARTED_SUFFIX[locale]}`;
}

export function missedLine(waqt: WaqtName, locale: Locale) {
  return `${waqtLabel(waqt, locale)} ${MISSED_SUFFIX[locale]}`;
}
