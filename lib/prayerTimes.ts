import { CalculationMethod, CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from 'adhan';
import tzlookup from 'tz-lookup';

export type CalcMethodKey = keyof typeof CalculationMethod;
export type MadhabKey = 'hanafi' | 'maliki' | 'shafii' | 'hanbali';
export type WaqtName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const CALC_METHOD_LABELS: Record<CalcMethodKey, string> = {
  MuslimWorldLeague: 'Muslim World League',
  Egyptian: 'Egyptian General Authority',
  Karachi: 'University of Islamic Sciences, Karachi (Recommended for Bangladesh)',
  UmmAlQura: 'Umm al-Qura, Makkah',
  Dubai: 'Dubai',
  MoonsightingCommittee: 'Moonsighting Committee',
  NorthAmerica: 'ISNA (North America)',
  Kuwait: 'Kuwait',
  Qatar: 'Qatar',
  Singapore: 'Singapore',
  Tehran: 'Tehran',
  Turkey: 'Diyanet (Turkey)',
  Other: 'Other',
};

export const MADHAB_LABELS: Record<MadhabKey, string> = {
  hanafi: 'Hanafi',
  maliki: 'Maliki',
  shafii: "Shafi'i",
  hanbali: 'Hanbali',
};

export const SAFETY_MARGIN_OPTIONS = [0, 1, 2, 3, 4, 5] as const;
export type SafetyMarginMinutes = (typeof SAFETY_MARGIN_OPTIONS)[number];
export const DEFAULT_SAFETY_MARGIN_MINUTES: SafetyMarginMinutes = 1;

// adhan only models two Asr juristic rules (1x vs 2x shadow length).
// Maliki/Shafi'i/Hanbali share the "standard" 1x calculation; Hanafi uses 2x.
function toAdhanMadhab(madhab: MadhabKey) {
  return madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
}

export type WaqtWindow = { name: WaqtName; start: Date; end: Date };

export type MakruhKey = 'sunrise' | 'istiwa' | 'sunset';
export type MakruhWindow = { key: MakruhKey; start: Date; end: Date };

export type DayPrayerTimes = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  sunset: Date;
  maghrib: Date;
  isha: Date;
  windows: WaqtWindow[];
  makruh: MakruhWindow[];
  // IANA zone for the prayer location itself — NOT necessarily the device's
  // own timezone (e.g. testing with mocked GPS, or a misconfigured device
  // clock). All display formatting must use this, not the device default.
  timeZone: string;
};

function locationDateParts(timeZone: string, reference: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference);
  return {
    year: Number(parts.find((p) => p.type === 'year')!.value),
    month: Number(parts.find((p) => p.type === 'month')!.value),
    day: Number(parts.find((p) => p.type === 'day')!.value),
  };
}

// adhan reads a Date's LOCAL getFullYear/getMonth/getDate to pick which
// calendar day to compute. If the device's own timezone differs from the
// prayer location's (mocked GPS during dev, travel, misconfigured clock),
// we still need the LOCATION's calendar day, not the device's. Build a
// Date whose local Y/M/D getters return the location's wall-clock day.
function locationCalendarDay(timeZone: string, reference: Date): Date {
  const { year, month, day } = locationDateParts(timeZone, reference);
  return new Date(year, month - 1, day);
}

// "YYYY-MM-DD" for the location's own calendar day — used as the
// `prayer_date` key so a completion row lines up with whichever day is
// actually shown as "today" in the UI, not the device's or DB server's day.
export function locationDateString(timeZone: string, reference: Date = new Date()): string {
  const { year, month, day } = locationDateParts(timeZone, reference);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Adds the user's Prayer Time Safety Margin on top of adhan's exact
// astronomical result. Sunrise/sunset are informational (not a waqt start)
// and are never shifted — only the five waqt boundaries are.
function addMinutes(d: Date, minutes: number): Date {
  return minutes ? new Date(d.getTime() + minutes * 60_000) : d;
}

function withSafetyMargin(pt: PrayerTimes, safetyMarginMinutes: number) {
  return {
    fajr: addMinutes(pt.fajr, safetyMarginMinutes),
    sunrise: pt.sunrise,
    dhuhr: addMinutes(pt.dhuhr, safetyMarginMinutes),
    asr: addMinutes(pt.asr, safetyMarginMinutes),
    sunset: pt.sunset,
    maghrib: addMinutes(pt.maghrib, safetyMarginMinutes),
    isha: addMinutes(pt.isha, safetyMarginMinutes),
  };
}

export function computePrayerTimes(params: {
  latitude: number;
  longitude: number;
  date?: Date;
  calcMethod?: CalcMethodKey;
  madhab?: MadhabKey;
  safetyMarginMinutes?: number;
}): DayPrayerTimes {
  const {
    latitude,
    longitude,
    date = new Date(),
    calcMethod = 'MuslimWorldLeague',
    madhab = 'shafii',
    safetyMarginMinutes = 0,
  } = params;

  const timeZone = tzlookup(latitude, longitude);
  const coordinates = new Coordinates(latitude, longitude);
  const calcParams: CalculationParameters = CalculationMethod[calcMethod]();
  calcParams.madhab = toAdhanMadhab(madhab);
  // adhan's default (MiddleOfTheNight) and its own HighLatitudeRule.recommended()
  // (SeventhOfTheNight above 48°) both drifted 45-97min from aladhan.com's
  // reference for London in July; TwilightAngle matched it to the minute —
  // verified against api.aladhan.com for MWL/Shafi, London, 21 Jul 2026.
  calcParams.highLatitudeRule = HighLatitudeRule.TwilightAngle;

  const today = locationCalendarDay(timeZone, date);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // adhan computes the exact astronomical times first, unmodified — the
  // safety margin is applied only in this post-processing step below, never
  // fed back into CalculationParameters.
  const pt = withSafetyMargin(new PrayerTimes(coordinates, today, calcParams), safetyMarginMinutes);
  const ptTomorrow = withSafetyMargin(new PrayerTimes(coordinates, tomorrow, calcParams), safetyMarginMinutes);

  const windows: WaqtWindow[] = [
    { name: 'fajr', start: pt.fajr, end: pt.sunrise },
    { name: 'dhuhr', start: pt.dhuhr, end: pt.asr },
    { name: 'asr', start: pt.asr, end: pt.maghrib },
    { name: 'maghrib', start: pt.maghrib, end: pt.isha },
    { name: 'isha', start: pt.isha, end: ptTomorrow.fajr },
  ];

  const MIN = 60 * 1000;
  const makruh: MakruhWindow[] = [
    { key: 'sunrise', start: pt.sunrise, end: new Date(pt.sunrise.getTime() + 15 * MIN) },
    { key: 'istiwa', start: new Date(pt.dhuhr.getTime() - 10 * MIN), end: pt.dhuhr },
    { key: 'sunset', start: new Date(pt.sunset.getTime() - 15 * MIN), end: pt.sunset },
  ];

  return {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    sunset: pt.sunset,
    maghrib: pt.maghrib,
    isha: pt.isha,
    windows,
    makruh,
    timeZone,
  };
}

export function getCurrentWaqt(windows: WaqtWindow[], now: Date = new Date()) {
  const nowMs = now.getTime();

  // Between midnight and today's Fajr, it's still *last night's* Isha —
  // but `windows` only covers today, so the last element (today's Isha,
  // ending at *tomorrow's* Fajr) would otherwise be picked as the
  // fallback, making remaining time balloon to ~24h+ too long. The
  // correct end boundary here is today's Fajr start.
  if (nowMs < windows[0].start.getTime()) {
    const isha = windows[windows.length - 1];
    const remainingMs = windows[0].start.getTime() - nowMs;
    return {
      current: { name: isha.name, start: isha.start, end: windows[0].start },
      remainingMs: remainingMs > 0 ? remainingMs : 0,
    };
  }

  let current = windows[windows.length - 1];
  for (const w of windows) {
    if (nowMs >= w.start.getTime()) current = w;
  }
  const remainingMs = current.end.getTime() - nowMs;
  return { current, remainingMs: remainingMs > 0 ? remainingMs : 0 };
}

export function getCurrentMakruh(makruh: MakruhWindow[], now: Date = new Date()): MakruhWindow | null {
  const nowMs = now.getTime();
  return makruh.find((m) => nowMs >= m.start.getTime() && nowMs < m.end.getTime()) ?? null;
}

// True between local midnight and today's real Fajr — the gap where last
// night's Isha is still open but hasn't yet rolled into "today".
export function isBeforeTodayFajr(times: DayPrayerTimes, now: Date = new Date()): boolean {
  return now.getTime() < times.windows[0].start.getTime();
}

export function formatTime(d: Date, timeZone?: string, localeTag?: string) {
  return d.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit', timeZone });
}

export function formatCountdown(ms: number, digits: (v: string | number) => string = String) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => digits(String(n).padStart(2, '0'))).join(':');
}
