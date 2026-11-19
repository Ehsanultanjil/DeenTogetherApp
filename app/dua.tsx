import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';
import { TopAppBar } from '../components/TopAppBar';
import { useColors } from '../constants/theme';
import { useT } from '../lib/hooks/useT';
import { DUAS, DUA_CATEGORIES, type Dua } from '../lib/duas';

export default function DuaPage() {
  const router = useRouter();
  const Colors = useColors();
  const { locale } = useT();
  const isBn = locale === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCopyDua = async (dua: Dua) => {
    try {
      const title = isBn ? dua.title.bn : dua.title.en;
      const trans = isBn ? dua.transliteration.bn : dua.transliteration.en;
      const meaning = isBn ? dua.meaning.bn : dua.meaning.en;
      const ref = dua.reference ? `\n[${isBn ? dua.reference.bn : dua.reference.en}]` : '';

      const textToCopy = `${title}\n\n${dua.arabic}\n\n${trans}\n\n${isBn ? 'অর্থ: ' + meaning : 'Meaning: ' + meaning}${ref}`;
      await Clipboard.setStringAsync(textToCopy);
      setCopiedId(dua.id);
      showToast(isBn ? 'দোয়া কপি করা হয়েছে' : 'Dua copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast(isBn ? 'কপি করতে সমস্যা হয়েছে' : 'Failed to copy');
    }
  };

  const filteredDuas = useMemo(() => {
    let list = DUAS;

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter((d) => d.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.title.bn.toLowerCase().includes(q) ||
          d.title.en.toLowerCase().includes(q) ||
          d.meaning.bn.toLowerCase().includes(q) ||
          d.transliteration.bn.toLowerCase().includes(q) ||
          d.transliteration.en.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  const renderDuaCard = ({ item: dua }: { item: Dua }) => {
    const isCopied = copiedId === dua.id;
    const catObj = DUA_CATEGORIES.find((c) => c.id === dua.category);
    const catLabel = catObj ? (isBn ? catObj.label.bn : catObj.label.en) : '';

    return (
      <View
        className="p-4 mb-3 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {/* Card Header: Title & Category Pill & Copy Button */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-[16px] font-bold text-on-surface">
              {isBn ? dua.title.bn : dua.title.en}
            </Text>
            {catLabel ? (
              <View className="self-start px-2 py-0.5 mt-1 rounded-md bg-primary/10">
                <Text className="text-[11px] font-semibold text-primary">
                  {catLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={() => handleCopyDua(dua)}
            hitSlop={8}
            className="w-9 h-9 rounded-full bg-surface-container-high items-center justify-center active:opacity-60"
          >
            <Icon
              name={isCopied ? 'check' : 'content_copy'}
              size={17}
              color={isCopied ? Colors.primary : Colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        {/* Arabic Script */}
        <Text
          style={{
            fontSize: 21,
            color: Colors.onSurface,
            lineHeight: 38,
            textAlign: 'right',
            writingDirection: 'rtl',
            marginVertical: 8,
          }}
        >
          {dua.arabic}
        </Text>

        {/* Pronunciation / Transliteration */}
        <View className="mb-2">
          <Text className="text-[13px] text-primary italic leading-5">
            {isBn ? dua.transliteration.bn : dua.transliteration.en}
          </Text>
        </View>

        {/* Meaning */}
        <View className="pt-2 border-t border-surface-variant/40 mb-1.5">
          <Text className="text-[13.5px] text-on-surface leading-5">
            {isBn ? dua.meaning.bn : dua.meaning.en}
          </Text>
        </View>

        {/* Reference Badge */}
        {dua.reference ? (
          <View className="items-end mt-1">
            <Text className="text-[11px] text-on-surface-variant font-medium">
              {isBn ? dua.reference.bn : dua.reference.en}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar
        title={isBn ? 'দোয়া' : 'Duas'}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/quran'))}
      />

      {/* Floating Toast Message */}
      {toastMessage ? (
        <View
          style={{
            position: 'absolute',
            top: 72,
            left: 24,
            right: 24,
            zIndex: 99,
            backgroundColor: Colors.inverseSurface,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 14,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 13.5, fontWeight: 'bold', color: Colors.inverseOnSurface }}>
            {toastMessage}
          </Text>
        </View>
      ) : null}

      {/* Top Filter & Search Section: Locked heights & explicit spacing preventing collapse */}
      <View style={{ flexShrink: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 }}>
        {/* Search Input Bar */}
        <View
          style={{
            height: 48,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surfaceContainerLowest,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.outlineVariant,
            paddingHorizontal: 14,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Icon name="search" size={20} color={Colors.onSurfaceVariant} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={isBn ? 'দোয়া খুঁজুন (যেমন: ঘুম, খাবার, সফর)...' : 'Search duas...'}
            placeholderTextColor={Colors.onSurfaceVariant}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: Colors.onSurface,
              padding: 0,
            }}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Icon name="close" size={18} color={Colors.onSurfaceVariant} />
            </Pressable>
          ) : null}
        </View>

        {/* Horizontal Category Filter Pills */}
        <View style={{ height: 38, justifyContent: 'center' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ flexGrow: 0 }}
          >
            {DUA_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                    borderWidth: 1,
                    backgroundColor: isSelected ? Colors.primary : Colors.surfaceContainerLowest,
                    borderColor: isSelected ? Colors.primary : Colors.outlineVariant,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '600',
                      color: isSelected ? '#ffffff' : Colors.onSurfaceVariant,
                    }}
                  >
                    {isBn ? cat.label.bn : cat.label.en}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Dua List */}
      <FlatList
        data={filteredDuas}
        keyExtractor={(item) => item.id}
        renderItem={renderDuaCard}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <Icon name="search" size={32} color={Colors.onSurfaceVariant} />
            <Text className="text-[14px] text-on-surface-variant mt-2 text-center">
              {isBn ? 'কোনো দোয়া খুঁজে পাওয়া যায়নি' : 'No duas found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
