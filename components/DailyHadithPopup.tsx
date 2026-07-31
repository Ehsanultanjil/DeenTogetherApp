import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { BottomSheetModal } from './BottomSheetModal';
import { useT } from '../lib/hooks/useT';
import type { Hadith } from '../lib/hadiths';

type Props = {
  visible: boolean;
  hadith: Hadith;
  onDismiss: () => void;
};

export function DailyHadithPopup({ visible, hadith, onDismiss }: Props) {
  const { t, locale } = useT();

  return (
    <BottomSheetModal visible={visible} onClose={onDismiss} title={t('dailyHadithTitle')}>
      <View className="p-6">
        <Text className="text-[15px] text-on-surface text-center leading-6 mb-3">
          "{locale === 'bn' ? hadith.quote.bn : hadith.quote.en}"
        </Text>
        <Text className="text-[12px] text-on-surface-variant text-center mb-6">
          {locale === 'bn' ? hadith.reference.bn : hadith.reference.en}
        </Text>
        <Pressable
          onPress={onDismiss}
          className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-md active:opacity-90 mb-3"
        >
          <Text className="text-on-primary text-[16px] font-bold">{t('hadithReadButton')}</Text>
        </Pressable>
        <Pressable onPress={onDismiss} className="items-center py-2 active:opacity-70">
          <Text className="text-on-surface-variant text-[13px] font-semibold">{t('skipButton')}</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}
