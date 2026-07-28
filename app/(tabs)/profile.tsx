import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';
import { Icon } from '../../components/Icon';
import { AvatarPickerModal } from '../../components/AvatarPickerModal';
import { useColors } from '../../constants/theme';
import { resolveAvatarSource } from '../../constants/avatarPresets';
import { supabase } from '../../lib/supabase';
import { confirmDestructive } from '../../lib/confirmDestructive';
import { useAuthStore } from '../../store/useAuthStore';
import { useAvatar } from '../../lib/hooks/useAvatar';
import { useFullName } from '../../lib/hooks/useFullName';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { useT } from '../../lib/hooks/useT';

export default function ProfileScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { avatarUrl, setAvatar } = useAvatar();
  const { fullName, updateFullName } = useFullName();
  const { t } = useT();
  const Colors = useColors();
  const tabBarHeight = useTabBarHeight();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const avatarSource = resolveAvatarSource(avatarUrl);

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('profileTitle')} />
      <ScrollView
        className="flex-1 px-gutter"
        contentContainerClassName="items-center"
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 24 }}
      >
        <Pressable onPress={() => setAvatarPickerOpen(true)} className="w-24 h-24 rounded-full mb-4 active:opacity-80">
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

        <View className="mt-8 w-full gap-2">
          <Pressable
            onPress={() => router.push('/profile/namaj')}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
          >
            <Text className="text-on-surface">{t('sectionPrayerSettings')}</Text>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile/theme')}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
          >
            <Text className="text-on-surface">{t('themeTitle')}</Text>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile/language')}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
          >
            <Text className="text-on-surface">{t('languageLabel')}</Text>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile/settings')}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
          >
            <Text className="text-on-surface">{t('sectionSettings')}</Text>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </ScrollView>

      <View className="w-full px-gutter" style={{ paddingBottom: tabBarHeight + 16, paddingTop: 8 }}>
        <Pressable
          onPress={() =>
            confirmDestructive(t('logoutConfirmTitle'), t('logoutConfirmBody'), t('logOut'), t('cancel'), () =>
              supabase.auth.signOut(),
            )
          }
          className="w-full p-4 bg-error/10 rounded-xl border border-error flex-row justify-between items-center active:opacity-70"
        >
          <Text className="text-error font-semibold">{t('logOut')}</Text>
        </Pressable>
      </View>

      <AvatarPickerModal
        visible={avatarPickerOpen}
        title={t('chooseAvatarTitle')}
        maleLabel={t('avatarMaleSection')}
        femaleLabel={t('avatarFemaleSection')}
        selectedValue={avatarUrl}
        onSelect={(value) => {
          setAvatar(value);
          setAvatarPickerOpen(false);
        }}
        onClose={() => setAvatarPickerOpen(false)}
      />
    </View>
  );
}
