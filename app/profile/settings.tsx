import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../../components/TopAppBar';
import { SettingsRow } from '../../components/SettingsRow';
import { PasswordModal } from '../../components/PasswordModal';
import { NotificationSettingsModal } from '../../components/NotificationSettingsModal';
import { DeleteAccountModal } from '../../components/DeleteAccountModal';
import { useHasPassword } from '../../lib/hooks/useAccount';
import { useT } from '../../lib/hooks/useT';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useT();
  const hasPassword = useHasPassword();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('sectionSettings')} />
      <View className="px-gutter pt-4 gap-2">
        <SettingsRow label={t('notificationSettings')} onPress={() => setNotificationModalOpen(true)} />
        <SettingsRow label={t('privacyPolicy')} onPress={() => router.push('/profile/privacy')} />
        <SettingsRow
          label={hasPassword ? t('changePasswordRow') : t('createPasswordRow')}
          onPress={() => setPasswordModalOpen(true)}
        />
        <SettingsRow label={t('deleteAccountRow')} labelClassName="text-error" onPress={() => setDeleteModalOpen(true)} />
      </View>

      <PasswordModal visible={passwordModalOpen} isFirstPassword={!hasPassword} onClose={() => setPasswordModalOpen(false)} />
      <NotificationSettingsModal visible={notificationModalOpen} onClose={() => setNotificationModalOpen(false)} />
      <DeleteAccountModal visible={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </View>
  );
}
