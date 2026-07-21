import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    AsyncStorage.setItem(STORAGE_KEY, locale).catch(() => {});
  },
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') {
        set({ locale: saved });
      }
    } finally {
      set({ hydrated: true });
    }
  },
}));
