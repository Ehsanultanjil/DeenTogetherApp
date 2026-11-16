import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { runOrQueue } from '../sync/runOrQueue';
import { DEFAULT_SAFETY_MARGIN_MINUTES, type CalcMethodKey, type MadhabKey, type SafetyMarginMinutes } from '../prayerTimes';

export type PrayerSettings = { calcMethod: CalcMethodKey; madhab: MadhabKey; safetyMarginMinutes: SafetyMarginMinutes };

const GUEST_SETTINGS_KEY = 'deentogether.guestPrayerSettings';

const DEFAULT_SETTINGS: PrayerSettings = {
  calcMethod: 'Karachi',
  madhab: 'hanafi',
  safetyMarginMinutes: DEFAULT_SAFETY_MARGIN_MINUTES,
};

export type PrayerSettingsPatch = Partial<{ calc_method: string; madhab: string; safety_margin_minutes: number }>;

export async function applyPrayerSettingsUpdate(payload: { userId: string; patch: PrayerSettingsPatch }) {
  const { error } = await supabase.from('profiles').update(payload.patch).eq('id', payload.userId);
  if (error) throw error;
}

export function usePrayerSettings() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['prayerSettings', userId ?? 'guest'];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<PrayerSettings> => {
      if (!userId) {
        try {
          const raw = await AsyncStorage.getItem(GUEST_SETTINGS_KEY);
          if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        } catch {
          // Ignore parse errors
        }
        return DEFAULT_SETTINGS;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('calc_method, madhab, safety_margin_minutes')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return {
        calcMethod: (data?.calc_method as CalcMethodKey) ?? DEFAULT_SETTINGS.calcMethod,
        madhab: (data?.madhab as MadhabKey) ?? DEFAULT_SETTINGS.madhab,
        safetyMarginMinutes: (data?.safety_margin_minutes as SafetyMarginMinutes) ?? DEFAULT_SETTINGS.safetyMarginMinutes,
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: Partial<PrayerSettings>) => {
      if (!userId) {
        const current = query.data ?? DEFAULT_SETTINGS;
        const updated = { ...current, ...next };
        await AsyncStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(updated));
        return;
      }
      const patch = {
        ...(next.calcMethod ? { calc_method: next.calcMethod } : {}),
        ...(next.madhab ? { madhab: next.madhab } : {}),
        ...(next.safetyMarginMinutes !== undefined ? { safety_margin_minutes: next.safetyMarginMinutes } : {}),
      };
      const payload = { userId, patch };
      await runOrQueue({ kind: 'updatePrayerSettings', payload, run: () => applyPrayerSettingsUpdate(payload) });
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PrayerSettings>(queryKey);
      queryClient.setQueryData(queryKey, (old?: PrayerSettings) => ({ ...(old ?? DEFAULT_SETTINGS), ...next }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    settings: query.data ?? DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    updateSettings: mutation.mutate,
  };
}
