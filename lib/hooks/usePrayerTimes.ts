import { useEffect, useMemo, useState } from 'react';
import { useLocation } from './useLocation';
import { computePrayerTimes, type CalcMethodKey, type MadhabKey } from '../prayerTimes';

export function usePrayerTimes(settings: { calcMethod: CalcMethodKey; madhab: MadhabKey }) {
  const { coords, status } = useLocation();
  const [tick, setTick] = useState(() => Date.now());

  // Recompute periodically so the calc naturally picks up day rollover —
  // cheap enough to just rerun rather than trying to detect the location's
  // own midnight from the device's clock (that mismatch is exactly what
  // caused the original day-selection bug).
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(() => {
    if (!coords) return null;
    return computePrayerTimes({
      latitude: coords.latitude,
      longitude: coords.longitude,
      date: new Date(tick),
      calcMethod: settings.calcMethod,
      madhab: settings.madhab,
    });
  }, [coords?.latitude, coords?.longitude, tick, settings.calcMethod, settings.madhab]);

  return { times, locationStatus: status, coords };
}
