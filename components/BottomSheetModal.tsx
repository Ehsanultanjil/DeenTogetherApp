import { Modal, Pressable, View, type ViewStyle } from 'react-native';
import { Text } from './Text';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  // Override for e.g. a destructive-action sheet's red warning title.
  titleClassName?: string;
  // e.g. { maxHeight: '70%' } for a scrollable list sheet, or
  // { marginBottom: keyboardHeight } for a keyboard-avoiding form sheet.
  sheetStyle?: ViewStyle;
  children: React.ReactNode;
};

// Shared bottom-sheet shell — was reimplemented independently in 8 modal
// components with drifting details (max-height varied with no shared
// constant, two of the eight skipped stopPropagation on the sheet, and two
// skipped the title/divider header entirely). One implementation means one
// place to get the backdrop-press-to-close and touch-propagation behavior
// right.
export function BottomSheetModal({ visible, onClose, title, titleClassName, sheetStyle, children }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose}>
        <Pressable
          className="mt-auto bg-surface-container-lowest rounded-t-2xl"
          style={sheetStyle}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="p-4 border-b border-surface-container-low">
            <Text className={titleClassName ?? 'text-[16px] font-bold text-on-surface text-center'}>{title}</Text>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
