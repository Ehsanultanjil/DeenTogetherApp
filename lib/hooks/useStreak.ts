import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

export function useStreak() {
  const userId = useAuthStore((s) => s.session?.user.id);

  const query = useQuery({
    queryKey: ['streak', userId],
    enabled: !!userId,
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('get_current_streak', { p_user_id: userId! });
      if (error) throw error;
      return data ?? 0;
    },
  });

  return query.data ?? 0;
}
