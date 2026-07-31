import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColors } from '../../constants/theme';
import { useCompleteOnboarding } from '../../lib/hooks/useProfile';
import { useT } from '../../lib/hooks/useT';
import { getErrorMessage } from '../../lib/getErrorMessage';

type Gender = 'male' | 'female' | 'prefer_not_to_say';

export default function OnboardingGender() {
  const router = useRouter();
  const { t } = useT();
  const Colors = useColors();
  const { name, avatarUrl } = useLocalSearchParams<{ name: string; avatarUrl: string }>();
  const [gender, setGender] = useState<Gender | null>(null);
  const completeOnboarding = useCompleteOnboarding();

  const options: { key: Gender; label: string }[] = [
    { key: 'male', label: t('genderMale') },
    { key: 'female', label: t('genderFemale') },
    { key: 'prefer_not_to_say', label: t('genderPreferNotToSay') },
  ];

  const onFinish = () => {
    if (!gender || !name || !avatarUrl) return;
    completeOnboarding.mutate(
      { fullName: name, avatarUrl, gender },
      { onSuccess: () => router.replace('/(tabs)') },
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 32, flexGrow: 1 }}>
        <View className="items-center mb-8">
          <View className="mb-md bg-primary-container p-6 rounded-2xl shadow-lg items-center justify-center">
            <Icon name="person" filled size={48} color="#a8e7c5" />
          </View>
          <Text className="text-[22px] text-primary font-bold text-center">{t('onboardingGenderTitle')}</Text>
          <Text className="text-[14px] text-on-surface-variant mt-1 text-center">{t('onboardingGenderSubtitle')}</Text>
        </View>

        <View className="gap-2">
          {options.map((option) => {
            const selected = gender === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setGender(option.key)}
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

        {completeOnboarding.isError ? (
          <Text className="text-error text-[13px] mb-3 text-center">
            {getErrorMessage(completeOnboarding.error)}
          </Text>
        ) : null}

        <Pressable
          disabled={!gender || !name || !avatarUrl || completeOnboarding.isPending}
          onPress={onFinish}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90 mt-6"
        >
          <Text className="text-on-primary text-[16px] font-bold">
            {completeOnboarding.isPending ? t('savingLabel') : t('finishButton')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
