import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/Icon';
import { useT } from '../../lib/hooks/useT';
import { useKeyboardHeight } from '../../lib/hooks/useKeyboardHeight';

export default function OnboardingName() {
  const router = useRouter();
  const { t } = useT();
  const [name, setName] = useState('');
  const keyboardHeight = useKeyboardHeight();

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: Platform.OS === 'android' ? keyboardHeight : 0,
        }}
        contentContainerClassName="px-container-margin"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <View className="mb-md bg-primary-container p-6 rounded-2xl shadow-lg items-center justify-center">
            <Icon name="groups" filled size={48} color="#a8e7c5" />
          </View>
          <Text className="text-[22px] text-primary font-bold text-center">{t('onboardingNameTitle')}</Text>
          <Text className="text-[14px] text-on-surface-variant mt-1 text-center">{t('onboardingNameSubtitle')}</Text>
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('displayNamePlaceholder')}
          autoCapitalize="words"
          className="h-14 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface mb-4"
        />

        <Pressable
          disabled={!name.trim()}
          onPress={() => router.push({ pathname: '/onboarding/avatar', params: { name: name.trim() } })}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90"
        >
          <Text className="text-on-primary text-[16px] font-bold">{t('continueButton')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
