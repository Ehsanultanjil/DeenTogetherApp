import { Pressable, View } from 'react-native';
import { Text } from './Text';

type Props = {
  day: string | number;
  isToday?: boolean;
  isSelected?: boolean;
  dotColor?: string; // status color for a day that has a record — undefined = no record yet
  dotTextColor?: string; // text color that reads well on dotColor
  faded?: boolean;
  onPress?: () => void;
};

export function CalendarDayCell({
  day,
  isToday = false,
  isSelected = false,
  dotColor,
  dotTextColor = '#ffffff',
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
        <View
          className={`w-9 h-9 rounded-full items-center justify-center ${circleClassName} ${
            isSelected ? 'border-2 border-primary' : ''
          }`}
          style={circleStyle}
        >
          <Text className={`font-bold text-[14px] ${!isToday && !dotColor ? 'text-primary' : ''}`} style={textStyle}>
            {day}
          </Text>
        </View>
      ) : (
        <Text className="text-[14px] text-on-surface">{day}</Text>
      )}
    </Pressable>
  );
}
