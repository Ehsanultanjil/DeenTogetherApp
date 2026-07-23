import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

export function useOnboardingStatus() {
  const userId = useAuthStore((s) => s.session?.user.id);

  return useQuery({
    queryKey: ['onboardingStatus', userId],
    enabled: !!userId,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data?.onboarding_completed ?? false;
    },
  });
}

export function useCompleteOnboarding() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { fullName: string; avatarUrl: string }) => {
      if (!userId) return;
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: vars.fullName, avatar_url: vars.avatarUrl, onboarding_completed: true })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingStatus', userId] });
      queryClient.invalidateQueries({ queryKey: ['avatar', userId] });
    },
  });
}
