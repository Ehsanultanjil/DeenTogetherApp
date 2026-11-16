import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from './Icon';
import { LightColors } from '../constants/theme';
import { useLocationStore } from '../store/useLocationStore';
import { useT } from '../lib/hooks/useT';
import { openNearbyMosques } from '../lib/qibla';
import type { MaterialSymbolName } from '../constants/materialSymbols';
import type { TranslationKey } from '../lib/i18n/translations';

type ToolItem = {
  id: 'qibla' | 'tasbih' | 'mosque';
  titleKey: TranslationKey;
  icon: MaterialSymbolName;
  color: string;
  // Offset relative to the main FAB center (radial arc around top-left)
  dx: number;
  dy: number;
};

// 3 tool balls positioned in a circular arc around the top-left quadrant of the main circle:
// 1. Qibla Compass (top)
// 2. Minimalist Tasbih (top-left diagonal)
// 3. Nearby Mosque on Maps (left)
const TOOLS: ToolItem[] = [
  { id: 'qibla', titleKey: 'qiblaTitle', icon: 'explore', color: LightColors.primary, dx: -8, dy: -88 },
  { id: 'tasbih', titleKey: 'tasbihTitle', icon: 'touch_app', color: LightColors.primary, dx: -68, dy: -68 },
  { id: 'mosque', titleKey: 'nearbyMosques', icon: 'mosque', color: LightColors.primary, dx: -88, dy: -8 },
];

type Props = {
  bottomOffset: number;
  rightOffset?: number;
};

export function HomeSpeedDial({ bottomOffset, rightOffset = 24 }: Props) {
  const router = useRouter();
  const { t } = useT();
  const coords = useLocationStore((s) => s.coords);
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  const open = () => {
    setIsOpen(true);
    progress.value = withTiming(1, { duration: 180 });
  };

  const close = () => {
    progress.value = withTiming(0, { duration: 180 });
    setIsOpen(false);
  };

  const handleToolPress = async (toolId: ToolItem['id']) => {
    close();
    if (toolId === 'qibla') {
      router.push('/qibla');
    } else if (toolId === 'tasbih') {
      router.push('/tasbih');
    } else if (toolId === 'mosque') {
      await openNearbyMosques(coords?.latitude, coords?.longitude);
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const fabIconStyle = useAnimatedStyle(() => {
    const rotation = interpolate(progress.value, [0, 1], [0, 45]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <>
      {/* Full-screen darkened blurry backdrop that captures taps anywhere to collapse */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(5, 15, 10, 0.55)',
            zIndex: 40,
          },
          backdropStyle,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
      </Animated.View>

      {/* Floating Speed Dial Container */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: bottomOffset,
          right: rightOffset,
          width: 56,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        {/* 3 Tool Sub-Balls fanned out around the main circle */}
        {TOOLS.map((tool) => {
          const itemAnimatedStyle = useAnimatedStyle(() => {
            const translateX = interpolate(progress.value, [0, 1], [0, tool.dx]);
            const translateY = interpolate(progress.value, [0, 1], [0, tool.dy]);
            const scale = interpolate(progress.value, [0, 0.4, 1], [0, 0.5, 1]);
            const opacity = interpolate(progress.value, [0, 0.2, 1], [0, 0.6, 1]);
            return {
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
            };
          });

          return (
            <Animated.View
              key={tool.id}
              pointerEvents={isOpen ? 'auto' : 'none'}
              style={[
                {
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                itemAnimatedStyle,
              ]}
            >
              {/* Tool Sub-Ball Circle */}
              <Pressable
                onPress={() => handleToolPress(tool.id)}
                accessibilityLabel={t(tool.titleKey)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: tool.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.35,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 7,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                }}
                className="active:opacity-80"
              >
                <Icon name={tool.icon} size={22} color="#ffffff" />
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Main Floating Action Ball (Tools) */}
        <Pressable
          onPress={toggle}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isOpen ? '#1b4332' : LightColors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
            borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.25)',
          }}
          className="active:opacity-90"
        >
          <Animated.View style={fabIconStyle}>
            <Icon name="handyman" size={26} color="#ffffff" />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
}
