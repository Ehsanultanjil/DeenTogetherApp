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
    mutationFn: async (vars: { fullName: string; avatarUrl: string; gender: string }) => {
      if (!userId) return;
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: vars.fullName, avatar_url: vars.avatarUrl, gender: vars.gender, onboarding_completed: true })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      // Set synchronously rather than just invalidating — avatar.tsx
      // navigates to /(tabs) in this same onSuccess, which re-runs root
      // layout's redirect effect immediately. invalidateQueries alone only
      // schedules a refetch (a network round-trip), so that effect could
      // still read the stale onboardingCompleted=false for one more render
      // and bounce the user straight back to /onboarding/name — landing
      // them back on the name/avatar screens right after finishing them.
      queryClient.setQueryData(['onboardingStatus', userId], true);
      queryClient.invalidateQueries({ queryKey: ['avatar', userId] });
    },
  });
}
