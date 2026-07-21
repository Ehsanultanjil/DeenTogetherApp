import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useLocaleStore } from '../store/useLocaleStore';
import { useThemeStore } from '../store/useThemeStore';
import { useLocationPreferenceStore } from '../store/useLocationPreferenceStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
  const locationPrefHydrated = useLocationPreferenceStore((s) => s.hydrated);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
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
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && initialized && localeHydrated && themeHydrated && locationPrefHydrated) {
      SplashScreen.hide();
    }
  }, [fontsLoaded, fontError, initialized, localeHydrated, themeHydrated, locationPrefHydrated]);

  if ((!fontsLoaded && !fontError) || !initialized || !localeHydrated || !themeHydrated || !locationPrefHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
