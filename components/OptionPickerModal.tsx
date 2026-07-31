import { FlatList, Pressable } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { BottomSheetModal } from './BottomSheetModal';

type Option = { key: string; label: string };

type Props = {
  visible: boolean;
  title: string;
  options: Option[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
};

export function OptionPickerModal({ visible, title, options, selectedKey, onSelect, onClose }: Props) {
  const Colors = useColors();
  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={title} sheetStyle={{ maxHeight: '70%' }}>
      <FlatList
        data={options}
        keyExtractor={(o) => o.key}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              onSelect(item.key);
              onClose();
            }}
            className="flex-row items-center justify-between px-6 py-4 border-b border-surface-container-low active:opacity-70"
          >
            <Text className="text-on-surface text-[15px]">{item.label}</Text>
            {item.key === selectedKey ? <Icon name="check" color={Colors.primary} /> : null}
          </Pressable>
        )}
      />
    </BottomSheetModal>
  );
}
