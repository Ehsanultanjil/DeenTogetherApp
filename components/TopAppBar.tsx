import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../constants/theme';

type Props = {
  title: string;
  dateText?: string;
  onBack?: () => void;
};

// Rock-solid flex-row header: Left back button, Center title, Right spacer.
// Immune to NativeWind absolute positioning bugs or text overlap.
export function TopAppBar({ title, dateText, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const Colors = useColors();

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: Colors.surface,
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceVariant + '35',
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
      >
        {/* Left: Back button or spacer */}
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? Colors.surfaceContainerHigh : 'transparent',
              },
            ]}
          >
            <Icon name="arrow_back" size={24} color={Colors.onSurface} />
          </Pressable>
        ) : (
          <View style={{ width: 40, height: 40 }} />
        )}

        {/* Center: Title & optional dateText */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
          <Text
            style={{
              fontSize: 19,
              fontWeight: 'bold',
              color: Colors.primary,
              textAlign: 'center',
              lineHeight: 26,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {dateText ? (
            <Text style={{ fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 }}>
              {dateText}
            </Text>
          ) : null}
        </View>

        {/* Right: Spacer to keep title centered */}
        <View style={{ width: 40, height: 40 }} />
      </View>
    </View>
  );
}
