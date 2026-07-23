import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { WaqtName } from '../prayerTimes';

// Mirrors send_prayer_reminder's server-side cooldown window — used
// client-side only to render the disabled "Reminder Sent" state; the RPC
// is what actually enforces it.
export const REMINDER_COOLDOWN_MS = 30 * 60 * 1000;

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

export function useSendReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { recipientId: string; prayerName: WaqtName; prayerDate: string }) => {
      const { error: rpcError } = await supabase.rpc('send_prayer_reminder', {
        p_recipient_id: vars.recipientId,
        p_prayer_name: vars.prayerName,
        p_prayer_date: vars.prayerDate,
      });
      if (rpcError) throw rpcError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Delivery is best-effort — the reminder is already recorded (and
      // cooldown/spam-proofed) by the RPC above regardless of whether the
      // push actually lands, so a function-invoke failure here isn't fatal.
      await supabase.functions
        .invoke('send-reminder', {
          body: {
            recipientId: vars.recipientId,
            prayerName: vars.prayerName,
            senderName: user?.user_metadata?.full_name ?? 'A family member',
          },
        })
        .catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyTodayStatus'] });
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
