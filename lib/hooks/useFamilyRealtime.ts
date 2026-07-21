import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

// RLS scopes what a subscriber can actually receive, so we don't need to
// filter by family membership client-side — a family member simply won't
// get postgres_changes events for rows they can't SELECT.
export function useFamilyRealtime(familyId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!familyId) return;

    const channel = supabase
      .channel(`family-${familyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['familyTodayStatus', familyId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_members' }, () => {
        queryClient.invalidateQueries({ queryKey: ['familyTodayStatus', familyId] });
        queryClient.invalidateQueries({ queryKey: ['memberships'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, queryClient]);
}
