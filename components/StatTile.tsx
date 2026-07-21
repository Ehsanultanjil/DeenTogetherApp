import { View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import type { MaterialSymbolName } from '../constants/materialSymbols';

type Props = {
  label: string;
  value: string;
  icon: MaterialSymbolName;
  iconColor?: string;
  emphasis?: boolean; // true = filled primary tile (e.g. Month Progress)
};

export function StatTile({ label, value, icon, iconColor, emphasis = false }: Props) {
  return (
    <View
      className={`rounded-xl p-4 shadow-sm border border-surface-container-low aspect-square justify-between ${
        emphasis ? 'bg-primary' : 'bg-surface-container-lowest'
      }`}
    >
      <View>
        <Icon name={icon} color={emphasis ? '#ffffff' : iconColor} style={{ marginBottom: 8 }} />
        <Text className={`text-[12px] ${emphasis ? 'text-on-primary opacity-80' : 'text-on-surface-variant'}`}>
          {label}
        </Text>
      </View>
      <Text className={`text-[28px] font-bold ${emphasis ? 'text-on-primary' : 'text-on-surface'}`}>{value}</Text>
    </View>
  );
}
