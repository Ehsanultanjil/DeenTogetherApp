import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationPreferenceStore } from '../../store/useLocationPreferenceStore';
import { BANGLADESH_DISTRICTS } from '../bangladeshDistricts';

export type Coords = { latitude: number; longitude: number };
export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';

const CACHE_KEY = 'deentogether.lastCoords';

async function readLocalCache(): Promise<Coords | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Coords) : null;
  } catch {
    return null;
  }
}

function writeLocalCache(coords: Coords) {
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(coords)).catch(() => {});
}

export function useLocation() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const preference = useLocationPreferenceStore((s) => s.preference);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocationStatus>('loading');

  useEffect(() => {
    let mounted = true;

    // Manual city selection skips GPS/permissions entirely.
    if (preference.mode === 'manual') {
      const district = BANGLADESH_DISTRICTS.find((d) => d.id === preference.districtId);
      if (district) {
        setCoords({ latitude: district.latitude, longitude: district.longitude });
        setStatus('granted');
        return;
      }
    }

    async function loadRemoteCachedCoords() {
      if (!userId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('last_latitude, last_longitude')
        .eq('id', userId)
        .maybeSingle();
      if (data?.last_latitude != null && data?.last_longitude != null) {
        return { latitude: data.last_latitude, longitude: data.last_longitude };
      }
      return null;
    }

    (async () => {
      // Show whatever we last knew immediately — never block the home
      // screen on a fresh GPS fix. The real fix below silently replaces it
      // once it lands.
      const cached = (await readLocalCache()) ?? (await loadRemoteCachedCoords());
      if (mounted && cached) {
        setCoords(cached);
        setStatus('granted');
      }

      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== 'granted') {
        if (mounted && !cached) setStatus('denied');
        return;
      }

      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        if (mounted) {
          setCoords(next);
          setStatus('granted');
        }
        writeLocalCache(next);
        if (userId) {
          await supabase
            .from('profiles')
            .update({ last_latitude: next.latitude, last_longitude: next.longitude })
            .eq('id', userId);
        }
      } catch {
        // Fresh fix failed — keep showing the cached location rather than
        // downgrading a screen the user is already looking at.
        if (mounted && !cached) setStatus('error');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, preference]);

  return { coords, status };
}
