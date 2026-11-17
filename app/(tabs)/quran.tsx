import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { TopAppBar } from '../../components/TopAppBar';
import { useColors } from '../../constants/theme';
import { useT } from '../../lib/hooks/useT';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { SURAHS, type Surah } from '../../lib/quranChapters';
import { DUAS } from '../../lib/duas';
import {
  getLastReadPosition,
  getQuranBookmarks,
  type LastReadPosition,
  type QuranBookmark,
} from '../../lib/quranApi';

type FilterTab = 'all' | 'makkah' | 'madinah' | 'bookmarks' | 'duas';

export default function QuranScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const Colors = useColors();
  const { t, n, locale } = useT();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);

  useEffect(() => {
    getLastReadPosition().then(setLastRead);
    getQuranBookmarks().then(setBookmarks);
  }, []);

  const filteredSurahs = useMemo(() => {
    return SURAHS.filter((surah) => {
      // Tab filter
      if (activeTab === 'makkah' && surah.revelation_place !== 'makkah') return false;
      if (activeTab === 'madinah' && surah.revelation_place !== 'madinah') return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        surah.name_bn.toLowerCase().includes(q) ||
        surah.name_simple.toLowerCase().includes(q) ||
        surah.meaning_bn.toLowerCase().includes(q) ||
        surah.id.toString() === q ||
        n(surah.id).includes(q)
      );
    });
  }, [activeTab, searchQuery, n]);

  const renderSurahCard = ({ item: surah }: { item: Surah }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/quran/[id]', params: { id: surah.id } })}
      className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant mb-2.5 flex-row items-center justify-between active:opacity-70 shadow-sm"
    >
      <View className="flex-row items-center flex-1 mr-3">
        {/* Surah Number Badge */}
        <View className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center mr-3.5">
          <Text className="text-[13px] font-bold text-primary">{n(surah.id)}</Text>
        </View>

        {/* Surah Name & Meaning */}
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-on-surface">
            সূরা {surah.name_bn}
          </Text>
          <Text className="text-[12px] text-on-surface-variant mt-0.5" numberOfLines={1}>
            {surah.meaning_bn} • {surah.name_simple}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Text className="text-[11px] font-semibold text-primary">
              {surah.revelation_place === 'makkah' ? 'মাক্কী' : 'মাদানী'}
            </Text>
            <Text className="text-[11px] text-on-surface-variant">•</Text>
            <Text className="text-[11px] text-on-surface-variant">
              {n(surah.verses_count)} আয়াত
            </Text>
          </View>
        </View>
      </View>

      {/* Arabic Calligraphy Title */}
      <View className="items-end">
        <Text className="text-[20px] font-bold text-primary font-mono" style={{ writingDirection: 'rtl' }}>
          {surah.name_arabic}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('tabQuran')} />

      <View className="px-gutter pt-2 pb-3">
        {/* Search Bar */}
        <View className="w-full flex-row items-center bg-surface-container-lowest rounded-2xl border border-outline-variant px-3 py-2 shadow-sm mb-3">
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

        {/* Filter Chips Horizontal Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          <Pressable
            onPress={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full border mr-2 ${
              activeTab === 'all'
                ? 'bg-primary border-primary'
                : 'bg-surface-container-lowest border-surface-variant'
            }`}
          >
            <Text
              className={`text-[12px] font-bold ${
                activeTab === 'all' ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              সব সূরা ({n(114)})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('makkah')}
            className={`px-3.5 py-1.5 rounded-full border mr-2 ${
              activeTab === 'makkah'
                ? 'bg-primary border-primary'
                : 'bg-surface-container-lowest border-surface-variant'
            }`}
          >
            <Text
              className={`text-[12px] font-bold ${
                activeTab === 'makkah' ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              মাক্কী ({n(86)})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('madinah')}
            className={`px-3.5 py-1.5 rounded-full border mr-2 ${
              activeTab === 'madinah'
                ? 'bg-primary border-primary'
                : 'bg-surface-container-lowest border-surface-variant'
            }`}
          >
            <Text
              className={`text-[12px] font-bold ${
                activeTab === 'madinah' ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              মাদানী ({n(28)})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('bookmarks')}
            className={`px-3.5 py-1.5 rounded-full border mr-2 flex-row items-center gap-1 ${
              activeTab === 'bookmarks'
                ? 'bg-primary border-primary'
                : 'bg-surface-container-lowest border-surface-variant'
            }`}
          >
            <Icon
              name="bookmark"
              size={14}
              color={activeTab === 'bookmarks' ? '#ffffff' : Colors.onSurfaceVariant}
            />
            <Text
              className={`text-[12px] font-bold ${
                activeTab === 'bookmarks' ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              বুকমার্ক ({n(bookmarks.length)})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('duas')}
            className={`px-3.5 py-1.5 rounded-full border mr-2 flex-row items-center gap-1 ${
              activeTab === 'duas'
                ? 'bg-primary border-primary'
                : 'bg-surface-container-lowest border-surface-variant'
            }`}
          >
            <Icon
              name="volunteer_activism"
              size={14}
              color={activeTab === 'duas' ? '#ffffff' : Colors.onSurfaceVariant}
            />
            <Text
              className={`text-[12px] font-bold ${
                activeTab === 'duas' ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              দৈনিক দোয়া
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Main List Area */}
      {activeTab === 'duas' ? (
        // Duas View
        <ScrollView
          className="flex-1 px-gutter"
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20, paddingTop: 6 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3.5">
            {DUAS.map((dua) => (
              <View
                key={dua.id}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-variant"
              >
                <Text className="text-[15px] font-bold text-on-surface mb-2">
                  {locale === 'bn' ? dua.title.bn : dua.title.en}
                </Text>
                <Text
                  className="text-[20px] text-primary text-right leading-loose mb-2.5 font-bold"
                  style={{ writingDirection: 'rtl' }}
                >
                  {dua.arabic}
                </Text>
                <Text className="text-[12px] italic text-on-surface-variant mb-2 leading-4">
                  {locale === 'bn' ? dua.transliteration.bn : dua.transliteration.en}
                </Text>
                <Text className="text-[13px] text-on-surface leading-5">
                  {locale === 'bn' ? dua.meaning.bn : dua.meaning.en}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : activeTab === 'bookmarks' ? (
        // Bookmarks View
        <ScrollView
          className="flex-1 px-gutter"
          contentContainerStyle={{ paddingBottom: tabBarHeight + 20, paddingTop: 6 }}
        >
          {bookmarks.length === 0 ? (
            <View className="items-center justify-center py-16 gap-2">
              <Icon name="bookmark_border" size={40} color={Colors.onSurfaceVariant} />
              <Text className="text-[15px] font-bold text-on-surface">কোনো বুকমার্ক সংরক্ষিত নেই</Text>
              <Text className="text-[12px] text-on-surface-variant text-center px-8">
                যেকোনো সূরার আয়াতে বুকমার্ক আইকনে চাপ দিয়ে প্রিয় বা প্রয়োজনীয় আয়াত সংরক্ষণ করুন।
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {bookmarks.map((bm, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.push({ pathname: '/quran/[id]', params: { id: bm.surah_id } })}
                  className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant flex-row items-center justify-between active:opacity-70 shadow-sm"
                >
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-on-surface">
                      সূরা {bm.surah_name_bn}
                    </Text>
                    <Text className="text-[12px] text-primary font-bold mt-0.5">
                      আয়াত: {n(bm.verse_number)}
                    </Text>
                  </View>
                  <Icon name="chevron_right" size={20} color={Colors.onSurfaceVariant} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        // Surahs List View
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSurahCard}
          ListHeaderComponent={
            lastRead && !searchQuery ? (
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/quran/[id]', params: { id: lastRead.surah_id } })
                }
                className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-3.5 flex-row items-center justify-between active:opacity-80"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center mr-3">
                    <Icon name="menu_book" size={20} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold text-primary">সর্বশেষ পঠিত</Text>
                    <Text className="text-[14px] font-bold text-on-surface">
                      সূরা {lastRead.surah_name_bn}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-[12px] font-bold text-primary">পড়ুন</Text>
                  <Icon name="chevron_right" size={16} color={Colors.primary} />
                </View>
              </Pressable>
            ) : null
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: tabBarHeight + 20,
            paddingTop: 4,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={10}
        />
      )}
    </View>
  );
}
