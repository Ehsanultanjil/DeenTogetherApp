import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { useColors } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-100
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function ProgressRing({
  size = 96,
  strokeWidth = 10,
  progress,
  color,
  trackColor,
  children,
  style,
}: Props) {
  const Colors = useColors();
  const resolvedColor = color ?? Colors.primary;
  const resolvedTrackColor = trackColor ?? Colors.surfaceContainerHigh;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Driving strokeDashoffset off a shared value/worklet instead of a plain
  // prop means the parent's per-second re-render (Home's countdown ticker)
  // no longer forces this SVG through React's reconciler each tick — the
  // stroke updates on the UI thread, and animates smoothly between values
  // instead of snapping.
  const progressValue = useSharedValue(progress);
  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 300, easing: Easing.linear });
  }, [progress, progressValue]);

  const animatedProps = useAnimatedProps(() => {
    const clamped = Math.min(Math.max(progressValue.value, 0), 100);
    return { strokeDashoffset: circumference - (circumference * clamped) / 100 };
  }, [circumference]);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      {children ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
