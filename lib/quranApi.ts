import AsyncStorage from '@react-native-async-storage/async-storage';
import { SURAHS, type Surah } from './quranChapters';

export type QuranWord = {
  id: number;
  position: number;
  char_type: 'word' | 'end';
  text: string;
  translation: string;
};

export type QuranVerse = {
  verse_number: number;
  verse_key: string;
  translation: string;
  words: QuranWord[];
};

export type QuranBookmark = {
  surah_id: number;
  verse_number: number;
  surah_name_bn: string;
  surah_name_ar: string;
  created_at: string;
};

export type LastReadPosition = {
  surah_id: number;
  verse_number: number;
  surah_name_bn: string;
  surah_name_ar: string;
  updated_at: string;
};

// Embedded offline data for Surah Al-Fatihah so it works instantly without any internet
export const SURAH_FATIAH_OFFLINE: QuranVerse[] = [
  {
    verse_number: 1,
    verse_key: '1:1',
    translation: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।',
    words: [
      { id: 1, position: 1, char_type: 'word', text: 'بِسْمِ', translation: 'নামে' },
      { id: 2, position: 2, char_type: 'word', text: 'ٱللَّهِ', translation: 'আল্লাহ (র)' },
      { id: 3, position: 3, char_type: 'word', text: 'ٱلرَّحْمَـٰنِ', translation: 'পরম করুণাময়' },
      { id: 4, position: 4, char_type: 'word', text: 'ٱلرَّحِيمِ', translation: 'অসীম দয়ালু' },
      { id: 5, position: 5, char_type: 'end', text: '١', translation: '(১)' },
    ],
  },
  {
    verse_number: 2,
    verse_key: '1:2',
    translation: 'যাবতীয় প্রশংসা জগৎসমূহের প্রতিপালক আল্লাহরই জন্য।',
    words: [
      { id: 1130, position: 1, char_type: 'word', text: 'ٱلْحَمْدُ', translation: 'সকল প্রশংসা' },
      { id: 1131, position: 2, char_type: 'word', text: 'لِلَّهِ', translation: 'আল্লাহ্‌রই জন্য' },
      { id: 1132, position: 3, char_type: 'word', text: 'رَبِّ', translation: '(যিনি) রব' },
      { id: 1133, position: 4, char_type: 'word', text: 'ٱلْعَـٰلَمِينَ', translation: 'সারা জগতের' },
      { id: 1134, position: 5, char_type: 'end', text: '٢', translation: '(২)' },
    ],
  },
  {
    verse_number: 3,
    verse_key: '1:3',
    translation: 'যিনি পরম করুণাময় অতি দয়ালু।',
    words: [
      { id: 2953, position: 1, char_type: 'word', text: 'ٱلرَّحْمَـٰنِ', translation: 'অশেষ করুণাময়' },
      { id: 2954, position: 2, char_type: 'word', text: 'ٱلرَّحِيمِ', translation: 'পরম দয়ালু' },
      { id: 2955, position: 3, char_type: 'end', text: '٣', translation: '(৩)' },
    ],
  },
  {
    verse_number: 4,
    verse_key: '1:4',
    translation: 'যিনি কর্মফল দিবসের মালিক।',
    words: [
      { id: 4330, position: 1, char_type: 'word', text: 'مَـٰلِكِ', translation: 'মালিক / অধিপতি' },
      { id: 4331, position: 2, char_type: 'word', text: 'يَوْمِ', translation: 'দিনের' },
      { id: 4332, position: 3, char_type: 'word', text: 'ٱلدِّينِ', translation: 'বিচার ও কর্মফলের' },
      { id: 4333, position: 4, char_type: 'end', text: '٤', translation: '(৪)' },
    ],
  },
  {
    verse_number: 5,
    verse_key: '1:5',
    translation: 'আমরা কেবল তোমারই ইবাদাত করি এবং তোমারই কাছে সাহায্য চাই।',
    words: [
      { id: 5493, position: 1, char_type: 'word', text: 'إِيَّاكَ', translation: 'আপনারই' },
      { id: 5494, position: 2, char_type: 'word', text: 'نَعْبُدُ', translation: 'আমরা ইবাদত করি' },
      { id: 5495, position: 3, char_type: 'word', text: 'وَإِيَّاكَ', translation: 'এবং আপনারই কাছে' },
      { id: 5496, position: 4, char_type: 'word', text: 'نَسْتَعِينُ', translation: 'আমরা সাহায্য চাই' },
      { id: 5497, position: 5, char_type: 'end', text: '٥', translation: '(৫)' },
    ],
  },
  {
    verse_number: 6,
    verse_key: '1:6',
    translation: 'আমাদেরকে সরল-সঠিক পথে পরিচালিত করুন।',
    words: [
      { id: 6844, position: 1, char_type: 'word', text: 'ٱهْدِنَا', translation: 'আমাদেরকে দেখান' },
      { id: 6845, position: 2, char_type: 'word', text: 'ٱلصِّرَٰطَ', translation: 'পথ' },
      { id: 6846, position: 3, char_type: 'word', text: 'ٱلْمُسْتَقِيمَ', translation: 'সরল সঠিক' },
      { id: 6847, position: 4, char_type: 'end', text: '٦', translation: '(৬)' },
    ],
  },
  {
    verse_number: 7,
    verse_key: '1:7',
    translation: 'তাদের পথে যাদের আপনি অনুগ্রহ করেছেন, তাদের পথে নয় যারা ক্রোধে নিপতিত এবং যারা পথভ্রষ্ট।',
    words: [
      { id: 8411, position: 1, char_type: 'word', text: 'صِرَٰطَ', translation: '(সেই) পথে' },
      { id: 8412, position: 2, char_type: 'word', text: 'ٱلَّذِينَ', translation: 'যাদেরকে' },
      { id: 8413, position: 3, char_type: 'word', text: 'أَنْعَمْتَ', translation: 'অনুগ্রহ দান করেছেন' },
      { id: 8414, position: 4, char_type: 'word', text: 'عَلَيْهِمْ', translation: 'তাদের উপর' },
      { id: 8415, position: 5, char_type: 'word', text: 'غَيْرِ', translation: 'নয়' },
      { id: 8416, position: 6, char_type: 'word', text: 'ٱلْمَغْضُوبِ', translation: 'অভিশপ্তদের' },
      { id: 8417, position: 7, char_type: 'word', text: 'عَلَيْهِمْ', translation: 'যাদের উপর (গজব)' },
      { id: 8418, position: 8, char_type: 'word', text: 'وَلَا', translation: 'এবং না' },
      { id: 8419, position: 9, char_type: 'word', text: 'ٱلضَّآلِّينَ', translation: 'পথভ্রষ্টদের' },
      { id: 8420, position: 10, char_type: 'end', text: '٧', translation: '(৭)' },
    ],
  },
];

const CACHE_PREFIX = 'deentogether.quran.surah.';
const BOOKMARKS_KEY = 'deentogether.quran.bookmarks';
const LAST_READ_KEY = 'deentogether.quran.last_read';

export async function fetchSurahVerses(chapterId: number): Promise<QuranVerse[]> {
  try {
    // 1. Check local persistent cache
    const cacheKey = `${CACHE_PREFIX}${chapterId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 2. If chapter 1 and network fails, fallback to bundled offline data
    if (chapterId === 1) {
      // Save to cache for subsequent queries
      AsyncStorage.setItem(cacheKey, JSON.stringify(SURAH_FATIAH_OFFLINE)).catch(() => {});
      return SURAH_FATIAH_OFFLINE;
    }

    // 3. Fetch from Quran.com API v4 (with word-by-word Bengali and translation 161 - Rawai Al-Bayan / Taisirul Quran)
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?words=true&language=bn&word_fields=text_uthmani,translation&translations=161&per_page=300`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch surah ${chapterId}: HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.verses || !Array.isArray(json.verses)) {
      throw new Error('Invalid verses payload from Quran.com API');
    }

    const cleanVerses: QuranVerse[] = json.verses.map((v: any) => {
      const words: QuranWord[] = (v.words || []).map((w: any) => ({
        id: w.id,
        position: w.position,
        char_type: w.char_type_name === 'end' ? 'end' : 'word',
        text: w.text_uthmani || w.text || '',
        translation: w.translation?.text || '',
      }));

      // Clean HTML tags from translations if present
      let rawTranslation = v.translations?.[0]?.text || '';
      rawTranslation = rawTranslation.replace(/<[^>]*>?/gm, '').trim();

      return {
        verse_number: v.verse_number,
        verse_key: v.verse_key || `${chapterId}:${v.verse_number}`,
        translation: rawTranslation,
        words,
      };
    });

    // 4. Save to persistent cache
    if (cleanVerses.length > 0) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cleanVerses));
    }

    return cleanVerses;
  } catch (err) {
    if (chapterId === 1) return SURAH_FATIAH_OFFLINE;
    throw err;
  }
}

export function getSurahById(id: number): Surah | undefined {
  return SURAHS.find((s) => s.id === id);
}

export async function getQuranBookmarks(): Promise<QuranBookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleQuranBookmark(bookmark: Omit<QuranBookmark, 'created_at'>): Promise<boolean> {
  try {
    const list = await getQuranBookmarks();
    const existingIndex = list.findIndex(
      (b) => b.surah_id === bookmark.surah_id && b.verse_number === bookmark.verse_number,
    );

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      return false; // removed
    } else {
      list.unshift({ ...bookmark, created_at: new Date().toISOString() });
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      return true; // added
    }
  } catch {
    return false;
  }
}

export async function getLastReadPosition(): Promise<LastReadPosition | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_READ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setLastReadPosition(pos: Omit<LastReadPosition, 'updated_at'>): Promise<void> {
  try {
    await AsyncStorage.setItem(
      LAST_READ_KEY,
      JSON.stringify({ ...pos, updated_at: new Date().toISOString() }),
    );
  } catch {
    // ignore
  }
}

