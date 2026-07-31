import { ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { useT } from '../../lib/hooks/useT';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { DUAS } from '../../lib/duas';

export default function DuaScreen() {
  const { t, locale } = useT();
  const tabBarHeight = useTabBarHeight();

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('duaTitle')} />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: tabBarHeight + 16, paddingTop: 16 }}>
        <View className="gap-4">
          {DUAS.map((dua) => (
            <View
              key={dua.id}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container-low"
            >
              <Text className="text-[16px] font-bold text-on-surface mb-3">
                {locale === 'bn' ? dua.title.bn : dua.title.en}
              </Text>
              <Text
                className="text-[22px] text-primary text-right leading-loose mb-3"
                style={{ writingDirection: 'rtl' }}
              >
                {dua.arabic}
              </Text>
              <Text className="text-[13px] italic text-on-surface-variant mb-3">
                {locale === 'bn' ? dua.transliteration.bn : dua.transliteration.en}
              </Text>
              <Text className="text-[12px] font-bold text-on-surface-variant mb-1">{t('meaning')}</Text>
              <Text className="text-[14px] text-on-surface">
                {locale === 'bn' ? dua.meaning.bn : dua.meaning.en}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
