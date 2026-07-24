import { Image, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { resolveAvatarSource } from '../constants/avatarPresets';

type Props = {
  name: string;
  role?: string;
  progressLabel: string; // e.g. "80%"
  dotsCompleted: number; // 0-5
  avatarUri?: string;
  isAdmin?: boolean;
  size?: 'sm' | 'lg';
  todayLabel?: string;
  // Hides the right-side progress/dots block entirely — for contexts where
  // this row is just being used to pick a member (e.g. an admin-transfer
  // list), not to show their prayer status.
  hideStats?: boolean;
};

export function FamilyMemberRow({
  name,
  role,
  progressLabel,
  dotsCompleted,
  avatarUri,
  isAdmin = false,
  size = 'sm',
  todayLabel = 'Today',
  hideStats = false,
}: Props) {
  const avatarSize = size === 'lg' ? 56 : 48;
  const Colors = useColors();
  const avatarSource = resolveAvatarSource(avatarUri);

  return (
    <View className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-variant/10">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View
            style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
            className="overflow-hidden border-2 border-primary/10 bg-surface-container-high items-center justify-center"
          >
            {avatarSource ? (
              <Image source={avatarSource} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Icon name="person" color="#404943" />
            )}
          </View>
          <View>
            <Text className="font-bold text-[16px] text-on-surface">{name}</Text>
            {role ? (
              <View className="flex-row items-center gap-1 mt-0.5">
                {isAdmin ? <Icon name="shield_with_heart" size={14} filled color="#0f5238" /> : null}
                <Text className="text-[12px] text-on-surface-variant">{role}</Text>
              </View>
            ) : (
              <View className="flex-row gap-1 mt-1">
                {[0, 1, 2, 3, 4].map((i) =>
                  i < dotsCompleted ? (
                    <Icon key={i} name="check_circle" filled size={14} color={Colors.primary} />
                  ) : (
                    <Icon key={i} name="radio_button_unchecked" size={14} color={Colors.outlineVariant} />
                  ),
                )}
              </View>
            )}
          </View>
        </View>
        {hideStats ? null : (
          <View className="items-end">
            <Text className="font-bold text-primary text-[16px]">{progressLabel}</Text>
            <Text className="text-[12px] text-on-surface-variant">{todayLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
