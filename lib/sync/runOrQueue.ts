import { useSyncQueueStore, type QueuedAction } from '../../store/useSyncQueueStore';
import { useSyncStatusStore } from '../../store/useSyncStatusStore';
import { looksLikeNetworkError } from './networkError';

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
type QueueInput = DistributiveOmit<QueuedAction, 'id' | 'createdAt' | 'attempts'>;

type RunOrQueueArgs = QueueInput & { run: () => Promise<void> };

// Every offline-safe mutation's mutationFn is a one-line call to this: runs
// the real write immediately if online, otherwise (or on a network-shaped
// failure encountered while "online") queues it for the next sync instead
// of surfacing an error. The caller's own onMutate has already applied the
// optimistic UI update, so there's nothing left for the user to see fail.
export async function runOrQueue({ kind, payload, run }: RunOrQueueArgs) {
  const { isOnline } = useSyncStatusStore.getState();
  if (!isOnline) {
    useSyncQueueStore.getState().enqueue({ kind, payload } as QueueInput);
    return;
  }
  try {
    await run();
  } catch (err) {
    if (looksLikeNetworkError(err)) {
      useSyncQueueStore.getState().enqueue({ kind, payload } as QueueInput);
      return;
    }
    throw err;
  }
}
