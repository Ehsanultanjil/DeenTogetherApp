import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../components/Text';
import { TextInput } from '../components/TextInput';
import { AppLogo } from '../components/AppLogo';
import { useT } from '../lib/hooks/useT';
import { signInWithGoogle } from '../lib/auth/googleSignIn';
import { supabase } from '../lib/supabase';
import { useColors } from '../constants/theme';
import { useKeyboardHeight } from '../lib/hooks/useKeyboardHeight';

// Auth-based routing (redirecting away once signed in) is centralized in
// app/_layout.tsx's RootNavigation — see the comment there for why. This
// screen just renders the sign-in options. There is no separate signup
// screen anymore: every new account is created via Google; the password
// field here is only for returning users who set one from Profile.
export default function Login() {
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
      // Session updates via the auth listener in app/_layout.tsx —
      // RootNavigation there reacts and routes to /(tabs).
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
    if (signInError) setError(signInError.message);
  };

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
          <View className="mb-md rounded-2xl shadow-lg overflow-hidden">
            <AppLogo size={96} />
          </View>
          <Text className="text-[24px] text-primary font-bold">DeenTogether</Text>
          <Text className="text-[14px] text-on-surface-variant mt-1">{t('splashTagline')}</Text>
        </View>

        <Pressable
          onPress={onGoogleSignIn}
          disabled={googleLoading}
          className="w-full h-14 bg-surface-container-lowest border border-outline-variant rounded-full items-center justify-center active:opacity-90 flex-row gap-2 mb-4"
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
        </View>

        {error ? <Text className="text-error text-[13px] mb-4 text-center">{error}</Text> : null}

        <Pressable
          onPress={onPasswordSignIn}
          disabled={!email || !password || passwordLoading}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90"
        >
          <Text className="text-on-primary text-[16px] font-bold">{passwordLoading ? t('signingIn') : t('login')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
