import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Text } from './Text';
import { Icon } from './Icon';

// Soft, deliberately understated gold — a premium day (all prayers + Quran)
// should read as "a little special", not flashy.
const PREMIUM_GOLD = '#D4AF37';

function Sparkle({
  size,
  baseOpacity,
  style,
  delayMs,
}: {
  size: number;
  baseOpacity: number;
  style: { position: 'absolute'; top?: number; bottom?: number; left?: number; right?: number };
  delayMs: number;
}) {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withDelay(
      delayMs,
      withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })), -1, true),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: baseOpacity * (0.4 + 0.6 * twinkle.value),
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Icon name="auto_awesome" size={size} color={PREMIUM_GOLD} />
    </Animated.View>
  );
}

type Props = {
  day: string | number;
  isToday?: boolean;
  isSelected?: boolean;
  dotColor?: string; // status color for a day that has a record — undefined = no record yet
  dotTextColor?: string; // text color that reads well on dotColor
  isPremium?: boolean; // all prayers + Quran completed that day
  faded?: boolean;
  onPress?: () => void;
};

export function CalendarDayCell({
  day,
  isToday = false,
  isSelected = false,
  dotColor,
  dotTextColor = '#ffffff',
  isPremium = false,
  faded = false,
  onPress,
}: Props) {
  const showCircle = isToday || isSelected || !!dotColor;

  let circleStyle: { backgroundColor: string } | undefined;
  let circleClassName = '';
  let textStyle: { color: string } | undefined;

  if (isToday) {
    circleClassName = 'bg-primary';
    textStyle = { color: '#ffffff' };
  } else if (dotColor) {
    circleStyle = { backgroundColor: dotColor };
    textStyle = { color: dotTextColor };
  } else if (isSelected) {
    circleClassName = 'bg-primary/15';
    textStyle = undefined;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={faded || !onPress}
      className={`aspect-square items-center justify-center ${faded ? 'opacity-20' : ''}`}
    >
      {showCircle ? (
        <View className="w-9 h-9 items-center justify-center">
          <View
            className={`w-9 h-9 rounded-full items-center justify-center ${circleClassName} ${
              isSelected ? 'border-2 border-primary' : ''
            }`}
            style={[circleStyle, isPremium ? { borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.6)' } : undefined]}
          >
            <Text className={`font-bold text-[14px] ${!isToday && !dotColor ? 'text-primary' : ''}`} style={textStyle}>
              {day}
            </Text>
          </View>
          {isPremium ? (
            <>
              <Sparkle size={10} baseOpacity={0.7} style={{ position: 'absolute', top: -2, right: -2 }} delayMs={0} />
              <Sparkle size={8} baseOpacity={0.5} style={{ position: 'absolute', bottom: -2, left: -2 }} delayMs={450} />
            </>
          ) : null}
        </View>
      ) : (
        <Text className="text-[14px] text-on-surface">{day}</Text>
      )}
    </Pressable>
  );
}
