import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';

type Props = {
  label: string;
  subtitle?: string;
  // Override for e.g. the destructive "Delete account" row's red label.
  labelClassName?: string;
  onPress?: () => void;
};

// The "label(+subtitle) + chevron" navigation row was copy-pasted ~12 times
// across profile.tsx, settings.tsx, and namaj.tsx with the identical
// className string each time.
export function SettingsRow({ label, subtitle, labelClassName, onPress }: Props) {
  const Colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
    >
      <View>
        <Text className={labelClassName ?? 'text-on-surface'}>{label}</Text>
        {subtitle ? <Text className="text-on-surface-variant text-[12px] mt-0.5">{subtitle}</Text> : null}
      </View>
      <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
    </Pressable>
  );
}
