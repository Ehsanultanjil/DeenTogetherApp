import { TextInput as RNTextInput, type TextInputProps } from 'react-native';
import { useLocaleStore } from '../store/useLocaleStore';
import { FONT_BY_WEIGHT, weightFromClassName } from './fontByWeight';

export function TextInput({ className, style, ...props }: TextInputProps & { className?: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const fontFamily = FONT_BY_WEIGHT[locale][weightFromClassName(className)];
  return <RNTextInput className={className} style={[{ fontFamily, fontWeight: 'normal' }, style]} {...props} />;
}
