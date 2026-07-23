import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { Text } from './Text';
import { FONT_BY_WEIGHT } from './fontByWeight';
import { DarkColors } from '../constants/theme';
import type { MaterialSymbolName } from '../constants/materialSymbols';
import { useLocaleStore } from '../store/useLocaleStore';

const TAB_ICON: Record<string, MaterialSymbolName> = {
  index: 'home',
  calendar: 'event_note',
  dua: 'volunteer_activism',
  family: 'groups',
  profile: 'person',
};

type TabLayout = { x: number; width: number };

// Custom tab bar (replacing expo-router/React Navigation's default one) so
// the active-tab highlight can slide/resize between positions instead of
// snapping — the default tabBarActiveBackgroundColor swap has no
// transition of its own.
export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const locale = useLocaleStore((s) => s.locale);
  const [layouts, setLayouts] = useState<TabLayout[]>([]);
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  useEffect(() => {
    const active = layouts[state.index];
    if (!active) return;
    pillX.value = withTiming(active.x, { duration: 220 });
    pillWidth.value = withTiming(active.width, { duration: 220 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, layouts]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
  }));

  const handleLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
    if (index === state.index && pillWidth.value === 0) {
      pillX.value = x;
      pillWidth.value = width;
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        height: 64 + insets.bottom,
        paddingTop: 8,
        paddingBottom: 8 + insets.bottom,
        paddingHorizontal: 8,
        backgroundColor: DarkColors.surfaceContainerLow,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 8,
            bottom: 8 + insets.bottom,
            borderRadius: 16,
            backgroundColor: DarkColors.primaryContainer,
          },
          pillStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = typeof options.title === 'string' ? options.title : route.name;
        const tintColor = focused ? DarkColors.onPrimaryContainer : DarkColors.onSurfaceVariant;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onLayout={handleLayout(index)}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, zIndex: 1 }}
          >
            <Icon name={TAB_ICON[route.name]} filled={focused} color={tintColor} />
            <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: FONT_BY_WEIGHT[locale][600], color: tintColor }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
