import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { runOrQueue } from '../sync/runOrQueue';

export async function applyQuranToggle(payload: { userId: string; date: string; completed: boolean }) {
  const { error } = await supabase.from('daily_deeds').upsert(
    {
      user_id: payload.userId,
      deed_date: payload.date,
      deed_type: 'quran',
      completed: payload.completed,
      completed_at: payload.completed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,deed_date,deed_type' },
  );
  if (error) throw error;
}

// Mirrors useTodayPrayerLogs' shape, minus the ensure-rows step — a missing
// daily_deeds row simply means "not done", no placeholder rows needed.
export function useTodayQuranLog(dateString: string | null) {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['todayQuran', userId, dateString];

  const query = useQuery({
    queryKey,
    enabled: !!userId && !!dateString,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('daily_deeds')
        .select('completed')
        .eq('user_id', userId!)
        .eq('deed_date', dateString!)
        .eq('deed_type', 'quran')
        .maybeSingle();
      if (error) throw error;
      return data?.completed ?? false;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      const payload = { userId: userId!, date: dateString!, completed };
      await runOrQueue({ kind: 'quranToggle', payload, run: () => applyQuranToggle(payload) });
    },
    onMutate: async (completed) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<boolean>(queryKey);
      queryClient.setQueryData(queryKey, completed);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['monthlyStats', userId] });
      queryClient.invalidateQueries({ queryKey: ['monthlyDayStatus', userId] });
    },
  });

  return {
    completed: query.data ?? false,
    isLoading: query.isLoading,
    toggle: (next: boolean) => toggleMutation.mutate(next),
  };
}
