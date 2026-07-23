import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { runOrQueue } from '../sync/runOrQueue';

export async function applyNotificationSettingsUpdate(payload: { userId: string; enabled: boolean }) {
  const { error } = await supabase.from('profiles').update({ notifications_enabled: payload.enabled }).eq('id', payload.userId);
  if (error) throw error;
}

export function useNotificationSettings() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['notificationSettings', userId];

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('notifications_enabled')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data?.notifications_enabled ?? true;
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (!userId) return;
      const payload = { userId, enabled: next };
      await runOrQueue({ kind: 'updateNotificationSettings', payload, run: () => applyNotificationSettingsUpdate(payload) });
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<boolean>(queryKey);
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    enabled: query.data ?? true,
    isLoading: query.isLoading,
    setEnabled: mutation.mutate,
  };
}
