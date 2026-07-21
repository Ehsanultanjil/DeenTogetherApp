import type { Locale } from './translations';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

// For values we build ourselves (padStart countdowns, plain numbers) rather
// than through Intl — Intl.toLocaleString/toLocaleTimeString already handle
// digit conversion natively for locales that use it.
export function toLocaleDigits(value: string | number, locale: Locale): string {
  const str = String(value);
  if (locale !== 'bn') return str;
  return str.replace(/[0-9]/g, (d) => BENGALI_DIGITS[Number(d)]);
}

export function localeTag(locale: Locale): string {
  return locale === 'bn' ? 'bn-BD' : 'en-US';
}
