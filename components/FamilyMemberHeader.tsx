import { Image, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { resolveAvatarSource } from '../constants/avatarPresets';

type Props = {
  name: string;
  role?: string;
  isAdmin?: boolean;
  avatarUri?: string;
  avatarSize?: number;
  progressLabel: string; // e.g. "80%"
  todayLabel: string;
  // Hides the right-side progress/today block entirely — for contexts
  // where this row is just being used to pick a member (e.g. an
  // admin-transfer list), not to show their prayer status.
  hideStats?: boolean;
  // Shown as a 5-dot row in place of `role` when no role is given.
  dotsCompleted?: number;
};

// Shared avatar+name(+role/dots)+progress header, extracted out of
// FamilyMemberRow and FamilyMemberPrayerCard — both reimplemented this
// identically before, which is how their avatar sizing (one parameterized,
// one hardcoded) and icon colors ended up drifting apart.
export function FamilyMemberHeader({
  name,
  role,
  isAdmin = false,
  avatarUri,
  avatarSize = 48,
  progressLabel,
  todayLabel,
  hideStats = false,
  dotsCompleted,
}: Props) {
  const Colors = useColors();
  const avatarSource = resolveAvatarSource(avatarUri);

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <View
          style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
          className="overflow-hidden border-2 border-primary/10 bg-surface-container-high items-center justify-center"
        >
          {avatarSource ? (
            <Image source={avatarSource} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Icon name="person" color={Colors.onSurfaceVariant} />
          )}
        </View>
        <View>
          <Text className="font-bold text-[16px] text-on-surface">{name}</Text>
          {role ? (
            <View className="flex-row items-center gap-1 mt-0.5">
              {isAdmin ? <Icon name="shield_with_heart" size={14} filled color={Colors.primary} /> : null}
              <Text className="text-[12px] text-on-surface-variant">{role}</Text>
            </View>
          ) : dotsCompleted !== undefined ? (
            <View className="flex-row gap-1 mt-1">
              {[0, 1, 2, 3, 4].map((i) =>
                i < dotsCompleted ? (
                  <Icon key={i} name="check_circle" filled size={14} color={Colors.primary} />
                ) : (
                  <Icon key={i} name="radio_button_unchecked" size={14} color={Colors.outlineVariant} />
                ),
              )}
            </View>
          ) : null}
        </View>
      </View>
      {hideStats ? null : (
        <View className="items-end">
          <Text className="font-bold text-primary text-[16px]">{progressLabel}</Text>
          <Text className="text-[12px] text-on-surface-variant">{todayLabel}</Text>
        </View>
      )}
    </View>
  );
}
