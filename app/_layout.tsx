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

// Single source of truth for auth-based routing. Having every layout
// ((tabs), onboarding, and the login screen at "/") each decide
// independently whether to redirect based on session was fragile — if any
// two of them ever briefly disagreed during a fast transition (e.g. right
// after sign-out), they could ping-pong forever (reproduced: white/gray
// screen that never settled on logout). Centralizing it here, keyed off
// the current route segments, is the pattern expo-router's own docs use
// for exactly this reason.
function RootNavigation({ onReady }: { onReady: () => void }) {
  const router = useRouter();
  // useSegments() returns a new array every render even when its contents
  // are unchanged — depending on it directly in the effect below re-fires
  // router.replace() on unrelated re-renders, each call interrupting the
  // last one's in-flight transition (reproduced: navigation left stuck
  // mid-transition, tab bar unresponsive). Depend on the one primitive
  // value that actually matters instead.
  const group = useSegments()[0] as string | undefined;
  const session = useAuthStore((s) => s.session);
  const { data: onboardingCompleted, isLoading: onboardingLoading } = useOnboardingStatus();
  const reportedReady = useRef(false);

  useEffect(() => {
    // Every cold start mounts the Stack at "/" (index.tsx) first, no matter
    // the session — the redirect below only fires a beat later, once this
    // effect runs. That gap used to be visible as a flash of the login
    // screen before landing on the dashboard. RootLayout keeps the native
    // splash up until `onReady` fires, so nothing renders on screen until
    // we're already settled on the correct group.
    const reportReadyOnce = () => {
      if (!reportedReady.current) {
        reportedReady.current = true;
        onReady();
      }
    };

    const inTabs = group === '(tabs)';
    const inOnboarding = group === 'onboarding';

    if (!session) {
      // Logged out from a protected group: redirect back to login. This
      // MUST run here at the root, not from inside (tabs)/_layout: both
      // app/index.tsx and app/(tabs)/index.tsx resolve to the URL "/"
      // (route groups are invisible in the path), so a <Redirect href="/">
      // rendered *inside* the tabs group resolves to the nearest match —
      // (tabs)/index (Home) — never leaves the group, and re-fires forever
      // (reproduced: 3000+ navigations, a hard redirect loop). Fired from
      // the root navigator, "/" resolves to app/index.tsx (login) as
      // intended. The layout guards stay passive (render null) so they
      // don't compete.
      if (inTabs || inOnboarding) {
        router.replace('/');
        return;
      }
      reportReadyOnce();
      return;
    }

    if (onboardingLoading) return;

    if (onboardingCompleted === false) {
      if (!inOnboarding) {
        router.replace('/onboarding/language');
        return;
      }
      reportReadyOnce();
      return;
    }

    // Signed in and onboarded — the login screen ("/", no group) is only
    // useful while logged out.
    if (group === undefined) {
      router.replace('/(tabs)');
      return;
    }
    reportReadyOnce();
  }, [session, onboardingCompleted, onboardingLoading, group, router, onReady]);

  // app/index.tsx (login) and app/(tabs)/index.tsx (Home) BOTH resolve to
  // the URL "/" because route groups are invisible in the path. That made
  // "/" ambiguous: a logout redirect to "/" resolved to the Home tab
  // instead of login (blank screen / redirect loop). Gating the two on
  // session so only ONE exists at a time removes the ambiguity at its
  // source — "/" is login when logged out, Home when logged in. All other
  // routes are still auto-registered from the filesystem.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
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
    // getSession() reads from AsyncStorage — if that ever hangs (e.g. a
    // lock conflict with the background notification task also touching
    // it) or rejects, `initialized` must still become true, or the whole
    // app is stuck on the blank gate below forever (reproduced: a
    // permanently stuck black screen surviving even a device reboot).
    const timeout = new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 5000),
    );
    Promise.race([supabase.auth.getSession(), timeout])
      .catch(() => ({ data: { session: null } }))
      .then(({ data }) => {
        setSession(data.session);
        setInitialized(true);
      });
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // A second account signing in on the same device must not inherit the
      // previous user's cached location, queued offline writes (which would
      // just fail RLS's auth.uid() check under the new session), or cached
      // prayer/family query data.
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
        useLocationStore.getState().reset();
        useSyncQueueStore.getState().reset();
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
