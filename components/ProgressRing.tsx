import { View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useColors } from '../constants/theme';

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
  const offset = circumference - (circumference * Math.min(Math.max(progress, 0), 100)) / 100;
  const center = size / 2;

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
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
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
