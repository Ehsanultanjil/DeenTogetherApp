import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AvatarGrid } from '../../components/AvatarPickerModal';
import { AVATAR_PRESETS } from '../../constants/avatarPresets';
import { useCompleteOnboarding } from '../../lib/hooks/useProfile';
import { useT } from '../../lib/hooks/useT';

export default function OnboardingAvatar() {
  const router = useRouter();
  const { t } = useT();
  const { name } = useLocalSearchParams<{ name: string }>();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const completeOnboarding = useCompleteOnboarding();

  const maleIds = AVATAR_PRESETS.filter((p) => p.id.startsWith('male-')).map((p) => p.id);
  const femaleIds = AVATAR_PRESETS.filter((p) => p.id.startsWith('female-')).map((p) => p.id);

  const onFinish = () => {
    if (!selectedValue || !name) return;
    completeOnboarding.mutate(
      { fullName: name, avatarUrl: selectedValue },
      { onSuccess: () => router.replace('/(tabs)') },
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 48, paddingBottom: 32 }}>
        <View className="items-center mb-8">
          <Text className="text-[22px] text-primary font-bold text-center">{t('onboardingAvatarTitle')}</Text>
          <Text className="text-[14px] text-on-surface-variant mt-1 text-center">{t('onboardingAvatarSubtitle')}</Text>
        </View>

        <View className="gap-6">
          <View className="gap-3">
            <Text className="text-[13px] font-bold text-on-surface-variant">{t('avatarMaleSection')}</Text>
            <AvatarGrid ids={maleIds} selectedValue={selectedValue} onSelect={setSelectedValue} />
          </View>
          <View className="gap-3">
            <Text className="text-[13px] font-bold text-on-surface-variant">{t('avatarFemaleSection')}</Text>
            <AvatarGrid ids={femaleIds} selectedValue={selectedValue} onSelect={setSelectedValue} />
          </View>
        </View>
      </ScrollView>

      <View className="px-container-margin pb-8 pt-2">
        <Pressable
          disabled={!selectedValue || completeOnboarding.isPending}
          onPress={onFinish}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90"
        >
          <Text className="text-on-primary text-[16px] font-bold">
            {completeOnboarding.isPending ? t('savingLabel') : t('finishButton')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
