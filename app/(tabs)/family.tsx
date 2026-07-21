import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { TopAppBar } from '../../components/TopAppBar';
import { InviteCodeCard } from '../../components/InviteCodeCard';
import { FamilyMemberRow } from '../../components/FamilyMemberRow';
import { Icon } from '../../components/Icon';
import { useColors } from '../../constants/theme';
import {
  useMyMemberships,
  useCurrentFamilyId,
  useFamilyTodayStatus,
  useCreateFamily,
  useSwitchFamily,
  useLeaveFamily,
} from '../../lib/hooks/useFamily';
import { useAuthStore } from '../../store/useAuthStore';
import { useT } from '../../lib/hooks/useT';

function CreateFamilyPrompt() {
  const router = useRouter();
  const { t } = useT();
  const Colors = useColors();
  const [name, setName] = useState('');
  const createFamily = useCreateFamily();

  return (
    <View className="bg-surface-container-lowest shadow-sm border border-surface-container-high rounded-2xl p-6">
      <Icon name="groups" filled color={Colors.primary} size={32} />
      <Text className="text-[20px] font-bold text-on-surface mt-3 mb-1">{t('startCircleTitle')}</Text>
      <Text className="text-[14px] text-on-surface-variant mb-4">{t('startCircleSubtitle')}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('familyNamePlaceholder')}
        className="h-14 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface mb-3"
      />
      <Pressable
        disabled={!name.trim() || createFamily.isPending}
        onPress={() => createFamily.mutate(name.trim())}
        className="w-full h-14 bg-primary rounded-full items-center justify-center active:opacity-90 mb-3"
      >
        <Text className="text-on-primary font-bold text-[16px]">
          {createFamily.isPending ? t('creatingAccount') : t('createFamilyButton')}
        </Text>
      </Pressable>
      {createFamily.isError ? (
        <Text className="text-error text-[13px] mb-2">{(createFamily.error as Error).message}</Text>
      ) : null}
      <Pressable onPress={() => router.push('/family/join')} className="items-center py-2">
        <Text className="text-primary text-[14px] font-semibold">{t('haveInviteCode')}</Text>
      </Pressable>
    </View>
  );
}

export default function FamilyScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { t, n } = useT();
  const Colors = useColors();
  const [copied, setCopied] = useState(false);

  const { data: memberships, isLoading: membershipsLoading } = useMyMemberships();
  const { data: currentFamilyId, isLoading: currentLoading } = useCurrentFamilyId();
  const switchFamily = useSwitchFamily();
  const leaveFamily = useLeaveFamily();

  const { data: members } = useFamilyTodayStatus(currentFamilyId ?? null);

  const current = memberships?.find((m) => m.familyId === currentFamilyId);

  const copyCode = async () => {
    if (!current) return;
    await Clipboard.setStringAsync(current.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = async () => {
    if (!current) return;
    await Share.share({ message: t('shareInviteMessage', { code: current.inviteCode }) });
  };

  if (membershipsLoading || currentLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!memberships || memberships.length === 0) {
    return (
      <View className="flex-1 bg-surface">
        <TopAppBar title={t('myFamilyTitle')} />
        <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingTop: 24, paddingBottom: 48 }}>
          <CreateFamilyPrompt />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('myFamilyTitle')} />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 48, paddingTop: 16 }}>
        {memberships.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerClassName="gap-2">
            {memberships.map((m) => (
              <Pressable
                key={m.familyId}
                onPress={() => switchFamily.mutate(m.familyId)}
                className={`px-4 py-2 rounded-full border ${
                  m.familyId === currentFamilyId ? 'bg-primary border-primary' : 'bg-surface-container-lowest border-outline-variant'
                }`}
              >
                <Text className={m.familyId === currentFamilyId ? 'text-on-primary font-semibold' : 'text-on-surface'}>
                  {m.familyName}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {current ? (
          <View className="mb-8">
            <InviteCodeCard code={current.inviteCode} onShare={shareCode} title={t('inviteMember')} subtitle={t('shareCodeSubtitle')} />
            <Pressable onPress={copyCode} className="mt-2 items-center py-1">
              <Text className="text-primary text-[13px] font-semibold">{t('copyCodeInstead')}</Text>
            </Pressable>
          </View>
        ) : null}

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[18px] font-bold text-on-surface">{t('membersCount', { count: n(members?.length ?? 0) })}</Text>
          <View className="bg-secondary-container px-3 py-1 rounded-full">
            <Text className="text-on-secondary-container text-[12px] font-bold">{t('active')}</Text>
          </View>
        </View>
        <View className="gap-3">
          {(members ?? []).map((m) => (
            <FamilyMemberRow
              key={m.user_id}
              name={
                m.user_id === session?.user.id
                  ? `${m.full_name ?? t('memberRole')} ${t('youSuffix')}`
                  : (m.full_name ?? t('memberRole'))
              }
              role={m.role === 'admin' ? t('familyAdmin') : t('memberRole')}
              progressLabel={`${n(m.percent)}%`}
              dotsCompleted={0}
              avatarUri={m.avatar_url ?? undefined}
              isAdmin={m.role === 'admin'}
              size="lg"
              todayLabel={t('todayLabel')}
            />
          ))}
        </View>

        <View className="mt-8 items-center gap-2">
          <Pressable onPress={() => router.push('/family/join')} className="flex-row items-center gap-2 px-6 py-3">
            <Icon name="groups" color={Colors.primary} />
            <Text className="text-primary text-[14px] font-bold">{t('joinAnotherFamily')}</Text>
          </Pressable>
          <Pressable
            onPress={() => current && leaveFamily.mutate(current.familyId)}
            className="flex-row items-center gap-2 px-6 py-3"
          >
            <Text className="text-error text-[14px] font-bold">{t('leaveThisFamily')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {copied ? (
        <View className="absolute bottom-8 self-center bg-on-background px-6 py-3 rounded-full shadow-lg">
          <Text className="text-background text-[14px] font-bold">{t('codeCopied')}</Text>
        </View>
      ) : null}
    </View>
  );
}
