import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from '../components/Text';
import { useRouter } from 'expo-router';
import { AppLogo } from '../components/AppLogo';
import { useT } from '../lib/hooks/useT';
import { signInWithGoogle } from '../lib/auth/googleSignIn';
import { useColors } from '../constants/theme';

// Auth-based routing (redirecting away once signed in) is centralized in
// app/_layout.tsx's RootNavigation — see the comment there for why. This
// screen just renders the sign-in options.
export default function Splash() {
  const router = useRouter();
  const { t } = useT();
  const Colors = useColors();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const onGoogleSignIn = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Session updates via the auth listener in app/_layout.tsx —
      // RootNavigation there reacts and routes to /(tabs).
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message !== 'CANCELLED') setGoogleError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface justify-between">
      <View className="flex-1 items-center justify-center px-gutter">
        <View className="mb-md rounded-2xl shadow-lg overflow-hidden">
          <AppLogo size={112} />
        </View>
        <View className="items-center">
          <Text className="text-[28px] text-primary tracking-tight font-bold">DeenTogether</Text>
          <Text className="text-[16px] text-secondary opacity-80 mt-2 font-medium">{t('splashTagline')}</Text>
        </View>
      </View>
      <View className="px-container-margin pb-xxl gap-4">
        {googleError ? <Text className="text-error text-[13px] text-center">{googleError}</Text> : null}
        <Pressable
          onPress={onGoogleSignIn}
          disabled={googleLoading}
          className="w-full h-14 bg-surface-container-lowest border border-outline-variant rounded-full items-center justify-center active:opacity-90 flex-row gap-2"
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

        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-[1px] bg-outline-variant/40" />
          <Text className="text-[12px] text-on-surface-variant">{t('orDivider')}</Text>
          <View className="flex-1 h-[1px] bg-outline-variant/40" />
        </View>

        <Pressable
          onPress={() => router.push('/(auth)/login')}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90"
        >
          <Text className="text-on-primary text-[16px] font-bold">{t('login')}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(auth)/signup')}
          className="w-full h-14 bg-surface-container-lowest border-2 border-primary/10 rounded-full items-center justify-center active:opacity-90"
        >
          <Text className="text-primary text-[16px] font-bold">{t('createAccount')}</Text>
        </Pressable>
        <View className="mx-auto mt-4 w-32 h-1.5 bg-outline-variant/30 rounded-full" />
      </View>
    </View>
  );
}
