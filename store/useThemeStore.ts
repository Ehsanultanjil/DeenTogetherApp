import { create } from 'zustand';
import { colorScheme } from 'nativewind';
import { readPersisted, writePersisted } from '../lib/storePersistence';

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
    writePersisted(STORAGE_KEY, mode);
  },
  hydrate: async () => {
    const saved = await readPersisted(STORAGE_KEY, (raw) => (raw === 'light' || raw === 'dark' ? raw : null));
    const mode = saved ?? 'dark';
    colorScheme.set(mode);
    set({ mode, hydrated: true });
  },
}));
