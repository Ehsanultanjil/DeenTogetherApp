import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../constants/theme';

type Props = {
  title: string;
  dateText?: string;
  onBack?: () => void;
};

// Centered title, optional back button when onBack is passed.
export function TopAppBar({ title, dateText, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const Colors = useColors();

  return (
    <View
      className="w-full items-center justify-center px-gutter bg-surface relative"
      style={{ paddingTop: insets.top, height: 64 + insets.top }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="absolute left-4 w-10 h-10 rounded-full items-center justify-center active:opacity-60"
          style={{ top: insets.top + (64 - 40) / 2 }}
        >
          <Icon name="arrow_back" size={22} color={Colors.onSurface} />
        </Pressable>
      ) : null}
      <Text className="text-[20px] font-bold text-primary leading-none">{title}</Text>
      {dateText ? <Text className="text-[12px] text-on-surface-variant mt-0.5">{dateText}</Text> : null}
    </View>
  );
}
