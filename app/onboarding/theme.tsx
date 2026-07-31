import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { useRouter } from 'expo-router';
import { useColors } from '../../constants/theme';
import { useThemeStore, type ThemeMode } from '../../store/useThemeStore';
import { useT } from '../../lib/hooks/useT';

export default function OnboardingTheme() {
  const router = useRouter();
  const { t } = useT();
  const Colors = useColors();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const options: { key: ThemeMode; label: string; icon: 'light_mode' | 'dark_mode' }[] = [
    { key: 'light', label: t('lightMode'), icon: 'light_mode' },
    { key: 'dark', label: t('darkMode'), icon: 'dark_mode' },
  ];

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 32, flexGrow: 1 }}>
        <View className="items-center mb-8">
          <View className="mb-md bg-primary-container p-6 rounded-2xl shadow-lg items-center justify-center">
            <Icon name="dark_mode" filled size={48} color="#a8e7c5" />
          </View>
          <Text className="text-[22px] text-primary font-bold text-center">{t('onboardingThemeTitle')}</Text>
          <Text className="text-[14px] text-on-surface-variant mt-1 text-center">{t('onboardingThemeSubtitle')}</Text>
        </View>

        <View className="gap-2">
          {options.map((option) => {
            const selected = themeMode === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setThemeMode(option.key)}
                className={`w-full p-4 rounded-xl border flex-row items-center gap-3 active:opacity-80 ${
                  selected ? 'bg-primary-container border-primary' : 'bg-surface-container-lowest border-outline-variant'
                }`}
              >
                <Icon name={option.icon} color={selected ? Colors.primary : Colors.onSurfaceVariant} />
                <Text className={`flex-1 ${selected ? 'text-on-primary-container font-bold' : 'text-on-surface'}`}>
                  {option.label}
                </Text>
                {selected ? <Icon name="check" color={Colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View className="flex-1" />

        <Pressable
          onPress={() => router.push('/onboarding/name')}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90 mt-6"
        >
          <Text className="text-on-primary text-[16px] font-bold">{t('continueButton')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
