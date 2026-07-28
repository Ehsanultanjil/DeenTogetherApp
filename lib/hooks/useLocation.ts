import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationPreferenceStore } from '../../store/useLocationPreferenceStore';
import { useLocationStore } from '../../store/useLocationStore';
import { BANGLADESH_DISTRICTS } from '../bangladeshDistricts';

export type { Coords, LocationStatus } from '../../store/useLocationStore';

// Thin wrapper over the shared useLocationStore — kept so every existing
// consumer (usePrayerTimes.ts, index.tsx, family.tsx, ...) needs no changes.
// The store itself is what makes coords available instantly on cold start
// (hydrated from AsyncStorage before first paint) and shared across every
// screen instead of each independently re-fetching GPS on mount.
export function useLocation() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const preference = useLocationPreferenceStore((s) => s.preference);
  const coords = useLocationStore((s) => s.coords);
  const status = useLocationStore((s) => s.status);
  const setManualCoords = useLocationStore((s) => s.setManualCoords);
  const refresh = useLocationStore((s) => s.refresh);

  useEffect(() => {
    if (preference.mode === 'manual') {
      const district = BANGLADESH_DISTRICTS.find((d) => d.id === preference.districtId);
      if (district) {
        setManualCoords({ latitude: district.latitude, longitude: district.longitude }, userId);
        return;
      }
    }
    refresh(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, preference]);

  return { coords, status };
}
