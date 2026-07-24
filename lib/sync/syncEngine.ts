import type { QueryClient } from '@tanstack/react-query';
import { useSyncQueueStore, MAX_ATTEMPTS, type QueuedAction } from '../../store/useSyncQueueStore';
import { useSyncStatusStore } from '../../store/useSyncStatusStore';
import { applyPrayerToggle } from '../hooks/usePrayerLogs';
import { applyQuranToggle } from '../hooks/useQuranLog';
import { applyPrayerSettingsUpdate } from '../hooks/usePrayerSettings';
import { applyNotificationSettingsUpdate } from '../hooks/useNotificationSettings';
import { applyFullNameUpdate } from '../hooks/useFullName';
import { applyAvatarUpdate } from '../hooks/useAvatar';

function looksLikeNetworkError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /network|fetch|timeout|offline|failed to connect/i.test(message);
}

async function apply(action: QueuedAction): Promise<void> {
  switch (action.kind) {
    case 'prayerToggle':
      return applyPrayerToggle(action.payload);
    case 'quranToggle':
      return applyQuranToggle(action.payload);
    case 'updatePrayerSettings':
      return applyPrayerSettingsUpdate(action.payload);
    case 'updateNotificationSettings':
      return applyNotificationSettingsUpdate(action.payload);
    case 'updateFullName':
      return applyFullNameUpdate(action.payload);
    case 'updateAvatar':
      return applyAvatarUpdate(action.payload);
  }
}

const INVALIDATE_KEYS: Record<QueuedAction['kind'], string[]> = {
  prayerToggle: 'todayPrayers,streak,monthlyStats'.split(','),
  quranToggle: 'todayQuran,monthlyStats,monthlyDayStatus'.split(','),
  updatePrayerSettings: ['prayerSettings'],
  updateNotificationSettings: ['notificationSettings'],
  updateFullName: ['fullName'],
  updateAvatar: ['avatar', 'familyTodayStatus'],
};

// Drains the offline queue FIFO — called on app launch/resume and on
// reconnect (see useSyncOnResume.ts). Queued actions each set an absolute
// final value, so replaying one that (unbeknownst to us) already partly
// landed before an app kill is always safe to just repeat.
export async function runSync(queryClient: QueryClient) {
  // Defense in depth against the queue-loss bug this class of code already
  // caused once: never trust the in-memory queue is populated without
  // confirming AsyncStorage has actually been read back into it first.
  if (!useSyncQueueStore.getState().hydrated) {
    await useSyncQueueStore.getState().hydrate();
  }

  const { queue, dequeue, bumpAttempts } = useSyncQueueStore.getState();
  if (queue.length === 0) {
    useSyncStatusStore.getState().setStatus('synced');
    return;
  }

  useSyncStatusStore.getState().setStatus('syncing');

  for (const action of [...queue]) {
    try {
      await apply(action);
      dequeue(action.id);
      for (const key of INVALIDATE_KEYS[action.kind]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    } catch (err) {
      if (looksLikeNetworkError(err)) {
        // Offline again mid-drain — stop here, leave the rest queued for
        // the next resume/reconnect trigger.
        useSyncStatusStore.getState().setStatus('offline');
        return;
      }
      // Genuine server-side rejection — don't let one bad action block
      // everything behind it forever; drop it after a few retries.
      if (action.attempts + 1 >= MAX_ATTEMPTS) {
        dequeue(action.id);
      } else {
        bumpAttempts(action.id);
      }
    }
  }

  useSyncStatusStore.getState().setStatus('synced');
}
