import { Switch, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { Icon } from '../../components/Icon';
import { useColors } from '../../constants/theme';
import { useThemeStore } from '../../store/useThemeStore';
import { useT } from '../../lib/hooks/useT';

export default function ThemeScreen() {
  const { t } = useT();
  const Colors = useColors();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('themeTitle')} />
      <View className="px-gutter pt-4">
        <View className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <Icon name={themeMode === 'dark' ? 'dark_mode' : 'light_mode'} color={Colors.onSurfaceVariant} />
            <Text className="text-on-surface">{t('darkMode')}</Text>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
            trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    </View>
  );
}
