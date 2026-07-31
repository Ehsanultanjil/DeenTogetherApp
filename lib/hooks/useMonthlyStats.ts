import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

export type MonthlyStats = {
  prayersDone: number;
  daysTracked: number;
  bestStreak: number;
  monthProgress: number;
  quranDays: number;
};

export type DayStatus = 'all' | 'some' | 'none' | 'excused';
export type DayInfo = { status: DayStatus; quranDone: boolean };

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function useMonthlyStats(year: number, month: number, targetUserId?: string) {
  const ownUserId = useAuthStore((s) => s.session?.user.id);
  const userId = targetUserId ?? ownUserId;
  return useQuery({
    queryKey: ['monthlyStats', userId, year, month],
    enabled: !!userId && Number.isFinite(year) && Number.isFinite(month),
    queryFn: async (): Promise<MonthlyStats> => {
      const { data, error } = await supabase.rpc('get_monthly_stats', {
        p_user_id: userId!,
        p_year: year,
        p_month: month,
      });
      if (error) throw error;
      const row = data?.[0];
      return {
        prayersDone: row?.prayers_done ?? 0,
        daysTracked: row?.days_tracked ?? 0,
        bestStreak: row?.best_streak ?? 0,
        monthProgress: row?.month_progress ?? 0,
        quranDays: row?.quran_days ?? 0,
      };
    },
  });
}

// PostgREST has no arbitrary GROUP BY, and a month is at most ~155 rows
// (31 days x 5 prayers) — fetch raw and aggregate client-side rather than
// add another RPC just for this. Quran rows for the month are at most 31,
// fetched alongside and merged into the same per-day map.
export function useMonthlyDayStatus(year: number, month: number, targetUserId?: string) {
  const ownUserId = useAuthStore((s) => s.session?.user.id);
  const userId = targetUserId ?? ownUserId;
  const startDate = `${year}-${pad(month)}-01`;
  const endDate = month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`;

  return useQuery({
    queryKey: ['monthlyDayStatus', userId, year, month],
    enabled: !!userId,
    queryFn: async (): Promise<Record<number, DayInfo>> => {
      const [prayerResult, quranResult] = await Promise.all([
        supabase
          .from('prayer_logs')
          .select('prayer_date, completed')
          .eq('user_id', userId!)
          .gte('prayer_date', startDate)
          .lt('prayer_date', endDate),
        supabase
          .from('daily_deeds')
          .select('deed_date')
          .eq('user_id', userId!)
          .eq('deed_type', 'quran')
          .eq('completed', true)
          .gte('deed_date', startDate)
          .lt('deed_date', endDate),
      ]);
      if (prayerResult.error) throw prayerResult.error;
      if (quranResult.error) throw quranResult.error;

      const byDay = new Map<number, { total: number; completed: number }>();
      for (const row of prayerResult.data ?? []) {
        const day = Number(row.prayer_date.slice(8, 10));
        const entry = byDay.get(day) ?? { total: 0, completed: 0 };
        entry.total += 1;
        if (row.completed) entry.completed += 1;
        byDay.set(day, entry);
      }

      const quranDays = new Set((quranResult.data ?? []).map((row) => Number(row.deed_date.slice(8, 10))));

      const result: Record<number, DayInfo> = {};
      for (const [day, { total, completed }] of byDay) {
        const status: DayStatus = completed === total && total > 0 ? 'all' : completed > 0 ? 'some' : 'none';
        result[day] = { status, quranDone: quranDays.has(day) };
      }
      return result;
    },
  });
}
