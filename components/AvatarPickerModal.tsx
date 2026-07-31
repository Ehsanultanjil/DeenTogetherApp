import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { AVATAR_PRESETS, toAvatarPresetValue, type AvatarPresetId } from '../constants/avatarPresets';
import { BottomSheetModal } from './BottomSheetModal';

type Props = {
  visible: boolean;
  title: string;
  maleLabel: string;
  femaleLabel: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export function AvatarGrid({
  ids,
  selectedValue,
  onSelect,
}: {
  ids: readonly AvatarPresetId[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) {
  const Colors = useColors();
  return (
    <View className="flex-row flex-wrap gap-3">
      {ids.map((id) => {
        const preset = AVATAR_PRESETS.find((p) => p.id === id)!;
        const value = toAvatarPresetValue(id);
        const isSelected = value === selectedValue;
        return (
          <Pressable key={id} onPress={() => onSelect(value)} className="active:opacity-70">
            <View
              className="w-16 h-16 rounded-full overflow-hidden items-center justify-center"
              style={isSelected ? { borderWidth: 3, borderColor: Colors.primary } : undefined}
            >
              <Image source={preset.source} style={{ width: '100%', height: '100%' }} />
            </View>
            {isSelected ? (
              <View
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center bg-primary border-2 border-surface-container-lowest"
              >
                <Icon name="check" size={12} color="#ffffff" />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function AvatarPickerModal({
  visible,
  title,
  maleLabel,
  femaleLabel,
  selectedValue,
  onSelect,
  onClose,
}: Props) {
  const maleIds = AVATAR_PRESETS.filter((p) => p.id.startsWith('male-')).map((p) => p.id);
  const femaleIds = AVATAR_PRESETS.filter((p) => p.id.startsWith('female-')).map((p) => p.id);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={title} sheetStyle={{ maxHeight: '75%' }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View className="gap-3">
          <Text className="text-[13px] font-bold text-on-surface-variant">{maleLabel}</Text>
          <AvatarGrid ids={maleIds} selectedValue={selectedValue} onSelect={onSelect} />
        </View>
        <View className="gap-3">
          <Text className="text-[13px] font-bold text-on-surface-variant">{femaleLabel}</Text>
          <AvatarGrid ids={femaleIds} selectedValue={selectedValue} onSelect={onSelect} />
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}
