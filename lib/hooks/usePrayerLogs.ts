import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { runOrQueue } from '../sync/runOrQueue';
import type { WaqtName } from '../prayerTimes';

export type CompletionMap = Record<WaqtName, boolean>;

const EMPTY_COMPLETION: CompletionMap = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

// Shared by both mutations below AND the offline sync engine (which
// replays queued actions with no React tree present) — one real
// implementation of "write a prayer's completion state".
export async function applyPrayerToggle(payload: {
  userId: string;
  prayerDate: string;
  prayerName: string;
  completed: boolean;
}) {
  const { error } = await supabase
    .from('prayer_logs')
    .update({ completed: payload.completed, completed_at: payload.completed ? new Date().toISOString() : null })
    .eq('user_id', payload.userId)
    .eq('prayer_date', payload.prayerDate)
    .eq('prayer_name', payload.prayerName);
  if (error) throw error;
}

export function useTodayPrayerLogs(dateString: string | null) {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['todayPrayers', userId, dateString];

  const query = useQuery({
    queryKey,
    enabled: !!userId && !!dateString,
    queryFn: async (): Promise<CompletionMap> => {
      await supabase.rpc('ensure_today_prayer_rows', { p_date: dateString! });
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('prayer_name, completed')
        .eq('user_id', userId!)
        .eq('prayer_date', dateString!);
      if (error) throw error;
      const map = { ...EMPTY_COMPLETION };
      for (const row of data ?? []) {
        map[row.prayer_name as WaqtName] = row.completed;
      }
      return map;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ name, completed }: { name: WaqtName; completed: boolean }) => {
      const payload = { userId: userId!, prayerDate: dateString!, prayerName: name, completed };
      await runOrQueue({ kind: 'prayerToggle', payload, run: () => applyPrayerToggle(payload) });
    },
    onMutate: async ({ name, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CompletionMap>(queryKey);
      queryClient.setQueryData(queryKey, (old?: CompletionMap) => ({ ...(old ?? EMPTY_COMPLETION), [name]: completed }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats', userId] });
    },
  });

  return {
    completed: query.data ?? EMPTY_COMPLETION,
    isLoading: query.isLoading,
    toggle: (name: WaqtName, next: boolean) => toggleMutation.mutate({ name, completed: next }),
  };
}

