import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export type Coords = { latitude: number; longitude: number };
export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';

const CACHE_KEY = 'deentogether.lastCoords';

// Below this, a fresh GPS fix is treated as "hasn't really moved" — skips
// the update entirely so prayer times/notifications don't needlessly
// recompute/reschedule off of ordinary GPS jitter.
const MOVED_THRESHOLD_METERS = 500;

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type LocationState = {
  coords: Coords | null;
  status: LocationStatus;
  hydrated: boolean;
  // Reads the last cached fix from disk — called once from app/_layout.tsx's
  // startup gate (same convention as the other stores) so cached coords are
  // already in memory before the first screen ever paints.
  hydrate: () => Promise<void>;
  setManualCoords: (coords: Coords) => void;
  // Silently fetches a fresh fix (permission + GPS, falling back to the
  // last coords saved server-side for a fresh install). Never throws —
  // failures just leave whatever coords/status were already there.
  refresh: (userId: string | undefined) => Promise<void>;
};

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  status: 'loading',
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        set({ coords: JSON.parse(raw) as Coords, status: 'granted' });
      }
    } catch {
      // Fall through to the normal GPS/permission flow.
    } finally {
      set({ hydrated: true });
    }
  },

  setManualCoords: (coords) => {
    set({ coords, status: 'granted' });
  },

  refresh: async (userId) => {
    if (!get().coords && userId) {
      // No cache at all yet — try the last fix saved server-side before
      // asking the OS for permission, so a fresh install for a returning
      // user still opens with *something* instead of "finding location".
      // Guarded (unlike the rest of this branch used to be) so a flaky
      // request here can't violate this function's own "never throws"
      // contract and abort whatever called it (e.g. useSyncOnResume).
      try {
        const { data } = await supabase
          .from('profiles')
          .select('last_latitude, last_longitude')
          .eq('id', userId)
          .maybeSingle();
        if (data?.last_latitude != null && data?.last_longitude != null) {
          set({ coords: { latitude: data.last_latitude, longitude: data.last_longitude }, status: 'granted' });
        }
      } catch {
        // Fall through to the normal GPS/permission flow below.
      }
    }

    const { status: permission } = await Location.requestForegroundPermissionsAsync();
    if (permission !== 'granted') {
      if (!get().coords) set({ status: 'denied' });
      return;
    }

    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      const previous = get().coords;

      if (previous && haversineMeters(previous, next) < MOVED_THRESHOLD_METERS) {
        set({ status: 'granted' });
        return;
      }

      set({ coords: next, status: 'granted' });
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
      if (userId) {
        await supabase
          .from('profiles')
          .update({ last_latitude: next.latitude, last_longitude: next.longitude })
          .eq('id', userId);
      }
    } catch {
      if (!get().coords) set({ status: 'error' });
    }
  },
}));
