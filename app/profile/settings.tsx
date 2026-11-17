import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../../components/TopAppBar';
import { SettingsRow } from '../../components/SettingsRow';
import { PasswordModal } from '../../components/PasswordModal';
import { NotificationSettingsModal } from '../../components/NotificationSettingsModal';
import { DeleteAccountModal } from '../../components/DeleteAccountModal';
import { useHasPassword } from '../../lib/hooks/useAccount';
import { useAuthStore } from '../../store/useAuthStore';
import { useT } from '../../lib/hooks/useT';

export default function SettingsScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { t } = useT();
  const hasPassword = useHasPassword();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar
        title={t('sectionSettings')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
      />
      <View className="px-gutter pt-4 gap-2">
        <SettingsRow label={t('notificationSettings')} onPress={() => setNotificationModalOpen(true)} />
        <SettingsRow label={t('privacyPolicy')} onPress={() => router.push('/profile/privacy')} />
        <SettingsRow label={t('aboutApp')} onPress={() => router.push('/profile/about')} />
        {session ? (
          <>
            <SettingsRow
              label={hasPassword ? t('changePasswordRow') : t('createPasswordRow')}
              onPress={() => setPasswordModalOpen(true)}
            />
            <SettingsRow label={t('deleteAccountRow')} labelClassName="text-error" onPress={() => setDeleteModalOpen(true)} />
          </>
        ) : null}
      </View>

      {session ? (
        <>
          <PasswordModal visible={passwordModalOpen} isFirstPassword={!hasPassword} onClose={() => setPasswordModalOpen(false)} />
          <DeleteAccountModal visible={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
        </>
      ) : null}
      <NotificationSettingsModal visible={notificationModalOpen} onClose={() => setNotificationModalOpen(false)} />
    </View>
  );
}
