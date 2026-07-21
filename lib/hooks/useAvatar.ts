import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

export function useAvatar() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['avatar', userId],
    enabled: !!userId,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.from('profiles').select('avatar_url').eq('id', userId!).maybeSingle();
      if (error) throw error;
      return data?.avatar_url ?? null;
    },
  });

  const mutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!userId) return;
      const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatar', userId] });
      // Own avatar shows up in family lists too.
      queryClient.invalidateQueries({ queryKey: ['familyTodayStatus'] });
    },
  });

  return {
    avatarUrl: query.data ?? null,
    setAvatar: mutation.mutate,
  };
}
