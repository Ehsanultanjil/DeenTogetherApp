import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { useT } from '../lib/hooks/useT';
import { signInWithGoogle } from '../lib/auth/googleSignIn';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
};

export function LoginPromptModal({ visible, onClose, title, description }: Props) {
  const router = useRouter();
  const { t } = useT();
  const Colors = useColors();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message !== 'CANCELLED') setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    onClose();
    router.push('/login');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/50 justify-end sm:justify-center p-4">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-surface rounded-3xl p-6 shadow-xl border border-surface-container-high w-full max-w-md self-center"
        >
          {/* Header Icon */}
          <View className="items-center mb-4">
            <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-3">
              <Icon name="lock" size={28} color={Colors.primary} />
            </View>
            <Text className="text-[20px] font-bold text-on-surface text-center">
              {title ?? t('signInToTrackTitle')}
            </Text>
            <Text className="text-[14px] text-on-surface-variant text-center mt-2 leading-relaxed">
              {description ?? t('signInToTrackDesc')}
            </Text>
          </View>

          {error ? <Text className="text-error text-[13px] text-center mb-3">{error}</Text> : null}

          {/* Action Buttons */}
          <View className="gap-2.5 mt-2">
            <Pressable
              onPress={onGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-13 bg-surface-container-lowest border border-outline-variant rounded-full items-center justify-center active:opacity-90 flex-row gap-2 shadow-sm"
            >
              {googleLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Text className="text-on-surface text-[15px] font-bold">G</Text>
                  <Text className="text-on-surface text-[15px] font-bold">{t('continueWithGoogle')}</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={handleEmailSignIn}
              className="w-full h-13 bg-primary rounded-full items-center justify-center active:opacity-90 flex-row gap-2"
            >
              <Icon name="mail" size={18} color="#ffffff" />
              <Text className="text-on-primary text-[15px] font-bold">{t('signInWithEmail')}</Text>
            </Pressable>

            <Pressable onPress={onClose} className="w-full py-2.5 items-center justify-center mt-1 active:opacity-70">
              <Text className="text-on-surface-variant text-[14px] font-semibold">{t('skipButton')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

