import { useState } from 'react';
import { Image, Pressable, ScrollView, Switch, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { Icon } from '../../components/Icon';
import { OptionPickerModal } from '../../components/OptionPickerModal';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';
import { useColors } from '../../constants/theme';
import { resolveAvatarSource } from '../../constants/avatarPresets';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { usePrayerSettings } from '../../lib/hooks/usePrayerSettings';
import { useAvatar } from '../../lib/hooks/useAvatar';
import { useT } from '../../lib/hooks/useT';
import type { Locale } from '../../store/useLocaleStore';
import { CALC_METHOD_LABELS, MADHAB_LABELS, type CalcMethodKey, type MadhabKey } from '../../lib/prayerTimes';

const CALC_METHOD_OPTIONS = Object.entries(CALC_METHOD_LABELS).map(([key, label]) => ({ key, label }));
const MADHAB_OPTIONS = Object.entries(MADHAB_LABELS).map(([key, label]) => ({ key, label }));

export default function ProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const { settings, updateSettings } = usePrayerSettings();
  const { avatarUrl, setAvatar } = useAvatar();
  const { t, locale, setLocale } = useT();
  const Colors = useColors();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const [pickerOpen, setPickerOpen] = useState<'calcMethod' | 'madhab' | 'language' | 'avatar' | null>(null);
  const avatarSource = resolveAvatarSource(avatarUrl);

  const LANGUAGE_OPTIONS = [
    { key: 'bn', label: t('languageBangla') },
    { key: 'en', label: t('languageEnglish') },
  ];

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('profileTitle')} />
      <ScrollView
        className="flex-1 px-gutter"
        contentContainerClassName="items-center"
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 24 }}
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
        <Text className="text-[18px] font-bold text-on-surface">
          {session?.user.user_metadata?.full_name ?? 'Abdullah'}
        </Text>
        <Text className="text-on-surface-variant">{session?.user.email}</Text>

        <View className="mt-8 w-full gap-2">
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

          <Pressable className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70">
            <Text className="text-on-surface">{t('notificationSettings')}</Text>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70">
            <Text className="text-on-surface">{t('privacyPolicy')}</Text>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={() => supabase.auth.signOut()}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70 mt-2"
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
    </View>
  );
}
