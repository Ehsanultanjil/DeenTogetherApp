import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { TopAppBar } from '../../components/TopAppBar';
import { useColors } from '../../constants/theme';
import { useT } from '../../lib/hooks/useT';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { SURAHS, type Surah } from '../../lib/quranChapters';
import {
  getLastReadPosition,
  type LastReadPosition,
} from '../../lib/quranApi';
import type { MaterialSymbolName } from '../../constants/materialSymbols';

type QuickAction = {
  id: 'dua' | 'tafsir' | 'hadith' | 'tilawat';
  titleKey: 'quickDua' | 'quickTafsir' | 'quickHadith' | 'quickTilawat';
  icon: MaterialSymbolName;
  disabled?: boolean;
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'dua', titleKey: 'quickDua', icon: 'volunteer_activism' },
  { id: 'tafsir', titleKey: 'quickTafsir', icon: 'menu_book', disabled: true },
  { id: 'hadith', titleKey: 'quickHadith', icon: 'library_books' },
  { id: 'tilawat', titleKey: 'quickTilawat', icon: 'headphones', disabled: true },
];

export default function QuranScreen() {
  const router = useRouter();
  const tabBarHeight = useTabBarHeight();
  const Colors = useColors();
  const { t, n, locale } = useT();
  const isBn = locale === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);

  useEffect(() => {
    getLastReadPosition().then(setLastRead);
  }, []);

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAHS;
    const q = searchQuery.toLowerCase().trim();
    return SURAHS.filter((surah) => {
      return (
        surah.name_bn.toLowerCase().includes(q) ||
        surah.name_simple.toLowerCase().includes(q) ||
        surah.meaning_bn.toLowerCase().includes(q) ||
        surah.id.toString() === q ||
        n(surah.id).includes(q)
      );
    });
  }, [searchQuery, n]);

  const renderSurahCard = ({ item: surah }: { item: Surah }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/quran/[id]', params: { id: surah.id } })}
      className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant flex-row items-center justify-between active:opacity-70 shadow-sm"
      style={{ marginBottom: 10 }}
    >
      <View className="flex-row items-center flex-1 mr-3">
        {/* Circular Number Badge */}
        <View
          style={{
            width: 42,
            height: 42,
            minWidth: 42,
            maxWidth: 42,
            minHeight: 42,
            maxHeight: 42,
            borderRadius: 21,
            borderWidth: 1.5,
            borderColor: Colors.primary + '60',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            flexShrink: 0,
            alignSelf: 'center',
            backgroundColor: Colors.primary + '0d',
          }}
        >
          <Text
            style={{
              fontSize: surah.id >= 100 ? 12 : 13.5,
              fontWeight: 'bold',
              color: Colors.primary,
              textAlign: 'center',
            }}
          >
            {n(surah.id)}
          </Text>
        </View>

        {/* Surah Bengali Name & Info */}
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-on-surface leading-tight">
            সূরা {surah.name_bn}
          </Text>
          <Text className="text-[12.5px] text-on-surface-variant mt-1" numberOfLines={1}>
            {surah.meaning_bn} • {surah.revelation_place === 'makkah' ? 'মাক্কী' : 'মাদানী'} • {n(surah.verses_count)} আয়াত
          </Text>
        </View>
      </View>

      {/* Calligraphic Arabic Surah Name in signature green */}
      <View className="items-end pl-2">
        <Text
          className="text-[22px] font-bold text-primary font-mono"
          style={{ writingDirection: 'rtl' }}
        >
          {surah.name_arabic}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('tabQuran')} />

      {/* Top Quick Action Buttons: Dua, Tafsir (Coming Soon), Hadith, Tilawat */}
      <View className="px-gutter pt-1 pb-4">
        <View style={{ width: '100%', maxWidth: 460, alignSelf: 'center' }}>
          <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
            {QUICK_ACTIONS.map((action) => {
              const isDisabled = Boolean(action.disabled);
              return (
                <Pressable
                  key={action.id}
                  onPress={() => {
                    if (!isDisabled) {
                      if (action.id === 'dua') {
                        router.push('/dua');
                      } else if (action.id === 'hadith') {
                        router.push('/hadith');
                      }
                    }
                  }}
                  disabled={isDisabled}
                  className={`flex-1 aspect-square bg-surface-container-lowest rounded-2xl border border-surface-variant items-center justify-center p-1.5 shadow-sm ${
                    isDisabled ? 'opacity-85' : 'active:opacity-75'
                  }`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 2,
                    elevation: 1,
                    position: 'relative',
                  }}
                >
                  {/* Coming Soon Badge for Tafsir */}
                  {isDisabled && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -7,
                        alignSelf: 'center',
                        backgroundColor: Colors.primary,
                        borderRadius: 10,
                        paddingHorizontal: 6,
                        paddingVertical: 1.5,
                        zIndex: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.15,
                        shadowRadius: 1,
                        elevation: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8.5,
                          fontWeight: 'bold',
                          color: '#ffffff',
                          lineHeight: 11,
                        }}
                      >
                        {isBn ? 'শীঘ্রই আসছে' : 'Coming Soon'}
                      </Text>
                    </View>
                  )}

                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mb-1.5"
                    style={{
                      backgroundColor: isDisabled
                        ? Colors.surfaceVariant + '35'
                        : Colors.primary + '14',
                    }}
                  >
                    <Icon
                      name={action.icon}
                      size={20}
                      color={isDisabled ? Colors.onSurfaceVariant : Colors.primary}
                    />
                  </View>
                  <Text
                    className={`text-[12px] font-semibold text-center ${
                      isDisabled ? 'text-on-surface-variant' : 'text-on-surface'
                    }`}
                    numberOfLines={1}
                  >
                    {t(action.titleKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-gutter pb-3">
        <View className="w-full flex-row items-center bg-surface-container-lowest rounded-2xl border border-outline-variant px-3.5 py-2 shadow-sm">
          <Icon name="search" size={20} color={Colors.onSurfaceVariant} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="সূরা খুঁজুন (যেমন: ফাতিহা, ১, ইয়াসিন)..."
            placeholderTextColor={Colors.onSurfaceVariant}
            className="flex-1 ml-2 text-[14px] text-on-surface p-0"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Icon name="close" size={18} color={Colors.onSurfaceVariant} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Surahs List View in Card Style */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSurahCard}
        ListHeaderComponent={
          lastRead && !searchQuery ? (
            <View style={{ marginBottom: 10 }}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/quran/[id]', params: { id: lastRead.surah_id } })
                }
                className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 flex-row items-center justify-between active:opacity-80 shadow-sm"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-[11px] font-semibold text-primary">সর্বশেষ পঠিত</Text>
                  <Text className="text-[14px] font-bold text-on-surface mt-0.5">
                    সূরা {lastRead.surah_name_bn}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-[12px] font-bold text-primary">পড়া শুরু করুন</Text>
                  <Icon name="chevron_right" size={16} color={Colors.primary} />
                </View>
              </Pressable>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: tabBarHeight + 24,
          paddingTop: 2,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
    </View>
  );
}
