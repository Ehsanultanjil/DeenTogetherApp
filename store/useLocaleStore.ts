import { create } from 'zustand';
import { readPersisted, writePersisted } from '../lib/storePersistence';

export type Locale = 'bn' | 'en';

const STORAGE_KEY = 'deentogether.locale';

type LocaleState = {
  locale: Locale;
  hydrated: boolean;
  setLocale: (locale: Locale) => void;
  hydrate: () => Promise<void>;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'bn',
  hydrated: false,
  setLocale: (locale) => {
    set({ locale });
    writePersisted(STORAGE_KEY, locale);
  },
  hydrate: async () => {
    const saved = await readPersisted(STORAGE_KEY, (raw) => (raw === 'bn' || raw === 'en' ? raw : null));
    if (saved) set({ locale: saved });
    set({ hydrated: true });
  },
}));
