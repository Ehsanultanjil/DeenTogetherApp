import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../components/Icon';
import { useT } from '../../lib/hooks/useT';

export default function Login() {
  const router = useRouter();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-surface justify-center px-container-margin">
      <View className="items-center mb-8">
        <View className="mb-md bg-primary-container p-6 rounded-2xl shadow-lg items-center justify-center">
          <Icon name="mosque" filled size={48} color="#a8e7c5" />
        </View>
        <Text className="text-[24px] text-primary font-bold">{t('welcomeBack')}</Text>
        <Text className="text-[14px] text-on-surface-variant mt-1">{t('signInSubtitle')}</Text>
      </View>

      <View className="gap-3 mb-4">
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
        onPress={onLogin}
        disabled={loading}
        className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90"
      >
        <Text className="text-on-primary text-[16px] font-bold">{loading ? t('signingIn') : t('login')}</Text>
      </Pressable>

      <Link href="/(auth)/signup" asChild>
        <Pressable className="mt-4 items-center">
          <Text className="text-primary text-[14px] font-semibold">{t('noAccountPrompt')}</Text>
        </Pressable>
      </Link>
    </View>
  );
}
