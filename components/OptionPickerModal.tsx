import { FlatList, Modal, Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose}>
        <View className="mt-auto bg-surface-container-lowest rounded-t-2xl max-h-[70%]">
          <View className="p-4 border-b border-surface-container-low">
            <Text className="text-[16px] font-bold text-on-surface text-center">{title}</Text>
          </View>
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
        </View>
      </Pressable>
    </Modal>
  );
}
