import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../components/Icon';
import { useT } from '../../lib/hooks/useT';

export default function Signup() {
  const router = useRouter();
  const { t } = useT();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const onSignup = async () => {
    setError(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.replace('/(tabs)');
    } else {
      // Email confirmation required before a session is issued.
      setNeedsConfirmation(true);
    }
  };

  if (needsConfirmation) {
    return (
      <View className="flex-1 bg-surface justify-center items-center px-container-margin">
        <Icon name="notifications" size={48} color="#0f5238" />
        <Text className="text-[20px] font-bold text-on-surface mt-4 text-center">{t('checkEmailTitle')}</Text>
        <Text className="text-[14px] text-on-surface-variant mt-2 text-center">
          {t('checkEmailBody', { email })}
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-8 h-14 px-8 bg-primary rounded-full items-center justify-center">
            <Text className="text-on-primary font-bold text-[16px]">{t('backToLogin')}</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface justify-center px-container-margin">
      <View className="items-center mb-8">
        <View className="mb-md bg-primary-container p-6 rounded-2xl shadow-lg items-center justify-center">
          <Icon name="mosque" filled size={48} color="#a8e7c5" />
        </View>
        <Text className="text-[24px] text-primary font-bold">{t('createYourAccount')}</Text>
        <Text className="text-[14px] text-on-surface-variant mt-1">{t('joinSubtitle')}</Text>
      </View>

      <View className="gap-3 mb-4">
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('fullNamePlaceholder')}
          className="h-14 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('emailPlaceholder')}
          autoCapitalize="none"
          keyboardType="email-address"
          className="h-14 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('passwordPlaceholder')}
          secureTextEntry
          className="h-14 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface"
        />
      </View>

      {error ? <Text className="text-error text-[13px] mb-4">{error}</Text> : null}

      <Pressable
        onPress={onSignup}
        disabled={loading}
        className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90"
      >
        <Text className="text-on-primary text-[16px] font-bold">{loading ? t('creatingAccount') : t('createAccount')}</Text>
      </Pressable>

      <Link href="/(auth)/login" asChild>
        <Pressable className="mt-4 items-center">
          <Text className="text-primary text-[14px] font-semibold">{t('haveAccountPrompt')}</Text>
        </Pressable>
      </Link>
    </View>
  );
}
