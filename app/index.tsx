import { Pressable, View } from 'react-native';
import { Text } from '../components/Text';
import { Redirect, useRouter } from 'expo-router';
import { Icon } from '../components/Icon';
import { useAuthStore } from '../store/useAuthStore';
import { useT } from '../lib/hooks/useT';

export default function Splash() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { t } = useT();

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 bg-surface justify-between" style={{ backgroundColor: '#f8f9fa' }}>
      <View className="flex-1 items-center justify-center px-gutter">
        <View className="mb-md bg-primary-container p-6 rounded-2xl shadow-lg items-center justify-center">
          <Icon name="mosque" filled size={64} color="#a8e7c5" />
        </View>
        <View className="items-center">
          <Text className="text-[28px] text-primary tracking-tight font-bold">DeenTogether</Text>
          <Text className="text-[16px] text-secondary opacity-80 mt-2 font-medium">{t('splashTagline')}</Text>
        </View>
      </View>
      <View className="px-container-margin pb-xxl gap-4">
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
