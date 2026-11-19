export type HadithCategory =
  | 'quran'
  | 'faith'
  | 'character'
  | 'deeds'
  | 'brotherhood';

export type Hadith = {
  id: string;
  category: HadithCategory;
  quote: { en: string; bn: string };
  reference: { en: string; bn: string };
};

export const HADITH_CATEGORIES = [
  { id: 'all', label: { bn: 'সব', en: 'All' } },
  { id: 'quran', label: { bn: 'কুরআন ও জ্ঞান', en: 'Quran & Knowledge' } },
  { id: 'faith', label: { bn: 'ঈমান ও নিয়ত', en: 'Faith & Intention' } },
  { id: 'character', label: { bn: 'চরিত্র ও আদব', en: 'Character & Manners' } },
  { id: 'deeds', label: { bn: 'সৎকর্ম ও সাদাকা', en: 'Good Deeds' } },
  { id: 'brotherhood', label: { bn: 'ভ্রাতৃত্ব ও সমাজ', en: 'Brotherhood' } },
] as const;

export const HADITHS: Hadith[] = [
  // --- QURAN & KNOWLEDGE (কুরআন ও জ্ঞান) ---
  {
    id: 'best-learn-teach-quran',
    category: 'quran',
    quote: {
      en: "The best among you are those who learn the Qur'an and teach it.",
      bn: 'তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শেখে এবং অন্যকে শেখায়।',
    },
    reference: { en: 'Sahih al-Bukhari 5027', bn: 'সহীহ বুখারী, হাদিস ৫০২৭' },
  },
  {
    id: 'seeking-knowledge-obligatory',
    category: 'quran',
    quote: {
      en: 'The seeking of knowledge is obligatory for every Muslim.',
      bn: 'দ্বীনের জ্ঞান অর্জন করা প্রত্যেক মুসলিমের উপর ফরজ।',
    },
    reference: { en: 'Sunan Ibn Majah 224', bn: 'সুনানে ইবনে মাজাহ, হাদিস ২২৪' },
  },
  {
    id: 'understanding-of-religion',
    category: 'quran',
    quote: {
      en: 'Whoever Allah wishes good for, He gives him understanding of the religion.',
      bn: 'আল্লাহ যার কল্যাণ চান, তাকে দ্বীনের বিশুদ্ধ জ্ঞান ও গভীর সমঝ দান করেন।',
    },
    reference: { en: 'Sahih al-Bukhari 71, Sahih Muslim 1037', bn: 'সহীহ বুখারী, হাদিস ৭১; সহীহ মুসলিম, হাদিস ১০৩৭' },
  },

  // --- FAITH & INTENTION (ঈমান ও নিয়ত) ---
  {
    id: 'actions-by-intention',
    category: 'faith',
    quote: {
      en: 'Actions are judged by intentions, and every person will get the reward according to what they intended.',
      bn: 'নিশ্চয়ই সকল কাজ নিয়তের উপর নির্ভরশীল, আর প্রত্যেক ব্যক্তি তা-ই পাবে যা সে নিয়ত করেছে।',
    },
    reference: { en: 'Sahih al-Bukhari 1', bn: 'সহীহ বুখারী, হাদিস ১' },
  },
  {
    id: 'cleanliness-half-of-faith',
    category: 'faith',
    quote: {
      en: 'Cleanliness is half of faith.',
      bn: 'পবিত্রতা ঈমানের অর্ধেক।',
    },
    reference: { en: 'Sahih Muslim 223', bn: 'সহীহ মুসলিম, হাদিস ২২৩' },
  },
  {
    id: 'modesty-part-of-faith',
    category: 'faith',
    quote: { en: 'Modesty is a part of faith.', bn: 'লজ্জাশীলতা ঈমানের একটি অপরিহার্য শাখা।' },
    reference: { en: 'Sahih al-Bukhari 24, Sahih Muslim 36', bn: 'সহীহ বুখারী, হাদিস ২৪; সহীহ মুসলিম, হাদিস ৩৬' },
  },
  {
    id: 'desires-subordinate-to-sunnah',
    category: 'faith',
    quote: {
      en: 'None of you truly believes until his desires are in accordance with what I have brought.',
      bn: 'তোমাদের কেউ প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না তার প্রবৃত্তি আমার আনীত বিধানের অনুগত হয়।',
    },
    reference: { en: "An-Nawawi's Forty Hadith 41", bn: 'ইমাম নববীর চল্লিশ হাদিস, হাদিস ৪১' },
  },
  {
    id: 'world-prison-for-believer',
    category: 'faith',
    quote: {
      en: 'The world is a prison for the believer and a paradise for the disbeliever.',
      bn: 'দুনিয়া মুমিনের জন্য কারাগার এবং কাফিরের জন্য জান্নাত।',
    },
    reference: { en: 'Sahih Muslim 2956', bn: 'সহীহ মুসলিম, হাদিস ২৯৫৬' },
  },

  // --- CHARACTER & MANNERS (চরিত্র ও আদব) ---
  {
    id: 'best-manners',
    category: 'character',
    quote: {
      en: 'The best among you are those who have the best manners and character.',
      bn: 'তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যার চরিত্র ও আচরণ সবচেয়ে সুন্দর।',
    },
    reference: { en: 'Sahih al-Bukhari 6035, Sahih Muslim 2321', bn: 'সহীহ বুখারী, হাদিস ৬০৩৫; সহীহ মুসলিম, হাদিস ২৩২১' },
  },
  {
    id: 'speak-good-or-silent',
    category: 'character',
    quote: {
      en: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
      bn: 'যে ব্যক্তি আল্লাহ ও শেষ দিবসের প্রতি ঈমান রাখে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।',
    },
    reference: { en: 'Sahih al-Bukhari 6018, Sahih Muslim 47', bn: 'সহীহ বুখারী, হাদিস ৬০১৮; সহীহ মুসলিম, হাদিস ৪৭' },
  },
  {
    id: 'strength-in-self-control',
    category: 'character',
    quote: {
      en: 'The strong is not the one who overcomes people by his strength, but the strong is the one who controls himself while in anger.',
      bn: 'প্রকৃত বাহাদুর বা শক্তিশালী সে নয় যে কুস্তিতে অন্যকে হারিয়ে দেয়, বরং শক্তিশালী সেই ব্যক্তি যে রাগের সময় নিজেকে নিয়ন্ত্রণ করতে পারে।',
    },
    reference: { en: 'Sahih al-Bukhari 6114, Sahih Muslim 2609', bn: 'সহীহ বুখারী, হাদিস ৬১১৪; সহীহ মুসলিম, হাদিস ২৬০৯' },
  },
  {
    id: 'guarantee-paradise',
    category: 'character',
    quote: {
      en: 'Whoever guarantees me what is between his jaws (his tongue) and what is between his legs (his chastity), I guarantee him Paradise.',
      bn: 'যে ব্যক্তি আমাকে তার দুই চোয়ালের মধ্যবর্তী অঙ্গ (জিহ্বা) ও দুই পায়ের মধ্যবর্তী অঙ্গের (লজ্জাস্থান) হেফাজতের নিশ্চয়তা দেবে, আমি তার জন্য জান্নাতের নিশ্চয়তা দেব।',
    },
    reference: { en: 'Sahih al-Bukhari 6474', bn: 'সহীহ বুখারী, হাদিস ৬৪৭৪' },
  },
  {
    id: 'thank-people-thank-allah',
    category: 'character',
    quote: {
      en: 'He who does not thank people has not thanked Allah.',
      bn: 'যে ব্যক্তি মানুষের প্রতি কৃতজ্ঞতা প্রকাশ করে না, সে আল্লাহর প্রতিও অকৃতজ্ঞ থাকে।',
    },
    reference: { en: 'Sunan Abi Dawud 4811, Jami at-Tirmidhi 1954', bn: 'সুনানে আবু দাউদ, হাদিস ৪৮১১; জামে তিরমিযী, হাদিস ১৯৫৪' },
  },
  {
    id: 'honor-your-guest',
    category: 'character',
    quote: {
      en: 'Whoever believes in Allah and the Last Day should honor his guest.',
      bn: 'যে ব্যক্তি আল্লাহ ও শেষ দিবসের প্রতি ঈমান রাখে, সে যেন তার মেহমানকে সম্মান করে।',
    },
    reference: { en: 'Sahih al-Bukhari 6018, Sahih Muslim 47', bn: 'সহীহ বুখারী, হাদিস ৬০১৮; সহীহ মুসলিম, হাদিস ৪৭' },
  },
  {
    id: 'silence-saves',
    category: 'character',
    quote: { en: 'Whoever remains silent is saved.', bn: 'যে চুপ থাকে, সে মুক্তি পায় ও অনিষ্ট থেকে বাঁচে।' },
    reference: { en: 'Jami at-Tirmidhi 2501', bn: 'জামে তিরমিযী, হাদিস ২৫০১' },
  },
  {
    id: 'best-character-best-to-women',
    category: 'character',
    quote: {
      en: 'The most complete of the believers in faith is the one with the best character.',
      bn: 'ঈমানের দিক দিয়ে সবচেয়ে পরিপূর্ণ মুমিন সে-ই, যার চরিত্র ও ব্যবহার সবচেয়ে উত্তম।',
    },
    reference: { en: 'Jami at-Tirmidhi 1162', bn: 'জামে তিরমিযী, হাদিস ১১৬২' },
  },
  {
    id: 'no-mercy-shown',
    category: 'character',
    quote: {
      en: 'Whoever does not show mercy to others will not be shown mercy.',
      bn: 'যে মানুষের প্রতি দয়া করে না, তার প্রতিও দয়া করা হবে না।',
    },
    reference: { en: 'Sahih al-Bukhari 5997, Sahih Muslim 2318', bn: 'সহীহ বুখারী, হাদিস ৫৯৯৭; সহীহ মুসলিম, হাদিস ২৩১৮' },
  },
  {
    id: 'deprived-of-gentleness',
    category: 'character',
    quote: {
      en: 'Whoever is deprived of gentleness is deprived of goodness.',
      bn: 'যে ব্যক্তি নম্রতা ও কোমলতা থেকে বঞ্চিত, সে সমস্ত কল্যাণ থেকেই বঞ্চিত।',
    },
    reference: { en: 'Sahih Muslim 2592', bn: 'সহীহ মুসলিম, হাদিস ২৫৯২' },
  },
  {
    id: 'richness-is-contentment',
    category: 'character',
    quote: {
      en: 'Richness is not having many possessions, but richness is the richness of the soul.',
      bn: 'প্রাচুর্য মানে সম্পদের আধিক্য নয়, বরং প্রকৃত প্রাচুর্য হলো অন্তরের তৃপ্তি ও নির্লোভ চিত্ত।',
    },
    reference: { en: 'Sahih al-Bukhari 6446, Sahih Muslim 1051', bn: 'সহীহ বুখারী, হাদিস ৬৪৪৬; সহীহ মুসলিম, হাদিস ১০৫১' },
  },

  // --- GOOD DEEDS & CHARITY (সৎকর্ম ও সাদাকা) ---
  {
    id: 'consistent-small-deeds',
    category: 'deeds',
    quote: {
      en: 'The most beloved of deeds to Allah are those done consistently, even if small.',
      bn: 'আল্লাহর কাছে সবচেয়ে প্রিয় আমল হলো যা নিয়মিত করা হয়, যদিও তা পরিমাণে অল্প হয়।',
    },
    reference: { en: 'Sahih al-Bukhari 6465, Sahih Muslim 782', bn: 'সহীহ বুখারী, হাদিস ৬৪৬৫; সহীহ মুসলিম, হাদিস ৭৮২' },
  },
  {
    id: 'upper-hand-better',
    category: 'deeds',
    quote: {
      en: 'The upper hand is better than the lower hand.',
      bn: 'উপরের হাত (দানকারীর হাত) নিচের হাত (গ্রহণকারীর হাত) অপেক্ষা উত্তম।',
    },
    reference: { en: 'Sahih al-Bukhari 1429, Sahih Muslim 1033', bn: 'সহীহ বুখারী, হাদিস ১৪২৯; সহীহ মুসলিম, হাদিস ১০৩৩' },
  },
  {
    id: 'relieve-believers-distress',
    category: 'deeds',
    quote: {
      en: "Whoever relieves a believer's distress in this world, Allah will relieve his distress on the Day of Resurrection.",
      bn: 'যে ব্যক্তি কোনো মুমিনের দুনিয়াবী কষ্ট লাঘব করবে, আল্লাহ কিয়ামতের দিন তার ভয়াবহ কষ্টসমূহ দূর করে দেবেন।',
    },
    reference: { en: 'Sahih Muslim 2699', bn: 'সহীহ মুসলিম, হাদিস ২৬৯৯' },
  },
  {
    id: 'smiling-is-charity',
    category: 'deeds',
    quote: {
      en: 'Smiling in the face of your brother is charity.',
      bn: 'তোমার ভাইয়ের সামনে মৃদু হাসিমুখে থাকা একটি সওয়াবের সাদাকা।',
    },
    reference: { en: 'Jami at-Tirmidhi 1956', bn: 'জামে তিরমিযী, হাদিস ১৯৫৬' },
  },
  {
    id: 'good-word-is-charity',
    category: 'deeds',
    quote: { en: 'A good word is charity.', bn: 'উত্তম ও মিষ্টি কথা বলাও একটি সাদাকা।' },
    reference: { en: 'Sahih al-Bukhari 2989, Sahih Muslim 1009', bn: 'সহীহ বুখারী, হাদিস ২৯৮৯; সহীহ মুসলিম, হাদিস ১০০৯' },
  },
  {
    id: 'kindness-to-every-living-thing',
    category: 'deeds',
    quote: {
      en: 'There is a reward for kindness to every living creature.',
      bn: 'প্রতিটি জীবিত প্রাণীর প্রতি দয়া ও অনুগ্রহ প্রদর্শনে সওয়াব রয়েছে।',
    },
    reference: { en: 'Sahih al-Bukhari 2466, Sahih Muslim 2244', bn: 'সহীহ বুখারী, হাদিস ২৪৬৬; সহীহ মুসলিম, হাদিস ২২৪৪' },
  },
  {
    id: 'dont-belittle-good-deed',
    category: 'deeds',
    quote: {
      en: 'Do not belittle any good deed, even meeting your brother with a cheerful face.',
      bn: 'কোনো নেক আমলকেই কখনো তুচ্ছ মনে করো না, এমনকি হাসিমুখে ভাইয়ের সাথে সাক্ষাৎ করাকেও নয়।',
    },
    reference: { en: 'Sahih Muslim 2626', bn: 'সহীহ মুসলিম, হাদিস ২৬২৬' },
  },
  {
    id: 'guide-to-goodness',
    category: 'deeds',
    quote: {
      en: 'Whoever guides someone to goodness will have a reward similar to the one who did it.',
      bn: 'যে ব্যক্তি কাউকে কোনো সৎকাজের পথ দেখায়, সে ওই আমলকারীর সমান সওয়াব লাভ করবে।',
    },
    reference: { en: 'Sahih Muslim 1893', bn: 'সহীহ মুসলিম, হাদিস ১৮৯৩' },
  },

  // --- BROTHERHOOD & SOCIETY (ভ্রাতৃত্ব ও সমাজ) ---
  {
    id: 'love-for-brother',
    category: 'brotherhood',
    quote: {
      en: 'None of you truly believes until he loves for his brother what he loves for himself.',
      bn: 'তোমাদের কেউ ততক্ষণ পর্যন্ত পূর্ণ ঈমানদার হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তা-ই পছন্দ করে, যা সে নিজের জন্য পছন্দ করে।',
    },
    reference: { en: 'Sahih al-Bukhari 13, Sahih Muslim 45', bn: 'সহীহ বুখারী, হাদিস ১৩; সহীহ মুসলিম, হাদিস ৪৫' },
  },
  {
    id: 'muslim-safe-tongue-hand',
    category: 'brotherhood',
    quote: {
      en: 'A Muslim is the one from whose tongue and hands other Muslims are safe.',
      bn: 'প্রকৃত মুসলিম সে-ই, যার জিহ্বা ও হাতের অনিষ্ট থেকে অন্য মুসলিমরা সম্পূর্ণ নিরাপদ থাকে।',
    },
    reference: { en: 'Sahih al-Bukhari 10, Sahih Muslim 41', bn: 'সহীহ বুখারী, হাদিস ১০; সহীহ মুসলিম, হাদিস ৪১' },
  },
  {
    id: 'believers-one-body',
    category: 'brotherhood',
    quote: {
      en: 'The believers, in their mutual kindness, compassion, and sympathy, are just like one body.',
      bn: 'পারস্পরিক ভালোবাসা, দয়া ও সহানুভূতিতে মুমিনগণ একটি দেহের মতো; দেহের একটি অঙ্গ আক্রান্ত হলে গোটা দেহ ব্যথিত হয়।',
    },
    reference: { en: 'Sahih al-Bukhari 6011, Sahih Muslim 2586', bn: 'সহীহ বুখারী, হাদিস ৬০১১; সহীহ মুসলিম, হাদিস ২৫৮৬' },
  },
];

// Deterministic per-day pick — same hadith all day for a given location
// date, rotates to a new one the next day, no persistence needed to stay
// stable within a day.
export function hadithForDate(dateString: string): Hadith {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) >>> 0;
  }
  return HADITHS[hash % HADITHS.length];
}
