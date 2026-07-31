import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { FamilyMemberRow } from './FamilyMemberRow';
import { useColors } from '../constants/theme';
import { confirmDestructive } from '../lib/confirmDestructive';
import { BottomSheetModal } from './BottomSheetModal';

export type PromotableMember = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  members: PromotableMember[]; // excluding self
  onPromoteAndLeave: (userId: string) => void;
  onDeleteEntirely: () => void;
  labels: {
    title: string;
    promoteAndLeave: string;
    deleteEntirely: string;
    choosePersonTitle: string;
    noMembersToPromote: string;
    confirmPromoteTitle: string;
    confirmPromoteBody: (name: string) => string;
    confirmDeleteTitle: string;
    confirmDeleteBody: string;
    confirm: string;
    cancel: string;
    memberRole: string;
  };
};

export function FamilyDeleteModal({ visible, onClose, members, onPromoteAndLeave, onDeleteEntirely, labels }: Props) {
  const Colors = useColors();
  const [step, setStep] = useState<'choice' | 'pick'>('choice');

  const close = () => {
    setStep('choice');
    onClose();
  };

  const confirmPromote = (member: PromotableMember) => {
    confirmDestructive(
      labels.confirmPromoteTitle,
      labels.confirmPromoteBody(member.full_name ?? labels.memberRole),
      labels.confirm,
      labels.cancel,
      () => {
        onPromoteAndLeave(member.user_id);
        close();
      },
    );
  };

  const confirmDelete = () => {
    confirmDestructive(labels.confirmDeleteTitle, labels.confirmDeleteBody, labels.confirm, labels.cancel, () => {
      onDeleteEntirely();
      close();
    });
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={close}
      title={step === 'pick' ? labels.choosePersonTitle : labels.title}
      sheetStyle={{ maxHeight: '70%' }}
    >
      {step === 'choice' ? (
        <View className="p-4 gap-2">
          <Pressable
            onPress={() => setStep('pick')}
            className="flex-row items-center gap-3 px-4 py-4 rounded-xl active:opacity-70"
          >
            <Icon name="groups" color={Colors.primary} />
            <Text className="text-on-surface text-[15px] flex-1">{labels.promoteAndLeave}</Text>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>
          <Pressable onPress={confirmDelete} className="flex-row items-center gap-3 px-4 py-4 rounded-xl active:opacity-70">
            <Icon name="info" color={Colors.error} />
            <Text className="text-error text-[15px] font-semibold flex-1">{labels.deleteEntirely}</Text>
          </Pressable>
        </View>
      ) : members.length === 0 ? (
        <Text className="text-on-surface-variant text-[14px] p-6 text-center">{labels.noMembersToPromote}</Text>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => m.user_id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => confirmPromote(item)} className="active:opacity-70">
              <FamilyMemberRow
                name={item.full_name ?? labels.memberRole}
                avatarUri={item.avatar_url ?? undefined}
                progressLabel=""
                dotsCompleted={0}
                hideStats
              />
            </Pressable>
          )}
        />
      )}
    </BottomSheetModal>
  );
}
