import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';

export type Membership = {
  familyId: string;
  familyName: string;
  inviteCode: string;
  role: string;
};

export type FamilyMemberStatus = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  completed_count: number;
  percent: number;
};

function useUserId() {
  return useAuthStore((s) => s.session?.user.id);
}

export function useMyMemberships() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['memberships', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Membership[]> => {
      const { data, error } = await supabase
        .from('family_members')
        .select('role, family_id, families(id, name, invite_code)')
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? [])
        .filter((row) => row.families)
        .map((row) => ({
          familyId: row.families!.id,
          familyName: row.families!.name,
          inviteCode: row.families!.invite_code,
          role: row.role,
        }));
    },
  });
}

export function useCurrentFamilyId() {
  const userId = useUserId();
  return useQuery({
    queryKey: ['currentFamilyId', userId],
    enabled: !!userId,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_family_id')
        .eq('id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data?.current_family_id ?? null;
    },
  });
}

export function useFamilyTodayStatus(familyId: string | null) {
  return useQuery({
    queryKey: ['familyTodayStatus', familyId],
    enabled: !!familyId,
    refetchInterval: false,
    queryFn: async (): Promise<FamilyMemberStatus[]> => {
      const { data, error } = await supabase.rpc('get_family_today_status', { p_family_id: familyId! });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useInvalidateFamilyQueries() {
  const queryClient = useQueryClient();
  const userId = useUserId();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['memberships', userId] });
    queryClient.invalidateQueries({ queryKey: ['currentFamilyId', userId] });
    queryClient.invalidateQueries({ queryKey: ['familyTodayStatus'] });
  };
}

export function useCreateFamily() {
  const invalidate = useInvalidateFamilyQueries();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.rpc('create_family', { p_name: name });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useJoinFamily() {
  const invalidate = useInvalidateFamilyQueries();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc('join_family_by_code', { p_code: code });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useSwitchFamily() {
  const invalidate = useInvalidateFamilyQueries();
  return useMutation({
    mutationFn: async (familyId: string) => {
      const { error } = await supabase.rpc('switch_current_family', { p_family_id: familyId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useLeaveFamily() {
  const invalidate = useInvalidateFamilyQueries();
  return useMutation({
    mutationFn: async (familyId: string) => {
      const { error } = await supabase.rpc('leave_family', { p_family_id: familyId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
