import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { Icon } from '../../components/Icon';
import { PasswordModal } from '../../components/PasswordModal';
import { NotificationSettingsModal } from '../../components/NotificationSettingsModal';
import { DeleteAccountModal } from '../../components/DeleteAccountModal';
import { useColors } from '../../constants/theme';
import { useHasPassword } from '../../lib/hooks/useAccount';
import { useT } from '../../lib/hooks/useT';

export default function SettingsScreen() {
  const { t } = useT();
  const Colors = useColors();
  const hasPassword = useHasPassword();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('sectionSettings')} />
      <View className="px-gutter pt-4 gap-2">
        <Pressable
          onPress={() => setNotificationModalOpen(true)}
          className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
        >
          <Text className="text-on-surface">{t('notificationSettings')}</Text>
          <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
        </Pressable>

        <Pressable className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70">
          <Text className="text-on-surface">{t('privacyPolicy')}</Text>
          <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
        </Pressable>

        <Pressable
          onPress={() => setPasswordModalOpen(true)}
          className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
        >
          <Text className="text-on-surface">{hasPassword ? t('changePasswordRow') : t('createPasswordRow')}</Text>
          <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
        </Pressable>

        <Pressable
          onPress={() => setDeleteModalOpen(true)}
          className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
        >
          <Text className="text-error">{t('deleteAccountRow')}</Text>
          <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <PasswordModal visible={passwordModalOpen} isFirstPassword={!hasPassword} onClose={() => setPasswordModalOpen(false)} />
      <NotificationSettingsModal visible={notificationModalOpen} onClose={() => setNotificationModalOpen(false)} />
      <DeleteAccountModal visible={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </View>
  );
}
