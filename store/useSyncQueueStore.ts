import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PrayerSettingsPatch } from '../lib/hooks/usePrayerSettings';

const STORAGE_KEY = 'deentogether.syncQueue';
const MAX_ATTEMPTS = 5;

export type QueuedAction =
  | { id: string; kind: 'prayerToggle'; payload: { userId: string; prayerDate: string; prayerName: string; completed: boolean }; createdAt: number; attempts: number }
  | { id: string; kind: 'quranToggle'; payload: { userId: string; date: string; completed: boolean }; createdAt: number; attempts: number }
  | { id: string; kind: 'updatePrayerSettings'; payload: { userId: string; patch: PrayerSettingsPatch }; createdAt: number; attempts: number }
  | { id: string; kind: 'updateNotificationSettings'; payload: { userId: string; enabled: boolean }; createdAt: number; attempts: number }
  | { id: string; kind: 'updateFullName'; payload: { userId: string; fullName: string }; createdAt: number; attempts: number }
  | { id: string; kind: 'updateAvatar'; payload: { userId: string; avatarUrl: string }; createdAt: number; attempts: number };

type SyncQueueState = {
  queue: QueuedAction[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  enqueue: (action: Omit<QueuedAction, 'id' | 'createdAt' | 'attempts'>) => void;
  dequeue: (id: string) => void;
  bumpAttempts: (id: string) => void;
};

function persist(queue: QueuedAction[]) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue)).catch(() => {});
}

// Persisted FIFO outbox of offline mutations. Every queued action stores
// the FINAL desired state (not a delta), so replaying it after a crash or
// a partially-completed sync is always safe to repeat — re-applying "set
// completed=true" twice is a no-op the second time.
export const useSyncQueueStore = create<SyncQueueState>((set, get) => ({
  queue: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ queue: JSON.parse(raw) as QueuedAction[] });
      }
    } catch {
      // Corrupt/unreadable queue — start empty rather than block startup.
    } finally {
      set({ hydrated: true });
    }
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
}));

export { MAX_ATTEMPTS };
