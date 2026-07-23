import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { FamilyMemberRow } from './FamilyMemberRow';
import { useColors } from '../constants/theme';

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
    Alert.alert(labels.confirmPromoteTitle, labels.confirmPromoteBody(member.full_name ?? labels.memberRole), [
      { text: labels.cancel, style: 'cancel' },
      {
        text: labels.confirm,
        onPress: () => {
          onPromoteAndLeave(member.user_id);
          close();
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(labels.confirmDeleteTitle, labels.confirmDeleteBody, [
      { text: labels.cancel, style: 'cancel' },
      { text: labels.confirm, style: 'destructive', onPress: () => { onDeleteEntirely(); close(); } },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable className="flex-1 bg-black/30" onPress={close}>
        <Pressable className="mt-auto bg-surface-container-lowest rounded-t-2xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
          <View className="p-4 border-b border-surface-container-low">
            <Text className="text-[16px] font-bold text-on-surface text-center">
              {step === 'pick' ? labels.choosePersonTitle : labels.title}
            </Text>
          </View>

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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
