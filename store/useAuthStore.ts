import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const CACHE_AUTH_KEY = 'deentogether.authSession';

type AuthState = {
  session: Session | null;
  initialized: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_AUTH_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as Session;
        if (cached?.user?.id) {
          set({ session: cached });
        }
      }
    } catch {
      // Ignore cache read failures
    } finally {
      set({ hydrated: true });
    }
  },

  setSession: async (session) => {
    set({ session });
    try {
      if (session) {
        await AsyncStorage.setItem(CACHE_AUTH_KEY, JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem(CACHE_AUTH_KEY);
      }
    } catch {
      // Ignore cache write failures
    }
  },

  setInitialized: (initialized) => set({ initialized }),

  signOut: async () => {
    set({ session: null });
    try {
      await AsyncStorage.removeItem(CACHE_AUTH_KEY);
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    }
  },
}));
