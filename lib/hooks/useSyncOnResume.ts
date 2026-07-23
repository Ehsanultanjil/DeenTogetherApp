import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useSyncStatusStore } from '../../store/useSyncStatusStore';
import { runSync } from '../sync/syncEngine';

const FAMILY_QUERY_KEYS = ['memberships', 'currentFamilyId', 'familyTodayStatus'];

// Drives the "on every launch and resume" sequence: cached data is already
// on screen by the time this runs (see useLocationStore/query persistence),
// so none of this needs to block anything — it just quietly refreshes GPS,
// pulls fresh family data, and flushes the offline queue once a connection
// is confirmed.
export function useSyncOnResume() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const lastRun = useRef(0);

  const resync = async () => {
    const now = Date.now();
    if (now - lastRun.current < 5000) return; // avoid thrashing on rapid fg/bg
    lastRun.current = now;

    const netState = await NetInfo.fetch();
    const online = !!netState.isConnected && netState.isInternetReachable !== false;
    useSyncStatusStore.getState().setOnline(online);
    if (!online) return;

    await useLocationStore.getState().refresh(userId);
    for (const key of FAMILY_QUERY_KEYS) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
    await runSync(queryClient);
  };

  useEffect(() => {
    resync();
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') resync();
    });
    const netInfoSub = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
      const wasOnline = useSyncStatusStore.getState().isOnline;
      useSyncStatusStore.getState().setOnline(online);
      if (online && !wasOnline) resync();
    });
    return () => {
      appStateSub.remove();
      netInfoSub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}
