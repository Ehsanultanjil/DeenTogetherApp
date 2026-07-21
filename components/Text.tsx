import { Text as RNText, type TextProps } from 'react-native';
import { useLocaleStore } from '../store/useLocaleStore';
import { FONT_BY_WEIGHT, weightFromClassName } from './fontByWeight';

export function Text({ className, style, ...props }: TextProps & { className?: string }) {
  const locale = useLocaleStore((s) => s.locale);
  const fontFamily = FONT_BY_WEIGHT[locale][weightFromClassName(className)];
  // Weight is already baked into which file `fontFamily` points at — a
  // Tailwind class like `font-bold` also sets numeric fontWeight, and on
  // Android that makes the OS hunt for a "bold" sub-variant of this
  // (single-style) custom family, fail, and silently fall back to the
  // system font. Force it back to normal so the family alone decides.
  return <RNText className={className} style={[{ fontFamily, fontWeight: 'normal' }, style]} {...props} />;
}
