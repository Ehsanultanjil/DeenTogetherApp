import { create } from 'zustand';
import { readPersisted, writePersisted } from '../lib/storePersistence';

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
    writePersisted(STORAGE_KEY, JSON.stringify(preference));
  },
  hydrate: async () => {
    const saved = await readPersisted(STORAGE_KEY, (raw) => {
      const parsed = JSON.parse(raw) as LocationPreference;
      return parsed && (parsed.mode === 'gps' || parsed.mode === 'manual') ? parsed : null;
    });
    if (saved) set({ preference: saved });
    set({ hydrated: true });
  },
}));
