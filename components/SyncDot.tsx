import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import type { SyncStatus } from '../store/useSyncStatusStore';

const SIZE = 8;
const COLOR = { synced: '#22c55e', syncing: '#f59e0b', offline: '#9ca3af' } as const;

// Same footprint (8x8) in all three states — a solid dot for synced/offline,
// a spinning ring for syncing — so this never nudges surrounding layout.
export function SyncDot({ status, label }: { status: SyncStatus; label: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (status === 'syncing') {
      rotation.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1, false);
    } else {
      rotation.value = 0;
    }
  }, [status, rotation]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  if (status === 'syncing') {
    return (
      <Animated.View
        accessibilityLabel={label}
        style={[
          spinStyle,
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: 1.5,
            borderColor: COLOR.syncing,
            borderTopColor: 'transparent',
          },
        ]}
      />
    );
  }

  return (
    <View
      accessibilityLabel={label}
      style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: COLOR[status] }}
    />
  );
}
