import { View } from 'react-native';
import { FamilyMemberHeader } from './FamilyMemberHeader';

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
  return (
    <View className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-variant/10">
      <FamilyMemberHeader
        name={name}
        role={role}
        isAdmin={isAdmin}
        avatarUri={avatarUri}
        avatarSize={size === 'lg' ? 56 : 48}
        progressLabel={progressLabel}
        todayLabel={todayLabel}
        hideStats={hideStats}
        dotsCompleted={dotsCompleted}
      />
    </View>
  );
}
