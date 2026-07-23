import '../global.css';
import '../lib/notifications/backgroundTask';

import { useEffect, useState } from 'react';
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
import { useOnboardingStatus } from '../lib/hooks/useProfile';

SplashScreen.preventAutoHideAsync();

// Cached reads are shown immediately and refreshed in the background
// rather than blocking on a network round-trip — react-query's built-in
// "offlineFirst" mode does exactly this. gcTime is bumped well past the
// 5-minute default so persisted data isn't garbage-collected from memory
// before it's ever used again.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { networkMode: 'offlineFirst', gcTime: 1000 * 60 * 60 * 24 },
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
// ((auth), (tabs), onboarding, and the splash screen at "/") each decide
// independently whether to redirect based on session was fragile — if any
// two of them ever briefly disagreed during a fast transition (e.g. right
// after sign-out), they could ping-pong forever (reproduced: white/gray
// screen that never settled on logout). Centralizing it here, keyed off
// the current route segments, is the pattern expo-router's own docs use
// for exactly this reason.
function RootNavigation() {
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

  useEffect(() => {
    const inTabs = group === '(tabs)';
    const inOnboarding = group === 'onboarding';

    if (!session) {
      if (inTabs || inOnboarding) router.replace('/');
      return;
    }

    if (onboardingLoading) return;

    if (onboardingCompleted === false) {
      if (!inOnboarding) router.replace('/onboarding/name');
      return;
    }

    // Signed in and onboarded — the splash/auth screens are only useful
    // while logged out, so leave them for "/(tabs)".
    if (group === undefined || group === '(auth)') {
      router.replace('/(tabs)');
    }
  }, [session, onboardingCompleted, onboardingLoading, group, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
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
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.subscription.unsubscribe();
  }, [setSession, setInitialized]);

  useEffect(() => {
    useLocaleStore.getState().hydrate();
    useThemeStore.getState().hydrate();
    useLocationPreferenceStore.getState().hydrate();
    useLocationStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (
      (fontsLoaded || fontError) &&
      initialized &&
      localeHydrated &&
      themeHydrated &&
      locationPrefHydrated &&
      locationHydrated &&
      queryCacheRestored
    ) {
      SplashScreen.hide();
    }
  }, [
    fontsLoaded,
    fontError,
    initialized,
    localeHydrated,
    themeHydrated,
    locationPrefHydrated,
    locationHydrated,
    queryCacheRestored,
  ]);

  if (
    (!fontsLoaded && !fontError) ||
    !initialized ||
    !localeHydrated ||
    !themeHydrated ||
    !locationPrefHydrated ||
    !locationHydrated ||
    !queryCacheRestored
  ) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
          onSuccess={() => setQueryCacheRestored(true)}
          onError={() => setQueryCacheRestored(true)}
        >
          <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          <RootNavigation />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
