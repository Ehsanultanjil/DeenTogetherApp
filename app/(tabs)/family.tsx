import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { TopAppBar } from '../../components/TopAppBar';
import { InviteCodeCard } from '../../components/InviteCodeCard';
import { FamilyMemberRow } from '../../components/FamilyMemberRow';
import { FamilyDeleteModal } from '../../components/FamilyDeleteModal';
import { Icon } from '../../components/Icon';
import { useColors } from '../../constants/theme';
import { resolveAvatarSource } from '../../constants/avatarPresets';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import {
  useMyMemberships,
  useCurrentFamilyId,
  useFamilyTodayStatus,
  useCreateFamily,
  useSwitchFamily,
  useLeaveFamily,
  usePromoteMember,
  useDeleteFamily,
  usePendingJoinRequests,
  useRespondToJoinRequest,
} from '../../lib/hooks/useFamily';
import { useAuthStore } from '../../store/useAuthStore';
import { useT } from '../../lib/hooks/useT';
import { usePrayerSettings } from '../../lib/hooks/usePrayerSettings';
import { usePrayerTimes } from '../../lib/hooks/usePrayerTimes';
import { useClockTick } from '../../lib/hooks/useClockTick';
import { getCurrentWaqt } from '../../lib/prayerTimes';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const tabBarHeight = useTabBarHeight();

  const { data: memberships, isLoading: membershipsLoading } = useMyMemberships();
  const { data: currentFamilyId, isLoading: currentLoading } = useCurrentFamilyId();
  const switchFamily = useSwitchFamily();
  const leaveFamily = useLeaveFamily();
  const promoteMember = usePromoteMember();
  const deleteFamily = useDeleteFamily();

  const { settings } = usePrayerSettings();
  const { times } = usePrayerTimes(settings);
  const now = useClockTick(60_000);
  const currentWaqt = times ? getCurrentWaqt(times.windows, now).current.name : null;

  const { data: members } = useFamilyTodayStatus(currentFamilyId ?? null, currentWaqt);

  const current = memberships?.find((m) => m.familyId === currentFamilyId);
  const { data: pendingRequests } = usePendingJoinRequests(currentFamilyId ?? null, current?.role === 'admin');
  const respondToJoinRequest = useRespondToJoinRequest();

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
        <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingTop: 24, paddingBottom: tabBarHeight + 16 }}>
          <CreateFamilyPrompt />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('myFamilyTitle')} />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: tabBarHeight + 16, paddingTop: 16 }}>
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
            <InviteCodeCard
              code={current.inviteCode}
              onShare={shareCode}
              onCopy={copyCode}
              title={t('inviteMember')}
              subtitle={t('shareCodeSubtitle')}
            />
          </View>
        ) : null}

        {(pendingRequests ?? []).length > 0 ? (
          <View className="mb-8 gap-2">
            <Text className="text-[15px] font-bold text-on-surface">
              {t('pendingRequestsTitle', { count: n(pendingRequests!.length) })}
            </Text>
            {pendingRequests!.map((req) => (
              <View
                key={req.id}
                className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-variant/10 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10 bg-surface-container-high items-center justify-center">
                    {resolveAvatarSource(req.avatarUrl ?? undefined) ? (
                      <Image source={resolveAvatarSource(req.avatarUrl ?? undefined)} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Icon name="person" size={18} color="#404943" />
                    )}
                  </View>
                  <Text className="text-on-surface font-semibold flex-1" numberOfLines={1}>
                    {req.fullName ?? t('memberRole')}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => respondToJoinRequest.mutate({ requestId: req.id, approve: false })}
                    className="px-3 py-1.5 rounded-full bg-surface-container-high active:opacity-80"
                  >
                    <Text className="text-[12px] font-bold text-on-surface-variant">{t('declineRequest')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => respondToJoinRequest.mutate({ requestId: req.id, approve: true })}
                    className="px-3 py-1.5 rounded-full bg-primary-container active:opacity-80"
                  >
                    <Text className="text-[12px] font-bold text-on-primary-container">{t('approveRequest')}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[18px] font-bold text-on-surface">{t('membersCount', { count: n(members?.length ?? 0) })}</Text>
          <View className="bg-secondary-container px-3 py-1 rounded-full">
            <Text className="text-on-secondary-container text-[12px] font-bold">{t('active')}</Text>
          </View>
        </View>
        <View className="gap-3">
          {(members ?? []).map((m) => {
            const isSelf = m.user_id === session?.user.id;
            return (
              <FamilyMemberRow
                key={m.user_id}
                name={isSelf ? `${m.full_name ?? t('memberRole')} ${t('youSuffix')}` : (m.full_name ?? t('memberRole'))}
                role={m.role === 'admin' ? t('familyAdmin') : t('memberRole')}
                progressLabel={`${n(m.percent)}%`}
                dotsCompleted={0}
                avatarUri={m.avatar_url ?? undefined}
                isAdmin={m.role === 'admin'}
                size="lg"
                todayLabel={t('todayLabel')}
              />
            );
          })}
        </View>

        <View className="mt-8 items-center gap-2">
          <Pressable onPress={() => router.push('/family/join')} className="flex-row items-center gap-2 px-6 py-3">
            <Icon name="groups" color={Colors.primary} />
            <Text className="text-primary text-[14px] font-bold">{t('joinAnotherFamily')}</Text>
          </Pressable>
          {current?.role === 'admin' ? (
            <Pressable onPress={() => setDeleteModalOpen(true)} className="flex-row items-center gap-2 px-6 py-3">
              <Text className="text-error text-[14px] font-bold">{t('deleteFamily')}</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => current && leaveFamily.mutate(current.familyId)}
              className="flex-row items-center gap-2 px-6 py-3"
            >
              <Text className="text-error text-[14px] font-bold">{t('leaveThisFamily')}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {copied ? (
        <View
          style={{ position: 'absolute', bottom: tabBarHeight + 16, alignSelf: 'center' }}
          className="bg-on-background px-6 py-3 rounded-full shadow-lg"
        >
          <Text className="text-background text-[14px] font-bold">{t('codeCopied')}</Text>
        </View>
      ) : null}

      {current ? (
        <FamilyDeleteModal
          visible={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          members={(members ?? [])
            .filter((m) => m.user_id !== session?.user.id)
            .map((m) => ({ user_id: m.user_id, full_name: m.full_name, avatar_url: m.avatar_url }))}
          onPromoteAndLeave={(userId) => {
            promoteMember.mutate(
              { familyId: current.familyId, newAdminId: userId },
              { onSuccess: () => leaveFamily.mutate(current.familyId) },
            );
          }}
          onDeleteEntirely={() => deleteFamily.mutate(current.familyId)}
          labels={{
            title: t('deleteFamilyModalTitle'),
            promoteAndLeave: t('promoteAndLeave'),
            deleteEntirely: t('deleteFamilyEntirely'),
            choosePersonTitle: t('choosePersonTitle'),
            noMembersToPromote: t('noMembersToPromote'),
            confirmPromoteTitle: t('confirmPromoteTitle'),
            confirmPromoteBody: (name) => t('confirmPromoteBody', { name }),
            confirmDeleteTitle: t('confirmDeleteTitle'),
            confirmDeleteBody: t('confirmDeleteBody'),
            confirm: t('confirmAction'),
            cancel: t('cancel'),
            memberRole: t('memberRole'),
          }}
        />
      ) : null}
    </View>
  );
}
