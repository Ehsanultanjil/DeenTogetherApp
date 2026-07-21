import { Text, type TextStyle } from 'react-native';
import { MATERIAL_SYMBOLS, type MaterialSymbolName } from '../constants/materialSymbols';

type Props = {
  name: MaterialSymbolName;
  size?: number;
  color?: string;
  filled?: boolean;
  style?: TextStyle;
};

export function Icon({ name, size = 24, color, filled = false, style }: Props) {
  const codepoint = MATERIAL_SYMBOLS[name];
  const char = String.fromCodePoint(parseInt(codepoint, 16));
  return (
    <Text
      style={[
        {
          fontFamily: filled ? 'MaterialSymbolsOutlinedFilled' : 'MaterialSymbolsOutlined',
          fontSize: size,
          color,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {char}
    </Text>
  );
}
