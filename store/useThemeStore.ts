import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'deentogether.theme';

type ThemeState = {
  mode: ThemeMode;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  hydrate: () => Promise<void>;
};

// NativeWind's own colorScheme is in-memory only (resets to "system" on every
// launch) — we persist the user's manual choice ourselves and just drive
// NativeWind's scheme as a side effect so `dark:`-class-based styling reacts.
export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  hydrated: false,
  setMode: (mode) => {
    set({ mode });
    colorScheme.set(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  },
  hydrate: async () => {
    let mode: ThemeMode = 'dark';
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') mode = saved;
    } finally {
      colorScheme.set(mode);
      set({ mode, hydrated: true });
    }
  },
}));
