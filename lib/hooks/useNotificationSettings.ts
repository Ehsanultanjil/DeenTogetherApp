import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { runOrQueue } from '../sync/runOrQueue';
import type { WaqtName } from '../prayerTimes';

export type WaqtNotificationPreferences = Record<WaqtName, boolean>;

export const DEFAULT_WAQT_PREFERENCES: WaqtNotificationPreferences = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

const MASTER_CACHE_KEY = 'deentogether.notifications_master';
const WAQT_CACHE_KEY = 'deentogether.waqt_notifications';

export async function applyNotificationSettingsUpdate(payload: { userId: string; enabled: boolean }) {
  const { error } = await supabase
    .from('profiles')
    .update({ notifications_enabled: payload.enabled })
    .eq('id', payload.userId);
  if (error) throw error;
}

export function useNotificationSettings() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['notificationSettings', userId];

  const [masterEnabled, setMasterEnabled] = useState(true);
  const [waqtPrefs, setWaqtPrefs] = useState<WaqtNotificationPreferences>(DEFAULT_WAQT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  // Hydrate preferences from AsyncStorage so offline & guest use works instantly
  useEffect(() => {
    (async () => {
      try {
        const [rawMaster, rawWaqts] = await Promise.all([
          AsyncStorage.getItem(MASTER_CACHE_KEY),
          AsyncStorage.getItem(WAQT_CACHE_KEY),
        ]);
        if (rawMaster !== null) {
          setMasterEnabled(rawMaster === 'true');
        }
        if (rawWaqts) {
          setWaqtPrefs((prev) => ({ ...prev, ...JSON.parse(rawWaqts) }));
        }
      } catch {
        // use defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('notifications_enabled')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      const val = data?.notifications_enabled ?? true;
      setMasterEnabled(val);
      AsyncStorage.setItem(MASTER_CACHE_KEY, String(val)).catch(() => {});
      return val;
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      setMasterEnabled(next);
      await AsyncStorage.setItem(MASTER_CACHE_KEY, String(next));
      if (!userId) return;
      const payload = { userId, enabled: next };
      await runOrQueue({
        kind: 'updateNotificationSettings',
        payload,
        run: () => applyNotificationSettingsUpdate(payload),
      });
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<boolean>(queryKey);
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
        setMasterEnabled(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const setEnabled = (val: boolean) => {
    setMasterEnabled(val);
    AsyncStorage.setItem(MASTER_CACHE_KEY, String(val)).catch(() => {});
    if (userId) {
      mutation.mutate(val);
    }
  };

  const toggleWaqt = (waqt: WaqtName, val: boolean) => {
    setWaqtPrefs((prev) => {
      const updated = { ...prev, [waqt]: val };
      AsyncStorage.setItem(WAQT_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  return {
    enabled: userId ? (query.data ?? masterEnabled) : masterEnabled,
    waqtPrefs,
    isLoading: !loaded && query.isLoading,
    setEnabled,
    toggleWaqt,
  };
}
