import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';

type Props = {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  dateText?: string;
  onCalendarPress?: () => void;
};

export function TopAppBar({ title, showBack = false, showNotification = false, dateText, onCalendarPress }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const Colors = useColors();

  return (
    <View
      className="w-full flex-row justify-between items-center px-gutter bg-surface"
      style={{ paddingTop: insets.top, height: 64 + insets.top }}
    >
      <View className="flex-row items-center gap-3">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            className="p-2 rounded-full active:opacity-70"
            hitSlop={8}
          >
            <Icon name="arrow_back" color={Colors.primary} />
          </Pressable>
        ) : (
          <Pressable className="p-2 rounded-full active:opacity-70" hitSlop={8}>
            <Icon name="menu" color={Colors.primary} />
          </Pressable>
        )}
        <View>
          <Text className="text-[20px] font-bold text-primary leading-none">{title}</Text>
          {dateText ? <Text className="text-[12px] text-on-surface-variant">{dateText}</Text> : null}
        </View>
      </View>
      {showNotification ? (
        <Pressable className="p-2 rounded-full active:opacity-70 relative" hitSlop={8}>
          <Icon name="notifications" color={Colors.primary} />
          <View className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" />
        </Pressable>
      ) : (
        <Pressable onPress={onCalendarPress} className="p-2 rounded-full active:opacity-70" hitSlop={8}>
          <Icon name="calendar_today" color={Colors.primary} />
        </Pressable>
      )}
    </View>
  );
}
