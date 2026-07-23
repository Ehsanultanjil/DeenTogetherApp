import { useEffect, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, Switch, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Text } from '../components/Text';
import { TopAppBar } from '../components/TopAppBar';
import { Icon } from '../components/Icon';
import { useColors } from '../constants/theme';
import { useNotificationSettings } from '../lib/hooks/useNotificationSettings';
import { requestPrayerNotificationPermission } from '../lib/hooks/usePrayerNotifications';
import { useT } from '../lib/hooks/useT';

export default function NotificationSettingsScreen() {
  const { t } = useT();
  const Colors = useColors();
  const { enabled, setEnabled } = useNotificationSettings();
  const [osGranted, setOsGranted] = useState<boolean | null>(null);

  const refreshPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setOsGranted(status === 'granted');
  };

  useEffect(() => {
    refreshPermission();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshPermission();
    });
    return () => sub.remove();
  }, []);

  const onToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPrayerNotificationPermission();
      setOsGranted(granted);
    }
    setEnabled(value);
  };

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('notificationSettingsTitle')} showBack />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 48, paddingTop: 16 }}>
        <View className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-2">
              <Text className="text-on-surface font-semibold">{t('notificationsMasterLabel')}</Text>
              <Text className="text-on-surface-variant text-[12px] mt-0.5">{t('notificationsMasterDescription')}</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={onToggle}
              trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row items-center gap-3">
          <Icon
            name={osGranted ? 'check_circle' : 'info'}
            color={osGranted ? Colors.primary : Colors.error}
            filled={!!osGranted}
          />
          <Text className="text-on-surface flex-1">
            {osGranted ? t('notificationPermissionGranted') : t('notificationPermissionDenied')}
          </Text>
        </View>

        {osGranted === false ? (
          <View className="mt-3">
            <Text className="text-on-surface-variant text-[12px] mb-3 leading-4">
              {t('notificationPermissionDeniedHint')}
            </Text>
            <Pressable
              onPress={() => Linking.openSettings()}
              className="w-full h-12 bg-primary rounded-full items-center justify-center active:opacity-90"
            >
              <Text className="text-on-primary font-bold text-[14px]">{t('openSystemSettings')}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
