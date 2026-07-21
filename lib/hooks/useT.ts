import { useLocaleStore } from '../../store/useLocaleStore';
import { translate, type TranslationKey } from '../i18n/translations';
import { localeTag, toLocaleDigits } from '../i18n/format';

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return {
    t: (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    locale,
    setLocale,
    localeTag: localeTag(locale),
    n: (value: string | number) => toLocaleDigits(value, locale),
  };
}
