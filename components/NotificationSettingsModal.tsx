import { useEffect, useState } from 'react';
import { AppState, Linking, Pressable, ScrollView, Switch, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { useNotificationSettings } from '../lib/hooks/useNotificationSettings';
import { requestPrayerNotificationPermission } from '../lib/hooks/usePrayerNotifications';
import { useT } from '../lib/hooks/useT';
import { BottomSheetModal } from './BottomSheetModal';
import { WAQT_ORDER, WAQT_ICON, waqtDisplayKey } from '../constants/waqt';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationSettingsModal({ visible, onClose }: Props) {
  const { t } = useT();
  const Colors = useColors();
  const { enabled, setEnabled, waqtPrefs, toggleWaqt } = useNotificationSettings();
  const [osGranted, setOsGranted] = useState<boolean | null>(null);

  const refreshPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setOsGranted(status === 'granted');
  };

  useEffect(() => {
    if (!visible) return;
    refreshPermission();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshPermission();
    });
    return () => sub.remove();
  }, [visible]);

  const onToggle = async (value: boolean) => {
    if (value) {
      try {
        const granted = await requestPrayerNotificationPermission();
        setOsGranted(granted);
      } catch {
        setOsGranted(false);
        return;
      }
    }
    setEnabled(value);
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('notificationSettingsTitle')}
      sheetStyle={{ maxHeight: '85%' }}
    >
      <ScrollView className="px-gutter" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        <View className="w-full p-4 bg-surface rounded-xl border border-surface-variant mb-3">
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

        {/* Individual Waqt Notifications */}
        <View className="w-full p-4 bg-surface rounded-xl border border-surface-variant mb-3">
          <Text className="text-on-surface font-semibold mb-1">{t('waqtNotificationsTitle')}</Text>
          <Text className="text-on-surface-variant text-[12px] mb-3">{t('waqtNotificationsSubtitle')}</Text>
          <View className="gap-1">
            {WAQT_ORDER.map((waqt) => {
              const isWaqtOn = waqtPrefs[waqt] ?? true;
              return (
                <View
                  key={waqt}
                  className="flex-row justify-between items-center py-2.5 border-b border-surface-variant/40 last:border-b-0"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-surface-container items-center justify-center">
                      <Icon
                        name={WAQT_ICON[waqt]}
                        size={16}
                        color={isWaqtOn && enabled ? Colors.primary : Colors.onSurfaceVariant}
                      />
                    </View>
                    <Text
                      className={`text-[14px] ${
                        isWaqtOn && enabled ? 'font-semibold text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {t(waqtDisplayKey(waqt, false))}
                    </Text>
                  </View>
                  <Switch
                    value={isWaqtOn}
                    disabled={!enabled}
                    onValueChange={(val) => toggleWaqt(waqt, val)}
                    trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
                    thumbColor="#ffffff"
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View className="w-full p-4 bg-surface rounded-xl border border-surface-variant flex-row items-center gap-3">
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
    </BottomSheetModal>
  );
}
