import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { TextInput } from './TextInput';
import { useT } from '../lib/hooks/useT';
import { useSetPassword } from '../lib/hooks/useAccount';
import { useKeyboardHeight } from '../lib/hooks/useKeyboardHeight';
import { getErrorMessage } from '../lib/getErrorMessage';
import { BottomSheetModal } from './BottomSheetModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  isFirstPassword: boolean;
};

export function PasswordModal({ visible, onClose, isFirstPassword }: Props) {
  const { t } = useT();
  const keyboardHeight = useKeyboardHeight();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const setPasswordMutation = useSetPassword();

  const reset = () => {
    setPassword('');
    setConfirm('');
    setError(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = () => {
    setError(null);
    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('passwordsDontMatch'));
      return;
    }
    setPasswordMutation.mutate(password, {
      onSuccess: close,
      onError: (e) => setError(getErrorMessage(e)),
    });
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={close}
      title={isFirstPassword ? t('createPasswordTitle') : t('changePasswordTitle')}
      sheetStyle={{ marginBottom: keyboardHeight }}
    >
      <View className="p-6">
        <View className="gap-3">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('newPasswordPlaceholder')}
            secureTextEntry
            className="h-14 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface"
          />
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder={t('confirmNewPasswordPlaceholder')}
            secureTextEntry
            className="h-14 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface"
          />
        </View>
        {error ? <Text className="text-error text-[13px] mt-3">{error}</Text> : null}
        <Pressable
          onPress={onSubmit}
          disabled={setPasswordMutation.isPending}
          className="w-full h-14 bg-primary rounded-full items-center justify-center active:opacity-90 mt-4"
        >
          <Text className="text-on-primary font-bold text-[16px]">
            {setPasswordMutation.isPending ? t('savingPassword') : t('savePassword')}
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}
