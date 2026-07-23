import { Image } from 'react-native';

type Props = { size?: number };

// The real app icon (assets/icon.png), shown in-app on the splash/login/
// signup screens — previously these rendered a generic Material Symbols
// "mosque" glyph instead of the actual brand icon.
export function AppLogo({ size = 96 }: Props) {
  return (
    <Image
      source={require('../assets/icon.png')}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      resizeMode="cover"
    />
  );
}
