import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { useRouter } from 'expo-router';
import { useColors } from '../../constants/theme';
import { useT } from '../../lib/hooks/useT';
import type { Locale } from '../../store/useLocaleStore';

export default function OnboardingLanguage() {
  const router = useRouter();
  const { t, locale, setLocale } = useT();
  const Colors = useColors();

  const options: { key: Locale; label: string }[] = [
    { key: 'bn', label: t('languageBangla') },
    { key: 'en', label: t('languageEnglish') },
  ];

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 32, flexGrow: 1 }}>
        <View className="items-center mb-8">
          <View className="mb-md bg-primary-container p-6 rounded-2xl shadow-lg items-center justify-center">
            <Icon name="language" filled size={48} color="#a8e7c5" />
          </View>
          <Text className="text-[22px] text-primary font-bold text-center">{t('onboardingLanguageTitle')}</Text>
          <Text className="text-[14px] text-on-surface-variant mt-1 text-center">{t('onboardingLanguageSubtitle')}</Text>
        </View>

        <View className="gap-2">
          {options.map((option) => {
            const selected = locale === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setLocale(option.key)}
                className={`w-full p-4 rounded-xl border flex-row items-center justify-between active:opacity-80 ${
                  selected ? 'bg-primary-container border-primary' : 'bg-surface-container-lowest border-outline-variant'
                }`}
              >
                <Text className={selected ? 'text-on-primary-container font-bold' : 'text-on-surface'}>{option.label}</Text>
                {selected ? <Icon name="check" color={Colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View className="flex-1" />

        <Pressable
          onPress={() => router.push('/onboarding/madhab')}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90 mt-6"
        >
          <Text className="text-on-primary text-[16px] font-bold">{t('continueButton')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
