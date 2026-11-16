import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { AppLogo } from '../components/AppLogo';
import { Icon } from '../components/Icon';
import { useT } from '../lib/hooks/useT';
import { signInWithGoogle } from '../lib/auth/googleSignIn';
import { supabase } from '../lib/supabase';
import { useColors } from '../constants/theme';
import { useKeyboardHeight } from '../lib/hooks/useKeyboardHeight';

export default function Login() {
  const router = useRouter();
  const { t } = useT();
  const Colors = useColors();
  const keyboardHeight = useKeyboardHeight();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Auth listener in app/_layout.tsx will update session and route accordingly.
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message !== 'CANCELLED') setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const onPasswordSignIn = async () => {
    setError(null);
    setPasswordLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPasswordLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  const handleDismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Top Header with Back Button */}
      <View className="flex-row items-center justify-between px-container-margin pt-12 pb-2">
        <Pressable
          onPress={handleDismiss}
          className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon name="arrow_back" size={20} color={Colors.onSurface} />
        </Pressable>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: Platform.OS === 'android' ? keyboardHeight + 20 : 20,
        }}
        contentContainerClassName="px-container-margin"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <View className="mb-md rounded-2xl shadow-lg overflow-hidden">
            <AppLogo size={88} />
          </View>
          <Text className="text-[24px] text-primary font-bold">DeenTogether</Text>
          <Text className="text-[14px] text-on-surface-variant mt-1">{t('splashTagline')}</Text>
        </View>

        <Pressable
          onPress={onGoogleSignIn}
          disabled={googleLoading}
          className="w-full h-14 bg-surface-container-lowest border border-outline-variant rounded-full items-center justify-center active:opacity-90 flex-row gap-2 mb-4 shadow-sm"
        >
          {googleLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Text className="text-on-surface text-[16px] font-bold">G</Text>
              <Text className="text-on-surface text-[16px] font-bold">{t('continueWithGoogle')}</Text>
            </>
          )}
        </Pressable>

        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-1 h-[1px] bg-outline-variant/40" />
          <Text className="text-[12px] text-on-surface-variant">{t('orDivider')}</Text>
          <View className="flex-1 h-[1px] bg-outline-variant/40" />
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
          {error ? <Text className="text-error text-[13px] px-1">{error}</Text> : null}
        </View>

        <Pressable
          onPress={onPasswordSignIn}
          disabled={passwordLoading || !email.trim() || !password}
          className={`w-full h-14 rounded-full items-center justify-center active:opacity-90 ${
            email.trim() && password ? 'bg-primary' : 'bg-surface-container-high'
          }`}
        >
          {passwordLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              className={`text-[16px] font-bold ${
                email.trim() && password ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              {t('signInButton')}
            </Text>
          )}
        </Pressable>

        {/* Continue as Guest Button */}
        <Pressable
          onPress={handleDismiss}
          className="w-full py-3.5 items-center justify-center mt-2 active:opacity-70"
          hitSlop={8}
        >
          <Text className="text-primary font-semibold text-[15px]">{t('continueAsGuest')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

