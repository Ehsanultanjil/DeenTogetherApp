import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { DarkColors } from '../../constants/theme';
import type { MaterialSymbolName } from '../../constants/materialSymbols';
import { useAuthStore } from '../../store/useAuthStore';
import { useT } from '../../lib/hooks/useT';
import { FONT_BY_WEIGHT } from '../../components/fontByWeight';
import { useCurrentFamilyId } from '../../lib/hooks/useFamily';
import { useFamilyRealtime } from '../../lib/hooks/useFamilyRealtime';

const TAB_ICON: Record<string, MaterialSymbolName> = {
  index: 'home',
  calendar: 'event_note',
  dua: 'volunteer_activism',
  family: 'groups',
  profile: 'person',
};

export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);
  const { t, locale } = useT();
  // Single shared subscription for the whole authenticated session — tab
  // screens stay mounted in the background, so calling this per-screen
  // (Home AND Family both wanting it) double-subscribes the same Supabase
  // Realtime channel and throws "cannot add postgres_changes callbacks
  // ... after subscribe()".
  const { data: currentFamilyId } = useCurrentFamilyId();
  useFamilyRealtime(currentFamilyId ?? null);
  const insets = useSafeAreaInsets();

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        // Bottom nav stays dark regardless of the app's light/dark theme —
        // a deliberate fixed-chrome look (M3 "inverse" navigation bar
        // pattern), not theme-following, so it always uses DarkColors.
        tabBarActiveTintColor: DarkColors.onPrimaryContainer,
        tabBarInactiveTintColor: DarkColors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', fontFamily: FONT_BY_WEIGHT[locale][600] },
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          borderTopWidth: 0,
          backgroundColor: DarkColors.surfaceContainerLow,
        },
        tabBarIcon: ({ focused, color }) => (
          <Icon name={TAB_ICON[route.name]} color={color as string} filled={focused} />
        ),
        tabBarItemStyle: { borderRadius: 9999 },
        tabBarActiveBackgroundColor: DarkColors.primaryContainer,
      })}
    >
      <Tabs.Screen name="index" options={{ title: t('tabHome') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabCalendar') }} />
      <Tabs.Screen name="dua" options={{ title: t('tabDua') }} />
      <Tabs.Screen name="family" options={{ title: t('tabFamily') }} />
      <Tabs.Screen name="profile" options={{ title: t('tabProfile') }} />
    </Tabs>
  );
}
