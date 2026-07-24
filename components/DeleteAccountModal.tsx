import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from './Text';
import { TextInput } from './TextInput';
import { useT } from '../lib/hooks/useT';
import { useKeyboardHeight } from '../lib/hooks/useKeyboardHeight';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useDeleteAccount } from '../lib/hooks/useAccount';

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Only rendered when the account has a password set — re-verifies it via
// signInWithPassword (Supabase has no lighter-weight "confirm current
// password" call) before actually deleting, so deletion isn't a single tap
// away for anyone who gets hold of an unlocked phone.
export function DeleteAccountModal({ visible, onClose }: Props) {
  const { t } = useT();
  const keyboardHeight = useKeyboardHeight();
  const email = useAuthStore((s) => s.session?.user.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const deleteAccount = useDeleteAccount();

  const close = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const onConfirm = async () => {
    if (!email) return;
    setError(null);
    setVerifying(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setVerifying(false);
    if (signInError) {
      setError(t('incorrectPassword'));
      return;
    }
    deleteAccount.mutate(undefined, {
      onError: (e) => setError((e as Error).message),
    });
  };

  const busy = verifying || deleteAccount.isPending;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable className="flex-1 bg-black/30 justify-end" onPress={close}>
        <Pressable
          className="bg-surface-container-lowest rounded-t-2xl p-6"
          style={{ marginBottom: keyboardHeight }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-[16px] font-bold text-error text-center mb-2">{t('deleteAccountConfirmTitle')}</Text>
          <Text className="text-on-surface-variant text-[13px] text-center mb-4">{t('deleteAccountConfirmBody')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('currentPasswordPlaceholder')}
            secureTextEntry
            className="h-14 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface"
          />
          {error ? <Text className="text-error text-[13px] mt-3">{error}</Text> : null}
          <Pressable
            onPress={onConfirm}
            disabled={!password || busy}
            className="w-full h-14 bg-error rounded-full items-center justify-center active:opacity-90 mt-4"
          >
            <Text className="text-on-error font-bold text-[16px]">
              {busy ? t('deletingAccount') : t('deleteAccountConfirmButton')}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
