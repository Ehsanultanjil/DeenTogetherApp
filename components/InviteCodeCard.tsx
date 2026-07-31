import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';

type Props = {
  code: string;
  onShare: () => void;
  onCopy: () => void;
  title?: string;
  subtitle?: string;
};

export function InviteCodeCard({
  code,
  onShare,
  onCopy,
  title = 'Invite Member',
  subtitle = 'Share code to join your prayer circle.',
}: Props) {
  const Colors = useColors();
  return (
    <View className="bg-surface-container-lowest shadow-sm border border-surface-container-high rounded-xl p-4">
      <Text className="text-[14px] font-bold text-on-surface mb-0.5">{title}</Text>
      <Text className="text-[12px] text-on-surface-variant mb-3">{subtitle}</Text>
      <View className="flex-row items-center gap-3 bg-surface rounded-lg px-3 py-2.5 border border-outline-variant">
        <View className="flex-row items-center gap-2 flex-1">
          <Icon name="groups" filled size={18} color={Colors.primaryContainer} />
          <Text className="text-[16px] font-bold text-primary-container tracking-wide">{code}</Text>
        </View>
        <Pressable
          onPress={onCopy}
          className="w-9 h-9 items-center justify-center bg-surface-container-high rounded-lg active:opacity-80"
        >
          <Icon name="content_copy" size={16} color={Colors.primaryContainer} />
        </Pressable>
        <Pressable
          onPress={onShare}
          className="w-9 h-9 items-center justify-center bg-primary rounded-lg shadow-sm active:opacity-80"
        >
          <Icon name="share" size={16} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
