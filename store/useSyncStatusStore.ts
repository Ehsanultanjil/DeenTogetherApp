import { create } from 'zustand';

export type SyncStatus = 'synced' | 'syncing' | 'offline';

type SyncStatusState = {
  status: SyncStatus;
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  setStatus: (status: SyncStatus) => void;
};

// Not persisted — recomputed fresh from NetInfo + queue state on every
// launch, not something that needs to survive a restart.
export const useSyncStatusStore = create<SyncStatusState>((set, get) => ({
  status: 'synced',
  isOnline: true,
  setOnline: (online) => {
    set({ isOnline: online, status: online ? get().status : 'offline' });
  },
  setStatus: (status) => set({ status }),
}));
