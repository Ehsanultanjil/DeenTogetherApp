import type { WaqtName } from '../prayerTimes';
import type { Locale } from '../../store/useLocaleStore';

// Android only — iOS has no equivalent of an always-updating, action-button
// notification without Live Activities (a separate native project).
export const PRAYER_CHANNEL_ID = 'prayer-updates';
export const PRAYER_CATEGORY_ID = 'PRAYER_ACTIONS';
export const MARK_DONE_ACTION_ID = 'MARK_DONE';
export const BACKGROUND_NOTIFICATION_TASK = 'prayer-notification-response';

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
  return `❌ ${waqtLabel(waqt, locale)} ${MISSED_SUFFIX[locale]}`;
}
