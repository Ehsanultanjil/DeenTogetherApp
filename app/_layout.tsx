import '../global.css';

import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from '@expo-google-fonts/hind-siliguri';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useLocaleStore } from '../store/useLocaleStore';
import { useThemeStore } from '../store/useThemeStore';
import { useLocationPreferenceStore } from '../store/useLocationPreferenceStore';
import { useLocationStore } from '../store/useLocationStore';
import { useSyncQueueStore } from '../store/useSyncQueueStore';
import { useOnboardingStatus } from '../lib/hooks/useProfile';
import { ErrorBoundary } from '../components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

// Cached reads are shown immediately and refreshed in the background
// rather than blocking on a network round-trip — react-query's built-in
// "offlineFirst" mode does exactly this. gcTime is bumped well past the
// 5-minute default so persisted data isn't garbage-collected from memory
// before it's ever used again. staleTime defaults to 0, which meant every
// query refetched on every mount/reconnect on top of useSyncOnResume.ts's
// own manual invalidation on the same triggers — doubling up network calls
// on every app resume. Prayer/family data doesn't change fast enough to
// need that; a few minutes of staleness is invisible to the user.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { networkMode: 'offlineFirst', gcTime: 1000 * 60 * 60 * 24, staleTime: 1000 * 60 * 5 },
    mutations: { networkMode: 'offlineFirst' },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'deentogether.queryCache',
});

// Lets react-query's own online/offline bookkeeping (query pausing,
// offlineFirst behavior) reflect real connectivity instead of just
// `navigator.onLine` (which doesn't exist in React Native).
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected && state.isInternetReachable !== false);
  });
});

// Single source of truth for auth-based routing.
// In Guest-First mode, unauthenticated users can access the full app UI ((tabs),
// dua, calendar, today, etc.) without being forced to log in.
// Authenticated users who haven't completed onboarding are routed to /onboarding/language.
function RootNavigation({ onReady }: { onReady: () => void }) {
  const router = useRouter();
  const group = useSegments()[0] as string | undefined;
  const session = useAuthStore((s) => s.session);
  const { data: onboardingCompleted, isLoading: onboardingLoading } = useOnboardingStatus();
  const reportedReady = useRef(false);

  useEffect(() => {
    const reportReadyOnce = () => {
      if (!reportedReady.current) {
        reportedReady.current = true;
        onReady();
      }
    };

    const inOnboarding = group === 'onboarding';

    // Signed in: ensure profile onboarding is completed
    if (session) {
      if (onboardingLoading) return;

      if (onboardingCompleted === false) {
        if (!inOnboarding) {
          router.replace('/onboarding/language');
          return;
        }
        reportReadyOnce();
        return;
      }
    }

    // Guest: onboarding is only for accounts; redirect to tabs if in onboarding
    if (!session && inOnboarding) {
      router.replace('/(tabs)');
      return;
    }

    reportReadyOnce();
  }, [session, onboardingCompleted, onboardingLoading, group, router, onReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="qibla" options={{ presentation: 'card' }} />
      <Stack.Screen name="tasbih" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    MaterialSymbolsOutlined: require('../assets/fonts/MaterialSymbolsOutlined-Regular.ttf'),
    MaterialSymbolsOutlinedFilled: require('../assets/fonts/MaterialSymbolsOutlined-Filled.ttf'),
  });

  const initialized = useAuthStore((s) => s.initialized);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const setSession = useAuthStore((s) => s.setSession);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const localeHydrated = useLocaleStore((s) => s.hydrated);
  const themeHydrated = useThemeStore((s) => s.hydrated);
  const themeMode = useThemeStore((s) => s.mode);
  const locationPrefHydrated = useLocationPreferenceStore((s) => s.hydrated);
  const locationHydrated = useLocationStore((s) => s.hydrated);
  const [queryCacheRestored, setQueryCacheRestored] = useState(false);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    // Same escape hatch as the other readiness gates below — if
    // RootNavigation's effect never settles for some unforeseen reason,
    // the splash must not stay up forever.
    const timeout = setTimeout(() => setNavReady(true), 4000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Same class of bug as the getSession() race below — an AsyncStorage
    // read that hangs or a persister that never resolves must not leave
    // the app stuck on the blank splash gate forever.
    const timeout = setTimeout(() => setQueryCacheRestored(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Hydrate cached session first so offline restarts retain the user's
    // identity and logs without getting forced into logged-out state.
    useAuthStore.getState().hydrate().then(async () => {
      const timeout = new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 4000),
      );
      try {
        const { data } = await Promise.race([supabase.auth.getSession(), timeout]);
        if (data?.session) {
          await setSession(data.session);
        } else {
          // If Supabase returns no session, verify network connectivity before clearing.
          // Offline network errors during token refresh must not clear the cached session.
          const net = await NetInfo.fetch();
          const isOnline = !!net.isConnected && net.isInternetReachable !== false;
          if (isOnline) {
            await setSession(null);
          }
        }
      } catch {
        const net = await NetInfo.fetch();
        const isOnline = !!net.isConnected && net.isInternetReachable !== false;
        if (isOnline) {
          await setSession(null);
        }
      } finally {
        setInitialized(true);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await setSession(null);
        queryClient.clear();
        useLocationStore.getState().reset();
        useSyncQueueStore.getState().reset();
      } else if (session) {
        await setSession(session);
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, [setSession, setInitialized]);

  useEffect(() => {
    useLocaleStore.getState().hydrate();
    useThemeStore.getState().hydrate();
    useLocationPreferenceStore.getState().hydrate();
    useLocationStore.getState().hydrate();
    // The offline mutation queue is persisted to AsyncStorage but was never
    // being read back — every restart silently started with an empty queue,
    // so anything queued while offline was orphaned on disk and never
    // synced (reproduced: an offline prayer toggle reverting once back
    // online, because the write never actually reached the server).
    useSyncQueueStore.getState().hydrate();
  }, []);

  const readyToMount =
    (fontsLoaded || fontError) &&
    authHydrated &&
    initialized &&
    localeHydrated &&
    themeHydrated &&
    locationPrefHydrated &&
    locationHydrated &&
    queryCacheRestored;

  useEffect(() => {
    // Wait for navReady too — otherwise the splash lifts right as
    // RootNavigation's first effect is still deciding whether to redirect,
    // exposing a one-frame flash of whatever the Stack mounted at first
    // (index.tsx) before landing on the real destination.
    if (readyToMount && navReady) {
      SplashScreen.hide();
    }
  }, [readyToMount, navReady]);

  if (!readyToMount) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
            onSuccess={() => setQueryCacheRestored(true)}
            onError={() => setQueryCacheRestored(true)}
          >
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            <RootNavigation onReady={() => setNavReady(true)} />
          </PersistQueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
