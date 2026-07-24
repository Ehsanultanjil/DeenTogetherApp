import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from './Text';
import { TextInput } from './TextInput';
import { useT } from '../lib/hooks/useT';
import { useKeyboardHeight } from '../lib/hooks/useKeyboardHeight';
import { useAuthStore } from '../store/useAuthStore';
import { useDeleteAccount } from '../lib/hooks/useAccount';

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Retype-the-email confirmation, same pattern as GitHub's "type the repo
// name to confirm" — no password involved, so this works the same whether
// or not the account has a password set.
export function DeleteAccountModal({ visible, onClose }: Props) {
  const { t } = useT();
  const keyboardHeight = useKeyboardHeight();
  const email = useAuthStore((s) => s.session?.user.email);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const deleteAccount = useDeleteAccount();

  const close = () => {
    setTyped('');
    setError(null);
    onClose();
  };

  const matches = !!email && typed.trim().toLowerCase() === email.trim().toLowerCase();

  const onConfirm = () => {
    if (!matches) return;
    setError(null);
    deleteAccount.mutate(undefined, {
      onError: (e) => setError((e as Error).message),
    });
  };

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
          <Text className="text-on-surface-variant text-[12px] mb-2">{t('deleteAccountTypeEmailHint', { email: email ?? '' })}</Text>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            placeholder={email ?? ''}
            autoCapitalize="none"
            keyboardType="email-address"
            className="h-14 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface"
          />
          {error ? <Text className="text-error text-[13px] mt-3">{error}</Text> : null}
          <Pressable
            onPress={onConfirm}
            disabled={!matches || deleteAccount.isPending}
            className="w-full h-14 bg-error rounded-full items-center justify-center active:opacity-90 mt-4"
          >
            <Text className="text-on-error font-bold text-[16px]">
              {deleteAccount.isPending ? t('deletingAccount') : t('deleteAccountConfirmButton')}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
