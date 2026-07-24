import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Switch, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';
import { Icon } from '../../components/Icon';
import { OptionPickerModal } from '../../components/OptionPickerModal';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';
import { PasswordModal } from '../../components/PasswordModal';
import { NotificationSettingsModal } from '../../components/NotificationSettingsModal';
import { DeleteAccountModal } from '../../components/DeleteAccountModal';
import { useColors } from '../../constants/theme';
import { resolveAvatarSource } from '../../constants/avatarPresets';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { usePrayerSettings } from '../../lib/hooks/usePrayerSettings';
import { useAvatar } from '../../lib/hooks/useAvatar';
import { useFullName } from '../../lib/hooks/useFullName';
import { useHasPassword, useDeleteAccount } from '../../lib/hooks/useAccount';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { useT } from '../../lib/hooks/useT';
import type { Locale } from '../../store/useLocaleStore';
import {
  CALC_METHOD_LABELS,
  MADHAB_LABELS,
  SAFETY_MARGIN_OPTIONS,
  type CalcMethodKey,
  type MadhabKey,
  type SafetyMarginMinutes,
} from '../../lib/prayerTimes';

const CALC_METHOD_OPTIONS = Object.entries(CALC_METHOD_LABELS).map(([key, label]) => ({ key, label }));
const MADHAB_OPTIONS = Object.entries(MADHAB_LABELS).map(([key, label]) => ({ key, label }));

const SAFETY_MARGIN_KEY: Record<
  SafetyMarginMinutes,
  'safetyMargin0' | 'safetyMargin1' | 'safetyMargin2' | 'safetyMargin3' | 'safetyMargin4' | 'safetyMargin5'
> = {
  0: 'safetyMargin0',
  1: 'safetyMargin1',
  2: 'safetyMargin2',
  3: 'safetyMargin3',
  4: 'safetyMargin4',
  5: 'safetyMargin5',
};

function SectionLabel({ children }: { children: string }) {
  return <Text className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">{children}</Text>;
}

export default function ProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const { settings, updateSettings } = usePrayerSettings();
  const { avatarUrl, setAvatar } = useAvatar();
  const { fullName, updateFullName } = useFullName();
  const { t, locale, setLocale } = useT();
  const Colors = useColors();
  const tabBarHeight = useTabBarHeight();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const [pickerOpen, setPickerOpen] = useState<'calcMethod' | 'madhab' | 'safetyMargin' | 'language' | 'avatar' | null>(
    null,
  );
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const avatarSource = resolveAvatarSource(avatarUrl);
  const hasPassword = useHasPassword();
  const deleteAccount = useDeleteAccount();

  const onDeleteAccount = () => {
    if (hasPassword) {
      setDeleteModalOpen(true);
      return;
    }
    Alert.alert(t('deleteAccountConfirmTitle'), t('deleteAccountConfirmBody'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteAccountConfirmButton'),
        style: 'destructive',
        onPress: () => {
          deleteAccount.mutate(undefined, {
            onError: (e) => Alert.alert(t('deleteAccountFailedTitle'), (e as Error).message),
          });
        },
      },
    ]);
  };

  const LANGUAGE_OPTIONS = [
    { key: 'bn', label: t('languageBangla') },
    { key: 'en', label: t('languageEnglish') },
  ];

  const SAFETY_MARGIN_LABELS = Object.fromEntries(
    SAFETY_MARGIN_OPTIONS.map((m) => [m, t(SAFETY_MARGIN_KEY[m])]),
  ) as Record<SafetyMarginMinutes, string>;
  const SAFETY_MARGIN_PICKER_OPTIONS = SAFETY_MARGIN_OPTIONS.map((m) => ({ key: String(m), label: SAFETY_MARGIN_LABELS[m] }));

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('profileTitle')} />
      <ScrollView
        className="flex-1 px-gutter"
        contentContainerClassName="items-center"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16, paddingTop: 24 }}
      >
        <Pressable
          onPress={() => setPickerOpen('avatar')}
          className="w-24 h-24 rounded-full mb-4 active:opacity-80"
        >
          <View className="w-24 h-24 bg-surface-container-high rounded-full items-center justify-center overflow-hidden">
            {avatarSource ? (
              <Image source={avatarSource} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Icon name="person" size={48} color={Colors.onSurfaceVariant} />
            )}
          </View>
          <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-surface">
            <Icon name="add" size={16} color="#ffffff" />
          </View>
        </Pressable>
        {editingName ? (
          <View className="w-full items-center gap-2">
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              className="text-[18px] font-bold text-on-surface text-center border-b border-outline-variant px-2 py-1 min-w-[160px]"
            />
            <View className="flex-row gap-4">
              <Pressable onPress={() => setEditingName(false)} className="py-1 px-2">
                <Text className="text-on-surface-variant text-[13px] font-semibold">{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const trimmed = nameDraft.trim();
                  if (trimmed) updateFullName(trimmed);
                  setEditingName(false);
                }}
                className="py-1 px-2"
              >
                <Text className="text-primary text-[13px] font-bold">{t('save')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setNameDraft(fullName);
              setEditingName(true);
            }}
            className="flex-row items-center gap-1.5 active:opacity-70"
          >
            <Text className="text-[18px] font-bold text-on-surface">{fullName || 'Abdullah'}</Text>
            <Icon name="edit" size={14} color={Colors.onSurfaceVariant} />
          </Pressable>
        )}
        <Text className="text-on-surface-variant">{session?.user.email}</Text>

        <View className="mt-8 w-full gap-6">
          <View className="gap-2">
            <SectionLabel>{t('sectionPrayerSettings')}</SectionLabel>
            <Pressable
              onPress={() => setPickerOpen('calcMethod')}
              className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
            >
              <View>
                <Text className="text-on-surface">{t('prayerCalcMethod')}</Text>
                <Text className="text-on-surface-variant text-[12px] mt-0.5">
                  {CALC_METHOD_LABELS[settings.calcMethod]}
                </Text>
              </View>
              <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
            </Pressable>

            <Pressable
              onPress={() => setPickerOpen('madhab')}
              className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
            >
              <View>
                <Text className="text-on-surface">{t('madhabLabel')}</Text>
                <Text className="text-on-surface-variant text-[12px] mt-0.5">{MADHAB_LABELS[settings.madhab]}</Text>
              </View>
              <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
            </Pressable>

            <Pressable
              onPress={() => setPickerOpen('safetyMargin')}
              className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant active:opacity-70"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-2">
                  <Text className="text-on-surface">{t('safetyMarginLabel')}</Text>
                  <Text className="text-on-surface-variant text-[12px] mt-0.5">{t('safetyMarginRecommended')}</Text>
                  <Text className="text-primary text-[12px] mt-0.5 font-semibold">
                    {SAFETY_MARGIN_LABELS[settings.safetyMarginMinutes]}
                  </Text>
                </View>
                <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
              </View>
              <Text className="text-on-surface-variant text-[11px] mt-2 leading-4">{t('safetyMarginDescription')}</Text>
            </Pressable>
          </View>

          <View className="gap-2">
            <SectionLabel>{t('sectionAppearance')}</SectionLabel>
            <Pressable
              onPress={() => setPickerOpen('language')}
              className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
            >
              <View>
                <Text className="text-on-surface">{t('languageLabel')}</Text>
                <Text className="text-on-surface-variant text-[12px] mt-0.5">
                  {locale === 'bn' ? t('languageBangla') : t('languageEnglish')}
                </Text>
              </View>
              <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
            </Pressable>

            <View className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <Icon name={themeMode === 'dark' ? 'dark_mode' : 'light_mode'} color={Colors.onSurfaceVariant} />
                <Text className="text-on-surface">{t('darkMode')}</Text>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          <View className="gap-2">
            <SectionLabel>{t('sectionSettings')}</SectionLabel>
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
              onPress={onDeleteAccount}
              disabled={deleteAccount.isPending}
              className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
            >
              <Text className="text-error">{t('deleteAccountRow')}</Text>
              <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => supabase.auth.signOut()}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
          >
            <Text className="text-error font-semibold">{t('logOut')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={pickerOpen === 'calcMethod'}
        title={t('prayerCalcMethod')}
        options={CALC_METHOD_OPTIONS}
        selectedKey={settings.calcMethod}
        onSelect={(key) => updateSettings({ calcMethod: key as CalcMethodKey })}
        onClose={() => setPickerOpen(null)}
      />
      <OptionPickerModal
        visible={pickerOpen === 'madhab'}
        title={t('madhabLabel')}
        options={MADHAB_OPTIONS}
        selectedKey={settings.madhab}
        onSelect={(key) => updateSettings({ madhab: key as MadhabKey })}
        onClose={() => setPickerOpen(null)}
      />
      <OptionPickerModal
        visible={pickerOpen === 'safetyMargin'}
        title={t('safetyMarginLabel')}
        options={SAFETY_MARGIN_PICKER_OPTIONS}
        selectedKey={String(settings.safetyMarginMinutes)}
        onSelect={(key) => updateSettings({ safetyMarginMinutes: Number(key) as SafetyMarginMinutes })}
        onClose={() => setPickerOpen(null)}
      />
      <OptionPickerModal
        visible={pickerOpen === 'language'}
        title={t('languageLabel')}
        options={LANGUAGE_OPTIONS}
        selectedKey={locale}
        onSelect={(key) => setLocale(key as Locale)}
        onClose={() => setPickerOpen(null)}
      />
      <AvatarPickerModal
        visible={pickerOpen === 'avatar'}
        title={t('chooseAvatarTitle')}
        maleLabel={t('avatarMaleSection')}
        femaleLabel={t('avatarFemaleSection')}
        selectedValue={avatarUrl}
        onSelect={(value) => {
          setAvatar(value);
          setPickerOpen(null);
        }}
        onClose={() => setPickerOpen(null)}
      />
      <PasswordModal
        visible={passwordModalOpen}
        isFirstPassword={!hasPassword}
        onClose={() => setPasswordModalOpen(false)}
      />
      <NotificationSettingsModal visible={notificationModalOpen} onClose={() => setNotificationModalOpen(false)} />
      <DeleteAccountModal visible={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </View>
  );
}
