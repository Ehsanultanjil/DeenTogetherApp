import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Matches AnimatedTabBar's own height formula — the tab bar now floats
// (position: absolute) over the screen instead of reserving its own flex
// space, so every scrollable screen needs to pad its bottom by this much
// itself, and any bottom-anchored floating element needs to sit above it.
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return 64 + insets.bottom;
}
