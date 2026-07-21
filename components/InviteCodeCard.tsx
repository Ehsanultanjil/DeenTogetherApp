import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';

type Props = {
  code: string;
  onShare: () => void;
  title?: string;
  subtitle?: string;
};

export function InviteCodeCard({ code, onShare, title = 'Invite Member', subtitle = 'Share code to join your prayer circle.' }: Props) {
  return (
    <View className="bg-surface-container-lowest shadow-sm border border-surface-container-high rounded-2xl p-6">
      <Text className="text-[20px] font-bold text-on-surface mb-1">{title}</Text>
      <Text className="text-[14px] text-on-surface-variant mb-4">{subtitle}</Text>
      <View className="flex-row items-center gap-4 bg-surface rounded-xl p-4 border border-outline-variant">
        <View className="flex-row items-center gap-2 flex-1">
          <Icon name="groups" filled color="#2d6a4f" />
          <Text className="text-[20px] font-bold text-primary-container tracking-widest">{code}</Text>
        </View>
        <Pressable
          onPress={onShare}
          className="w-12 h-12 items-center justify-center bg-primary rounded-xl shadow-lg active:opacity-80"
        >
          <Icon name="share" color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
