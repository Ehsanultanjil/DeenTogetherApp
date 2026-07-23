import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { runOrQueue } from '../sync/runOrQueue';

export async function applyAvatarUpdate(payload: { userId: string; avatarUrl: string }) {
  const { error } = await supabase.from('profiles').update({ avatar_url: payload.avatarUrl }).eq('id', payload.userId);
  if (error) throw error;
}

export function useAvatar() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['avatar', userId];

  const query = useQuery({
    queryKey,
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
      const payload = { userId, avatarUrl };
      await runOrQueue({ kind: 'updateAvatar', payload, run: () => applyAvatarUpdate(payload) });
    },
    onMutate: async (avatarUrl) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string | null>(queryKey);
      queryClient.setQueryData(queryKey, avatarUrl);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      // Own avatar shows up in family lists too.
      queryClient.invalidateQueries({ queryKey: ['familyTodayStatus'] });
    },
  });

  return {
    avatarUrl: query.data ?? null,
    setAvatar: mutation.mutate,
  };
}
