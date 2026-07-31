import { create } from 'zustand';
import type { PrayerSettingsPatch } from '../lib/hooks/usePrayerSettings';
import { clearPersisted, readPersisted, writePersisted } from '../lib/storePersistence';

const STORAGE_KEY = 'deentogether.syncQueue';
const MAX_ATTEMPTS = 5;

export type QueuedAction =
  | { id: string; kind: 'prayerToggle'; payload: { userId: string; prayerDate: string; prayerName: string; completed: boolean }; createdAt: number; attempts: number }
  | { id: string; kind: 'quranToggle'; payload: { userId: string; date: string; completed: boolean }; createdAt: number; attempts: number }
  | { id: string; kind: 'updatePrayerSettings'; payload: { userId: string; patch: PrayerSettingsPatch }; createdAt: number; attempts: number }
  | { id: string; kind: 'updateNotificationSettings'; payload: { userId: string; enabled: boolean }; createdAt: number; attempts: number }
  | { id: string; kind: 'updateFullName'; payload: { userId: string; fullName: string }; createdAt: number; attempts: number }
  | { id: string; kind: 'updateAvatar'; payload: { userId: string; avatarUrl: string }; createdAt: number; attempts: number }
  | { id: string; kind: 'updateLocation'; payload: { userId: string; latitude: number; longitude: number }; createdAt: number; attempts: number };

type SyncQueueState = {
  queue: QueuedAction[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  enqueue: (action: Omit<QueuedAction, 'id' | 'createdAt' | 'attempts'>) => void;
  dequeue: (id: string) => void;
  bumpAttempts: (id: string) => void;
  // Called on sign-out — queued writes are keyed to the account that made
  // them, so replaying them under a different signed-in user would just
  // fail RLS's user_id = auth.uid() check and burn retries for nothing.
  reset: () => void;
};

function persist(queue: QueuedAction[]) {
  writePersisted(STORAGE_KEY, JSON.stringify(queue));
}

// Persisted FIFO outbox of offline mutations. Every queued action stores
// the FINAL desired state (not a delta), so replaying it after a crash or
// a partially-completed sync is always safe to repeat — re-applying "set
// completed=true" twice is a no-op the second time.
export const useSyncQueueStore = create<SyncQueueState>((set, get) => ({
  queue: [],
  hydrated: false,

  hydrate: async () => {
    const queue = await readPersisted(STORAGE_KEY, (raw) => JSON.parse(raw) as QueuedAction[]);
    if (queue) set({ queue });
    set({ hydrated: true });
  },

  enqueue: (action) => {
    const next: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      attempts: 0,
    } as QueuedAction;
    const queue = [...get().queue, next];
    set({ queue });
    persist(queue);
  },

  dequeue: (id) => {
    const queue = get().queue.filter((a) => a.id !== id);
    set({ queue });
    persist(queue);
  },

  bumpAttempts: (id) => {
    const queue = get().queue.map((a) => (a.id === id ? { ...a, attempts: a.attempts + 1 } : a));
    set({ queue });
    persist(queue);
  },

  reset: () => {
    set({ queue: [] });
    clearPersisted(STORAGE_KEY);
  },
}));

export { MAX_ATTEMPTS };
