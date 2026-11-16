import { create } from 'zustand';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { runOrQueue } from '../lib/sync/runOrQueue';
import { clearPersisted, readPersisted, writePersisted } from '../lib/storePersistence';

export type Coords = { latitude: number; longitude: number };
export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';

const CACHE_KEY = 'deentogether.lastCoords';
const DEFAULT_DHAKA_COORDS: Coords = { latitude: 23.8103, longitude: 90.4125 };

// Below this, a fresh GPS fix is treated as "hasn't really moved" — skips
// the update entirely so prayer times/notifications don't needlessly
// recompute/reschedule off of ordinary GPS jitter.
const MOVED_THRESHOLD_METERS = 500;

export async function applyLocationUpdate(payload: { userId: string; latitude: number; longitude: number }) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_latitude: payload.latitude, last_longitude: payload.longitude })
    .eq('id', payload.userId);
  if (error) throw error;
}

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
  setManualCoords: (coords: Coords, userId?: string) => void;
  // Silently fetches a fresh fix (permission + GPS, falling back to the
  // last coords saved server-side for a fresh install, and cached fix offline).
  refresh: (userId: string | undefined) => Promise<void>;
  // Retains device-level geographic location on sign-out so guest users and
  // offline sessions continue seeing prayer times without interruption.
  reset: () => void;
};

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  status: 'loading',
  hydrated: false,

  hydrate: async () => {
    try {
      const cached = await readPersisted(CACHE_KEY, (raw) => JSON.parse(raw) as Coords);
      if (cached && typeof cached.latitude === 'number' && typeof cached.longitude === 'number') {
        set({ coords: cached, status: 'granted' });
      }
    } catch {
      // ignore
    } finally {
      set({ hydrated: true });
    }
  },

  setManualCoords: (coords, userId) => {
    set({ coords, status: 'granted' });
    writePersisted(CACHE_KEY, JSON.stringify(coords));
    if (userId) {
      const payload = { userId, latitude: coords.latitude, longitude: coords.longitude };
      runOrQueue({ kind: 'updateLocation', payload, run: () => applyLocationUpdate(payload) }).catch(() => {});
    }
  },

  refresh: async (userId) => {
    // If coords are already available in cache/memory, ensure status is granted
    if (get().coords) {
      set({ status: 'granted' });
    }

    // Try server-side profile coords if logged in and no coords exist yet
    if (!get().coords && userId) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('last_latitude, last_longitude')
          .eq('id', userId)
          .maybeSingle();
        if (data?.last_latitude != null && data?.last_longitude != null) {
          const profileCoords = { latitude: data.last_latitude, longitude: data.last_longitude };
          set({ coords: profileCoords, status: 'granted' });
          writePersisted(CACHE_KEY, JSON.stringify(profileCoords));
        }
      } catch {
        // Fall through to OS GPS
      }
    }

    // Check location permission
    let hasPermission = false;
    try {
      const permCheck = await Location.getForegroundPermissionsAsync();
      if (permCheck.status === 'granted') {
        hasPermission = true;
      } else {
        const req = await Location.requestForegroundPermissionsAsync();
        hasPermission = req.status === 'granted';
      }
    } catch {
      hasPermission = false;
    }

    if (!hasPermission) {
      if (!get().coords) {
        // Fallback to Dhaka if no permission and no cache so prayer times never break
        set({ coords: DEFAULT_DHAKA_COORDS, status: 'denied' });
        writePersisted(CACHE_KEY, JSON.stringify(DEFAULT_DHAKA_COORDS));
      }
      return;
    }

    // Fast check: get OS cached last-known position first (works offline & indoors)
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown?.coords) {
        const fastCoords = { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude };
        const prev = get().coords;
        if (!prev || haversineMeters(prev, fastCoords) >= MOVED_THRESHOLD_METERS) {
          set({ coords: fastCoords, status: 'granted' });
          writePersisted(CACHE_KEY, JSON.stringify(fastCoords));
        }
      }
    } catch {
      // Continue to fresh GPS lookup
    }

    // Fresh GPS lookup with 8-second safety timeout
    try {
      const gpsPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Location timeout')), 8000)
      );

      const pos = (await Promise.race([gpsPromise, timeoutPromise])) as Location.LocationObject | null;
      if (pos?.coords) {
        const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        const previous = get().coords;

        if (!previous || haversineMeters(previous, next) >= MOVED_THRESHOLD_METERS) {
          set({ coords: next, status: 'granted' });
          writePersisted(CACHE_KEY, JSON.stringify(next));
          if (userId) {
            const payload = { userId, latitude: next.latitude, longitude: next.longitude };
            runOrQueue({ kind: 'updateLocation', payload, run: () => applyLocationUpdate(payload) }).catch(() => {});
          }
        } else {
          set({ status: 'granted' });
        }
      }
    } catch {
      // If GPS timed out or network is offline, keep using the cached location
      if (get().coords) {
        set({ status: 'granted' });
      } else {
        set({ coords: DEFAULT_DHAKA_COORDS, status: 'granted' });
        writePersisted(CACHE_KEY, JSON.stringify(DEFAULT_DHAKA_COORDS));
      }
    }
  },

  reset: () => {
    // Keep device-level physical coordinates on logout so offline prayer
    // computations remain functional for the device.
  },
}));
