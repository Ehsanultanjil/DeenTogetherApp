import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import type { Coords } from './useLocation';

const CACHE_KEY = 'deentogether.lastLocationName';

type PlaceName = { area: string | null; district: string | null };

// Rounding to ~1km buckets means panning slightly indoors doesn't trigger a
// fresh (network-bound) reverse-geocode call every time.
function cacheKeyFor(coords: Coords) {
  return `${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`;
}

export function useLocationName(coords: Coords | null) {
  const [place, setPlace] = useState<PlaceName | null>(null);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    const key = cacheKeyFor(coords);

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as { key: string; place: PlaceName };
          if (cached.key === key && !cancelled) setPlace(cached.place);
        }
      } catch {
        // ignore — fall through to a fresh lookup
      }

      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        if (!address) return;
        const next: PlaceName = {
          area: address.district ?? address.subregion ?? address.name ?? null,
          district: address.city ?? address.region ?? null,
        };
        if (!cancelled) setPlace(next);
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ key, place: next })).catch(() => {});
      } catch {
        // No network / geocoder unavailable — caller falls back to the
        // offline nearest-district label.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coords?.latitude, coords?.longitude]);

  return place;
}
