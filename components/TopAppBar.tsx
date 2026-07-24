import { View } from 'react-native';
import { Text } from './Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  dateText?: string;
};

// Centered title, no back/menu icon and no calendar/notification icon —
// navigation back to a screen relies on the OS-level back gesture/button
// (iOS swipe-back, Android system back), same as every pushed screen here.
export function TopAppBar({ title, dateText }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full items-center justify-center px-gutter bg-surface"
      style={{ paddingTop: insets.top, height: 64 + insets.top }}
    >
      <Text className="text-[20px] font-bold text-primary leading-none">{title}</Text>
      {dateText ? <Text className="text-[12px] text-on-surface-variant mt-0.5">{dateText}</Text> : null}
    </View>
  );
}
