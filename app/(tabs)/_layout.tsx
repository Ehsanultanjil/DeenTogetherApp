import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { AnimatedTabBar } from '../../components/AnimatedTabBar';
import { useAuthStore } from '../../store/useAuthStore';
import { useT } from '../../lib/hooks/useT';
import { useCurrentFamilyId } from '../../lib/hooks/useFamily';
import { useFamilyRealtime } from '../../lib/hooks/useFamilyRealtime';
import { requestPrayerNotificationPermission } from '../../lib/hooks/usePrayerNotifications';
import { usePushToken } from '../../lib/hooks/usePushToken';
import { useSyncOnResume } from '../../lib/hooks/useSyncOnResume';

// Which route to actively navigate to is decided centrally in
// app/_layout.tsx's RootNavigation (see the comment there) — but that's a
// separate concern from whether THIS screen is safe to render. Android's
// back gesture can briefly land the navigator back on a route already in
// its history (e.g. right after logout), so this still needs its own
// passive refusal-to-render as a safety net — critically, just returning
// null here, not issuing a competing navigation call of its own, which is
// what caused the stuck/thrashing transitions before.
export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  const { t } = useT();
  // Single shared subscription for the whole authenticated session — tab
  // screens stay mounted in the background, so calling this per-screen
  // (Home AND Family both wanting it) double-subscribes the same Supabase
  // Realtime channel and throws "cannot add postgres_changes callbacks
  // ... after subscribe()".
  const { data: currentFamilyId } = useCurrentFamilyId();
  useFamilyRealtime(currentFamilyId ?? null);
  usePushToken();
  useSyncOnResume();

  useEffect(() => {
    if (session) requestPrayerNotificationPermission();
  }, [session]);

  if (!session) {
    return <View className="flex-1 bg-surface" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AnimatedTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: t('tabHome') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabCalendar') }} />
      <Tabs.Screen name="dua" options={{ title: t('tabDua') }} />
      <Tabs.Screen name="family" options={{ title: t('tabFamily') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabProfile') }} />
    </Tabs>
  );
}
