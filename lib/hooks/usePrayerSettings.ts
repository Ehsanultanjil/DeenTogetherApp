import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { CalcMethodKey, MadhabKey } from '../prayerTimes';

export type PrayerSettings = { calcMethod: CalcMethodKey; madhab: MadhabKey };

const DEFAULT_SETTINGS: PrayerSettings = { calcMethod: 'MuslimWorldLeague', madhab: 'hanafi' };

export function usePrayerSettings() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['prayerSettings', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PrayerSettings> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('calc_method, madhab')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return {
        calcMethod: (data?.calc_method as CalcMethodKey) ?? DEFAULT_SETTINGS.calcMethod,
        madhab: (data?.madhab as MadhabKey) ?? DEFAULT_SETTINGS.madhab,
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: Partial<PrayerSettings>) => {
      if (!userId) return;
      const { error } = await supabase
        .from('profiles')
        .update({
          ...(next.calcMethod ? { calc_method: next.calcMethod } : {}),
          ...(next.madhab ? { madhab: next.madhab } : {}),
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerSettings', userId] });
    },
  });

  return {
    settings: query.data ?? DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    updateSettings: mutation.mutate,
  };
}
