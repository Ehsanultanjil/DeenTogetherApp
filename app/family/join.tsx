import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { TextInput } from '../../components/TextInput';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../../components/TopAppBar';
import { useJoinFamily } from '../../lib/hooks/useFamily';
import { useT } from '../../lib/hooks/useT';

export default function JoinFamily() {
  const router = useRouter();
  const { t } = useT();
  const [code, setCode] = useState('');
  const joinFamily = useJoinFamily();

  const onJoin = () => {
    joinFamily.mutate(code.trim().toUpperCase(), {
      onSuccess: () => router.back(),
    });
  };

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('joinFamilyTitle')} showBack />
      <View className="flex-1 px-gutter pt-8">
        <Text className="text-[16px] text-on-surface-variant mb-4">{t('enterCodeSubtitle')}</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="FAM-XXXX"
          autoCapitalize="characters"
          className="h-14 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-center text-[18px] tracking-widest font-bold mb-4"
        />
        {joinFamily.isError ? (
          <Text className="text-error text-[13px] mb-4 text-center">{(joinFamily.error as Error).message}</Text>
        ) : null}
        <Pressable
          disabled={!code.trim() || joinFamily.isPending}
          onPress={onJoin}
          className="w-full h-14 bg-primary rounded-full items-center justify-center active:opacity-90"
        >
          <Text className="text-on-primary font-bold text-[16px]">
            {joinFamily.isPending ? t('joiningFamily') : t('joinFamilyButton')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
