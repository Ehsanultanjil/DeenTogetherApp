import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

// True once the account has email/password credentials set — either signed
// up that way originally, or a Google-only user who has since set one via
// useSetPassword below. False means Profile should offer "Create Password"
// instead of "Change Password".
export function useHasPassword() {
  const identities = useAuthStore((s) => s.session?.user.identities);
  return (identities ?? []).some((i) => i.provider === 'email');
}

export function useSetPassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      if (data?.ok !== true) throw new Error('Account deletion failed');
    },
  });
}
