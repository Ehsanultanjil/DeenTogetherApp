import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { CompletionMap } from './usePrayerLogs';

const EMPTY_COMPLETION: CompletionMap = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

// Read-only lookup for an arbitrary past/future date — used by the calendar
// day-detail view. Unlike useTodayPrayerLogs this never calls
// ensure_today_prayer_rows, so browsing a date with no logged prayers just
// shows everything as not-done instead of writing placeholder rows for it.
export function useDayPrayerLogs(dateString: string | null) {
  const userId = useAuthStore((s) => s.session?.user.id);

  const query = useQuery({
    queryKey: ['dayPrayers', userId, dateString],
    enabled: !!userId && !!dateString,
    queryFn: async (): Promise<CompletionMap> => {
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('prayer_name, completed')
        .eq('user_id', userId!)
        .eq('prayer_date', dateString!);
      if (error) throw error;
      const map = { ...EMPTY_COMPLETION };
      for (const row of data ?? []) {
        map[row.prayer_name as keyof CompletionMap] = row.completed;
      }
      return map;
    },
  });

  return { completed: query.data ?? EMPTY_COMPLETION, isLoading: query.isLoading };
}
