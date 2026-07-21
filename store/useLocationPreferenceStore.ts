import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocationPreference = { mode: 'gps' } | { mode: 'manual'; districtId: string };

const STORAGE_KEY = 'deentogether.locationPreference';

type LocationPreferenceState = {
  preference: LocationPreference;
  hydrated: boolean;
  setPreference: (preference: LocationPreference) => void;
  hydrate: () => Promise<void>;
};

export const useLocationPreferenceStore = create<LocationPreferenceState>((set) => ({
  preference: { mode: 'gps' },
  hydrated: false,
  setPreference: (preference) => {
    set({ preference });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preference)).catch(() => {});
  },
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LocationPreference;
        if (parsed && (parsed.mode === 'gps' || parsed.mode === 'manual')) {
          set({ preference: parsed });
        }
      }
    } finally {
      set({ hydrated: true });
    }
  },
}));
