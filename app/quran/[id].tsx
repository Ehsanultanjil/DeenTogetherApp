import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { useColors } from '../../constants/theme';
import { useT } from '../../lib/hooks/useT';
import { getSurahById } from '../../lib/quranChapters';
import {
  fetchSurahVerses,
  getQuranBookmarks,
  toggleQuranBookmark,
  setLastReadPosition,
  type QuranVerse,
} from '../../lib/quranApi';

export default function SurahDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { t, n } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();

  const surahId = parseInt(id || '1', 10);
  const surah = getSurahById(surahId);

  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reader Settings
  const [showWbw, setShowWbw] = useState(true);
  const [arabicFontSize, setArabicFontSize] = useState(26);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<number>>(new Set());
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Load verses
    fetchSurahVerses(surahId)
      .then((data) => {
        if (!isMounted) return;
        setVerses(data);
        setLoading(false);
        // Record last read
        if (surah) {
          setLastReadPosition({
            surah_id: surahId,
            verse_number: 1,
            surah_name_bn: surah.name_bn,
            surah_name_ar: surah.name_arabic,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load surah');
        setLoading(false);
      });

    // Load bookmarks
    getQuranBookmarks().then((bookmarks) => {
      if (!isMounted) return;
      const set = new Set<number>();
      bookmarks.forEach((b) => {
        if (b.surah_id === surahId) set.add(b.verse_number);
      });
      setBookmarkedVerses(set);
    });

    return () => {
      isMounted = false;
    };
  }, [surahId]);

  const handleToggleBookmark = async (verseNumber: number) => {
    if (!surah) return;
    const added = await toggleQuranBookmark({
      surah_id: surahId,
      verse_number: verseNumber,
      surah_name_bn: surah.name_bn,
      surah_name_ar: surah.name_arabic,
    });

    setBookmarkedVerses((prev) => {
      const next = new Set(prev);
      if (added) next.add(verseNumber);
      else next.delete(verseNumber);
      return next;
    });

    showToast(added ? 'আয়াত বুকমার্ক করা হয়েছে' : 'বুকমার্ক সরানো হয়েছে');
  };

  const handleCopyAyah = async (verse: QuranVerse) => {
    const arabicText = verse.words
      .filter((w) => w.char_type === 'word')
      .map((w) => w.text)
      .join(' ');
    const fullContent = `${arabicText} (${n(verse.verse_number)})\n${verse.translation}\n[সূরা ${surah?.name_bn || ''}: ${n(verse.verse_number)}]`;

    await Clipboard.setStringAsync(fullContent);
    showToast('আয়াত কপি করা হয়েছে');
  };

  const renderSurahHeader = () => {
    if (!surah) return null;
    const showBismillah = surah.id !== 9 && surah.id !== 1;

    return (
      <View className="mb-4">
        {/* Main Surah Information Card */}
        <View
          className="rounded-3xl p-5 mb-3 border border-outline-variant shadow-sm relative overflow-hidden"
          style={{ backgroundColor: Colors.surfaceContainerLowest }}
        >
          <View className="flex-row items-center justify-between">
            {/* Mosque / Kaaba Emblem */}
            <View className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center">
              <Icon name="mosque" size={32} color={Colors.primary} />
            </View>

            {/* Title & Classification */}
            <View className="items-end flex-1 ml-4">
              <Text className="text-[26px] font-bold text-on-surface font-mono" style={{ writingDirection: 'rtl' }}>
                {surah.name_arabic}
              </Text>
              <Text className="text-[17px] font-bold text-primary mt-0.5">
                সূরা {surah.name_bn}
              </Text>
              <Text className="text-[13px] text-on-surface-variant mt-0.5">
                {surah.meaning_bn}
              </Text>

              <View className="flex-row items-center gap-2 mt-2">
                <View className="px-2.5 py-0.5 rounded-full bg-primary/10">
                  <Text className="text-[11px] font-bold text-primary">
                    {surah.revelation_place === 'makkah' ? 'মাক্কী' : 'মাদানী'} • {n(surah.verses_count)} আয়াত
                  </Text>
                </View>

                <Pressable
                  onPress={() => setInfoModalVisible(true)}
                  className="px-2.5 py-0.5 rounded-full bg-surface-container-high flex-row items-center gap-1 active:opacity-70"
                  hitSlop={8}
                >
                  <Icon name="info" size={12} color={Colors.onSurfaceVariant} />
                  <Text className="text-[11px] font-semibold text-on-surface-variant">তথ্য</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Bismillah Calligraphy Banner */}
        {showBismillah ? (
          <View className="items-center justify-center py-4 mb-2">
            <Text
              className="text-[26px] font-bold text-primary text-center leading-loose"
              style={{ writingDirection: 'rtl' }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderVerseItem = ({ item: verse }: { item: QuranVerse }) => {
    const isBookmarked = bookmarkedVerses.has(verse.verse_number);

    return (
      <View
        className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant mb-3.5 shadow-sm"
      >
        {/* Word-by-Word Arabic Flow Container */}
        <View
          className="flex-row-reverse flex-wrap items-start justify-start gap-x-3.5 gap-y-3 mb-4"
        >
          {verse.words.map((w, idx) => {
            if (w.char_type === 'end') {
              return (
                <View key={w.id || idx} className="items-center justify-center self-center px-1">
                  <View className="w-8 h-8 rounded-full border-2 border-primary/40 items-center justify-center bg-primary/5">
                    <Text className="text-[11px] font-bold text-primary">
                      {n(verse.verse_number)}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View key={w.id || idx} className="items-center min-w-[32px] px-1 py-0.5">
                {/* Arabic Word */}
                <Text
                  className="text-on-surface font-bold text-center leading-relaxed"
                  style={{ fontSize: arabicFontSize, writingDirection: 'rtl' }}
                >
                  {w.text}
                </Text>

                {/* Word-by-Word Bangla Translation */}
                {showWbw && w.translation ? (
                  <Text className="text-[11px] text-on-surface-variant text-center mt-1 leading-tight">
                    {w.translation}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {/* Full Ayah Bengali Translation */}
        <View className="pt-2 border-t border-surface-variant/40 mb-3">
          <Text className="text-[14px] text-on-surface leading-6 font-normal">
            {verse.translation}
          </Text>
        </View>

        {/* Card Footer / Action Bar */}
        <View className="flex-row items-center justify-between pt-1">
          {/* Ayah Indicator */}
          <Text className="text-[12px] font-bold text-primary">
            আয়াত: {n(verse.verse_number)}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-2">
            {/* Audio Recitation button */}
            <Pressable
              onPress={() => showToast('শীঘ্রই অডিও তেলাওয়াত প্লে হবে')}
              className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center active:opacity-60"
              hitSlop={8}
            >
              <Icon name="play_arrow" size={18} color={Colors.onSurfaceVariant} />
            </Pressable>

            {/* Copy button */}
            <Pressable
              onPress={() => handleCopyAyah(verse)}
              className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center active:opacity-60"
              hitSlop={8}
            >
              <Icon name="content_copy" size={16} color={Colors.onSurfaceVariant} />
            </Pressable>

            {/* Bookmark button */}
            <Pressable
              onPress={() => handleToggleBookmark(verse.verse_number)}
              className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center active:opacity-60"
              hitSlop={8}
            >
              <Icon
                name={isBookmarked ? 'bookmark' : 'bookmark_border'}
                size={18}
                color={isBookmarked ? Colors.primary : Colors.onSurfaceVariant}
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Top Header Bar */}
      <View
        className="w-full flex-row items-center justify-between px-gutter bg-surface border-b border-surface-variant/30"
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/quran'))}
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
          hitSlop={12}
        >
          <Icon name="arrow_back" size={22} color={Colors.onSurface} />
        </Pressable>

        <View className="items-center flex-1 mx-2">
          <Text className="text-[17px] font-bold text-on-surface" numberOfLines={1}>
            সূরা {surah?.name_bn || 'আল-কুরআন'}
          </Text>
          <Text className="text-[11px] text-on-surface-variant">
            {surah?.name_simple} • {n(surah?.verses_count || 0)} আয়াত
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          {/* Quick Word-by-Word Toggle button */}
          <Pressable
            onPress={() => {
              setShowWbw(!showWbw);
              showToast(!showWbw ? 'শব্দে শব্দে অর্থ চালু' : 'শব্দে শব্দে অর্থ বন্ধ');
            }}
            className={`w-9 h-9 rounded-full items-center justify-center active:opacity-60 ${
              showWbw ? 'bg-primary/10' : 'bg-surface-container-high'
            }`}
            hitSlop={8}
          >
            <Icon
              name="format_size"
              size={18}
              color={showWbw ? Colors.primary : Colors.onSurfaceVariant}
            />
          </Pressable>

          {/* Reader Settings Modal button */}
          <Pressable
            onPress={() => setSettingsModalVisible(true)}
            className="w-9 h-9 rounded-full items-center justify-center bg-surface-container-high active:opacity-60"
            hitSlop={8}
          >
            <Icon name="tune" size={18} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      {/* Verses List / Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-[13px] text-on-surface-variant">কুরআনের আয়াত লোড হচ্ছে…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text className="text-[14px] text-error text-center">{error}</Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              fetchSurahVerses(surahId)
                .then((d) => {
                  setVerses(d);
                  setLoading(false);
                })
                .catch((e) => {
                  setError(e.message);
                  setLoading(false);
                });
            }}
            className="px-4 py-2 bg-primary rounded-full active:opacity-80"
          >
            <Text className="text-on-primary font-bold text-[13px]">আবার চেষ্টা করুন</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(item) => item.verse_key}
          renderItem={renderVerseItem}
          ListHeaderComponent={renderSurahHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={15}
          windowSize={10}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage ? (
        <View
          className="absolute self-center px-4 py-2 rounded-full bg-on-surface/90 shadow-md pointer-events-none"
          style={{ bottom: insets.bottom + 30 }}
        >
          <Text className="text-[12px] font-bold text-surface text-center">
            {toastMessage}
          </Text>
        </View>
      ) : null}

      {/* Surah Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <Pressable
          onPress={() => setInfoModalVisible(false)}
          className="flex-1 bg-black/60 items-center justify-center p-5"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface rounded-3xl p-5 border border-outline-variant shadow-xl"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[17px] font-bold text-on-surface">সূরা পরিচিতি</Text>
              <Pressable
                onPress={() => setInfoModalVisible(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center"
              >
                <Icon name="close" size={18} color={Colors.onSurface} />
              </Pressable>
            </View>

            <View className="gap-2.5">
              <View className="flex-row justify-between py-1.5 border-b border-surface-variant/40">
                <Text className="text-[13px] text-on-surface-variant">সূরার নাম</Text>
                <Text className="text-[13px] font-bold text-on-surface">
                  {surah?.name_bn} ({surah?.name_simple})
                </Text>
              </View>

              <View className="flex-row justify-between py-1.5 border-b border-surface-variant/40">
                <Text className="text-[13px] text-on-surface-variant">আরবি নাম</Text>
                <Text className="text-[15px] font-bold text-primary font-mono">
                  {surah?.name_arabic}
                </Text>
              </View>

              <View className="flex-row justify-between py-1.5 border-b border-surface-variant/40">
                <Text className="text-[13px] text-on-surface-variant">বাংলা অর্থ</Text>
                <Text className="text-[13px] font-bold text-on-surface">{surah?.meaning_bn}</Text>
              </View>

              <View className="flex-row justify-between py-1.5 border-b border-surface-variant/40">
                <Text className="text-[13px] text-on-surface-variant">অবতীর্ণের স্থান</Text>
                <Text className="text-[13px] font-bold text-on-surface">
                  {surah?.revelation_place === 'makkah' ? 'মাক্কাহ আল-মুকাররামা' : 'মাদীনাহ আল-মুনাওয়ারা'}
                </Text>
              </View>

              <View className="flex-row justify-between py-1.5">
                <Text className="text-[13px] text-on-surface-variant">মোট আয়াত সংখ্যা</Text>
                <Text className="text-[13px] font-bold text-primary">
                  {n(surah?.verses_count || 0)} টি আয়াত
                </Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Reader Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <Pressable
          onPress={() => setSettingsModalVisible(false)}
          className="flex-1 bg-black/60 items-center justify-center p-5"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface rounded-3xl p-5 border border-outline-variant shadow-xl"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[17px] font-bold text-on-surface">পঠন সেটিংস</Text>
              <Pressable
                onPress={() => setSettingsModalVisible(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high items-center justify-center"
              >
                <Icon name="close" size={18} color={Colors.onSurface} />
              </Pressable>
            </View>

            {/* Word-by-Word Toggle */}
            <View className="flex-row items-center justify-between py-3 border-b border-surface-variant/40">
              <View>
                <Text className="text-[14px] font-bold text-on-surface">শব্দে শব্দে অর্থ</Text>
                <Text className="text-[11px] text-on-surface-variant">
                  প্রতিটি আরবি শব্দের নিচে বাংলা অর্থ প্রদর্শন
                </Text>
              </View>

              <Pressable
                onPress={() => setShowWbw(!showWbw)}
                className={`w-12 h-6 rounded-full px-1 justify-center ${
                  showWbw ? 'bg-primary items-end' : 'bg-surface-container-high items-start'
                }`}
              >
                <View className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </Pressable>
            </View>

            {/* Font Size Adjuster */}
            <View className="py-3">
              <Text className="text-[14px] font-bold text-on-surface mb-2">হরফের আকার (Font Size)</Text>
              <View className="flex-row items-center gap-2">
                {[22, 26, 30, 34].map((size) => (
                  <Pressable
                    key={size}
                    onPress={() => setArabicFontSize(size)}
                    className={`flex-1 py-2 rounded-xl items-center border ${
                      arabicFontSize === size
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-container-high border-transparent'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-bold ${
                        arabicFontSize === size ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {size === 22 ? 'ছোট' : size === 26 ? 'মাঝারি' : size === 30 ? 'বড়' : 'অতি বড়'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
