import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import type { MaterialSymbolName } from '../constants/materialSymbols';

type Props = {
  name: string;
  timeRange: string;
  completed: boolean;
  icon: MaterialSymbolName;
  onToggle: () => void;
  disabled?: boolean;
};

export function PrayerCard({ name, timeRange, completed, icon, onToggle, disabled = false }: Props) {
  const Colors = useColors();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-variant flex-row items-center justify-between active:opacity-90 ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      <View className="flex-row items-center gap-4">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${
            completed ? 'bg-secondary-fixed' : 'bg-surface-container'
          }`}
        >
          <Icon name={icon} color={completed ? Colors.primary : Colors.onSurfaceVariant} />
        </View>
        <View>
          <Text className="text-[16px] font-bold text-on-surface">{name}</Text>
          <Text className="text-[12px] text-on-surface-variant">{timeRange}</Text>
        </View>
      </View>
      <View
        className={`w-8 h-8 rounded-full items-center justify-center ${
          completed ? 'bg-primary' : 'border-2 border-outline-variant'
        }`}
      >
        {completed ? <Icon name="check" size={18} color="#ffffff" /> : null}
      </View>
    </Pressable>
  );
}
