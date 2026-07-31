import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

export type PeriodPause = { id: string; startDate: string; endDate: string | null };

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Own gender only — this is never fetched for another family member (no
// screen needs it), so there's no risk of it doubling as a way to look up
// someone else's gender.
export function useOwnGender() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const query = useQuery({
    queryKey: ['ownGender', userId],
    enabled: !!userId,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.from('profiles').select('gender').eq('id', userId!).maybeSingle();
      if (error) throw error;
      return data?.gender ?? null;
    },
  });
  return query.data ?? null;
}

// Private, self-only — RLS on period_pauses has no family-sharing policy at
// all, so this can only ever read the signed-in user's own rows. Never call
// this (or render anything it feeds) on another member's calendar view.
export function usePeriodPause() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['periodPause', userId];

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async (): Promise<PeriodPause | null> => {
      const { data, error } = await supabase
        .from('period_pauses')
        .select('id, start_date, end_date')
        .eq('user_id', userId!)
        .is('end_date', null)
        .maybeSingle();
      if (error) throw error;
      return data ? { id: data.id, startDate: data.start_date, endDate: data.end_date } : null;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['allPeriodPauses', userId] });
    queryClient.invalidateQueries({ queryKey: ['monthlyStats'] });
    queryClient.invalidateQueries({ queryKey: ['monthlyDayStatus'] });
    queryClient.invalidateQueries({ queryKey: ['streak'] });
  };

  const start = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('period_pauses')
        .insert({ user_id: userId!, start_date: todayDateString() });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const end = useMutation({
    mutationFn: async () => {
      if (!query.data) return;
      const { error } = await supabase
        .from('period_pauses')
        .update({ end_date: todayDateString() })
        .eq('id', query.data.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    activePause: query.data ?? null,
    isPaused: !!query.data,
    startPause: () => start.mutate(),
    endPause: () => end.mutate(),
  };
}

// All of the caller's own pause ranges (for the calendar's excused-day
// shading) — small, unbounded query is fine since a lifetime of monthly
// pauses is at most a few dozen rows.
export function useAllPeriodPauses() {
  const userId = useAuthStore((s) => s.session?.user.id);
  return useQuery({
    queryKey: ['allPeriodPauses', userId],
    enabled: !!userId,
    queryFn: async (): Promise<PeriodPause[]> => {
      const { data, error } = await supabase
        .from('period_pauses')
        .select('id, start_date, end_date')
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? []).map((row) => ({ id: row.id, startDate: row.start_date, endDate: row.end_date }));
    },
  });
}

export function isDateStringInAnyPause(dateString: string, pauses: PeriodPause[]): boolean {
  return pauses.some((p) => dateString >= p.startDate && (p.endDate === null || dateString <= p.endDate));
}
