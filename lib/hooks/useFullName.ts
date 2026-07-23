import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { runOrQueue } from '../sync/runOrQueue';

export async function applyFullNameUpdate(payload: { userId: string; fullName: string }) {
  const { error } = await supabase.from('profiles').update({ full_name: payload.fullName }).eq('id', payload.userId);
  if (error) throw error;
  const { error: authError } = await supabase.auth.updateUser({ data: { full_name: payload.fullName } });
  if (authError) throw authError;
}

export function useFullName() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const queryKey = ['fullName', userId];

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase.from('profiles').select('full_name').eq('id', userId!).maybeSingle();
      if (error) throw error;
      return data?.full_name ?? '';
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: string) => {
      if (!userId) return;
      const payload = { userId, fullName: next };
      await runOrQueue({ kind: 'updateFullName', payload, run: () => applyFullNameUpdate(payload) });
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string>(queryKey);
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
    fullName: query.data ?? '',
    isLoading: query.isLoading,
    updateFullName: mutation.mutate,
    isSaving: mutation.isPending,
    isError: mutation.isError,
  };
}
