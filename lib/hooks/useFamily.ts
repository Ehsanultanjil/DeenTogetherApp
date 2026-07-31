import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { computePrayerTimes, locationDateString, type CalcMethodKey, type MadhabKey, type WaqtName, type WaqtWindow } from '../prayerTimes';
import { WAQT_ORDER } from '../../constants/waqt';

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

export type CompletionMap = Record<WaqtName, boolean>;
const EMPTY_COMPLETION: CompletionMap = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };

export type FamilyPrayerGridMember = {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  hasLocation: boolean;
  // This member's OWN waqt windows (their location/calc settings), not the
  // viewer's — null when they haven't set a location yet, so the UI can show
  // a muted/unknown state instead of guessing a false "missed".
  windows: WaqtWindow[] | null;
  // This member's own prayer-location timezone — needed to tell whether
  // THEIR Dhuhr is landing on a Friday (Jumu'ah), independently of the
  // viewer's own day/timezone.
  timeZone: string | null;
  completion: CompletionMap;
};

type FamilyPrayerGridRow = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  last_latitude: number | null;
  last_longitude: number | null;
  calc_method: string | null;
  madhab: string | null;
  safety_margin_minutes: number;
  logs: { prayer_date: string; prayer_name: WaqtName; completed: boolean }[];
};

// Query returns only JSON-safe primitives (numbers/strings/plain objects) —
// never Date instances. This cache is written to AsyncStorage as JSON by
// PersistQueryClientProvider (app/_layout.tsx has no per-query exclusion),
// which silently turns any Date into an ISO string; a rehydrated-but-not-
// yet-refetched read would then hand a string where a Date was expected.
// computePrayerTimes (which produces real Dates) is deliberately run OUTSIDE
// this query, in useFamilyPrayerGrid's useMemo below, so the persisted cache
// never holds a Date to begin with.
function useFamilyPrayerGridRaw(familyId: string | null) {
  return useQuery({
    // Renamed from the original 'familyPrayerGrid' key: that key may still
    // hold an old persisted cache entry from before this hook was split
    // (shape: transformed Member[] with Date-turned-strings) — a fresh key
    // sidesteps reading that stale/wrong-shaped entry entirely.
    queryKey: ['familyPrayerGridRaw', familyId],
    enabled: !!familyId,
    refetchInterval: false,
    queryFn: async (): Promise<FamilyPrayerGridRow[]> => {
      const { data, error } = await supabase.rpc('get_family_prayer_grid', { p_family_id: familyId! });
      if (error) throw error;
      return (data ?? []) as unknown as FamilyPrayerGridRow[];
    },
  });
}

export function useFamilyPrayerGrid(familyId: string | null) {
  const { data: rows, ...rest } = useFamilyPrayerGridRaw(familyId);
  const data = useMemo<FamilyPrayerGridMember[] | undefined>(() => {
    if (!rows) return undefined;
    return rows.map((row) => {
      const hasLocation = row.last_latitude != null && row.last_longitude != null;
      if (!hasLocation) {
        return {
          userId: row.user_id,
          fullName: row.full_name,
          avatarUrl: row.avatar_url,
          role: row.role,
          hasLocation: false,
          windows: null,
          timeZone: null,
          completion: { ...EMPTY_COMPLETION },
        };
      }
      const times = computePrayerTimes({
        latitude: row.last_latitude!,
        longitude: row.last_longitude!,
        calcMethod: (row.calc_method as CalcMethodKey) ?? 'MuslimWorldLeague',
        madhab: (row.madhab as MadhabKey) ?? 'shafii',
        safetyMarginMinutes: row.safety_margin_minutes ?? 0,
      });
      const memberDateString = locationDateString(times.timeZone);
      const completion = { ...EMPTY_COMPLETION };
      for (const log of row.logs ?? []) {
        if (log.prayer_date === memberDateString && WAQT_ORDER.includes(log.prayer_name)) {
          completion[log.prayer_name] = log.completed;
        }
      }
      return {
        userId: row.user_id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        role: row.role,
        hasLocation: true,
        windows: times.windows,
        timeZone: times.timeZone,
        completion,
      };
    });
  }, [rows]);
  return { ...rest, data };
}

function useInvalidateFamilyQueries() {
  const queryClient = useQueryClient();
  const userId = useUserId();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['memberships', userId] });
    queryClient.invalidateQueries({ queryKey: ['currentFamilyId', userId] });
    queryClient.invalidateQueries({ queryKey: ['familyTodayStatus'] });
    queryClient.invalidateQueries({ queryKey: ['familyPrayerGridRaw'] });
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
