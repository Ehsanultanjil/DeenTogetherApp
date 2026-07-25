import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { AnimatedTabBar } from '../../components/AnimatedTabBar';
import { useAuthStore } from '../../store/useAuthStore';
import { useT } from '../../lib/hooks/useT';
import { useCurrentFamilyId } from '../../lib/hooks/useFamily';
import { useFamilyRealtime } from '../../lib/hooks/useFamilyRealtime';
import { requestPrayerNotificationPermission } from '../../lib/hooks/usePrayerNotifications';
import { usePushToken } from '../../lib/hooks/usePushToken';
import { useSyncOnResume } from '../../lib/hooks/useSyncOnResume';

// Auth routing is owned centrally by app/_layout.tsx's RootNavigation,
// which redirects to login on logout from the ROOT navigator (it has to be
// the root: "/" is ambiguous between app/index.tsx and app/(tabs)/index.tsx
// since groups are invisible in the URL, and a redirect from inside this
// group resolves "/" to the Home tab and loops forever). This guard stays
// passive — render null while logged out, never navigate — so it can't
// compete with or loop against the root redirect.
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
    return null;
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
