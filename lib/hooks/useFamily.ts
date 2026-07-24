import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { WaqtName } from '../prayerTimes';

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
  current_prayer_completed: boolean;
  last_reminded_at: string | null;
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

export function useFamilyTodayStatus(familyId: string | null, currentPrayer: WaqtName | null = null) {
  return useQuery({
    queryKey: ['familyTodayStatus', familyId, currentPrayer],
    enabled: !!familyId,
    refetchInterval: false,
    queryFn: async (): Promise<FamilyMemberStatus[]> => {
      const { data, error } = await supabase.rpc('get_family_today_status', {
        p_family_id: familyId!,
        p_current_prayer: currentPrayer ?? undefined,
      });
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

export type PendingJoinRequest = {
  id: string;
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export function usePendingJoinRequests(familyId: string | null, isAdmin: boolean) {
  return useQuery({
    queryKey: ['pendingJoinRequests', familyId],
    enabled: !!familyId && isAdmin,
    queryFn: async (): Promise<PendingJoinRequest[]> => {
      const { data, error } = await supabase.rpc('get_pending_join_requests', { p_family_id: familyId! });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
      }));
    },
  });
}

export function useRespondToJoinRequest() {
  const invalidate = useInvalidateFamilyQueries();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { requestId: string; approve: boolean }) => {
      const { error } = await supabase.rpc('respond_to_join_request', {
        p_request_id: vars.requestId,
        p_approve: vars.approve,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['pendingJoinRequests'] });
    },
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

export function usePromoteMember() {
  const invalidate = useInvalidateFamilyQueries();
  return useMutation({
    mutationFn: async (vars: { familyId: string; newAdminId: string }) => {
      const { error } = await supabase.rpc('promote_member', {
        p_family_id: vars.familyId,
        p_new_admin_id: vars.newAdminId,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteFamily() {
  const invalidate = useInvalidateFamilyQueries();
  return useMutation({
    mutationFn: async (familyId: string) => {
      const { error } = await supabase.rpc('delete_family', { p_family_id: familyId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
