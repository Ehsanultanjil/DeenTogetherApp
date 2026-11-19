export type DuaCategory =
  | 'daily'
  | 'prayer'
  | 'protection'
  | 'forgiveness'
  | 'family'
  | 'travel';

export type Dua = {
  id: string;
  category: DuaCategory;
  title: { en: string; bn: string };
  arabic: string;
  transliteration: { en: string; bn: string };
  meaning: { en: string; bn: string };
  reference?: { en: string; bn: string };
};

export const DUA_CATEGORIES = [
  { id: 'all', label: { bn: 'সব', en: 'All' } },
  { id: 'daily', label: { bn: 'দৈনন্দিন', en: 'Daily' } },
  { id: 'prayer', label: { bn: 'নামাজ ও আযান', en: 'Prayer' } },
  { id: 'protection', label: { bn: 'বিপদ ও হেফাজত', en: 'Protection' } },
  { id: 'forgiveness', label: { bn: 'ক্ষমা ও তাওবা', en: 'Forgiveness' } },
  { id: 'family', label: { bn: 'পরিবার ও জ্ঞান', en: 'Family' } },
  { id: 'travel', label: { bn: 'সফর', en: 'Travel' } },
] as const;

export const DUAS: Dua[] = [
  // --- DAILY (দৈনন্দিন) ---
  {
    id: 'waking-up',
    category: 'daily',
    title: { en: 'Upon Waking Up', bn: 'ঘুম থেকে জাগার দোয়া' },
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: {
      en: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
      bn: 'আলহামদু লিল্লাহিল্লাযী আহ্‌ইয়ানা বা\'দা মা আমাতানা ওয়া ইলাইহিন নুশূর',
    },
    meaning: {
      en: 'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
      bn: 'সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাদের মৃত্যুর পর পুনরায় জীবন দান করেছেন এবং তাঁরই দিকে পুনরুত্থান।',
    },
    reference: { en: 'Sahih al-Bukhari 6312', bn: 'সহীহ বুখারী, হাদিস ৬৩১২' },
  },
  {
    id: 'before-eating',
    category: 'daily',
    title: { en: 'Before Eating', bn: 'খাবার শুরুর দোয়া' },
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: { en: 'Bismillah', bn: 'বিসমিল্লাহ' },
    meaning: {
      en: 'In the name of Allah.',
      bn: 'আল্লাহর নামে (শুরু করছি)।',
    },
    reference: { en: 'Sahih al-Bukhari 5376', bn: 'সহীহ বুখারী, হাদিস ৫৩৭৬' },
  },
  {
    id: 'after-eating',
    category: 'daily',
    title: { en: 'After Eating', bn: 'খাবার শেষের দোয়া' },
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: {
      en: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
      bn: 'আলহামদু লিল্লাহিল্লাযী আত্\'আমানী হাযা ওয়া রাযাকানীহি মিন গাইরি হাওলিম মিন্নী ওয়ালা কুওওয়াহ',
    },
    meaning: {
      en: 'All praise is for Allah who fed me this and provided it without any power or might from me.',
      bn: 'সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাকে এই খাবার খাইয়েছেন এবং আমার কোনো শক্তি ও সামর্থ্য ছাড়াই তা দান করেছেন।',
    },
    reference: { en: 'Jami at-Tirmidhi 3458', bn: 'জামে তিরমিযী, হাদিস ৩৪৫৮' },
  },
  {
    id: 'leaving-home',
    category: 'daily',
    title: { en: 'Leaving the Home', bn: 'ঘর থেকে বের হওয়ার দোয়া' },
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: {
      en: "Bismillahi tawakkaltu 'alallahi wa la hawla wa la quwwata illa billah",
      bn: 'বিসমিল্লাহি তাওয়াক্কালতু আলাল্লাহি ওয়ালা হাওলা ওয়ালা কুওওয়াতা ইল্লা বিল্লাহ',
    },
    meaning: {
      en: 'In the name of Allah, I place my trust in Allah, and there is no power or might except with Allah.',
      bn: 'আল্লাহর নামে, আমি আল্লাহর উপর ভরসা করলাম এবং আল্লাহ ছাড়া কোনো শক্তি ও সামর্থ্য নেই।',
    },
    reference: { en: 'Sunan Abi Dawud 5095', bn: 'সুনানে আবু দাউদ, হাদিস ৫০৯৫' },
  },
  {
    id: 'entering-home',
    category: 'daily',
    title: { en: 'Entering the Home', bn: 'ঘরে প্রবেশের দোয়া' },
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    transliteration: {
      en: "Bismillahi walajna wa bismillahi kharajna wa 'alallahi rabbina tawakkalna",
      bn: 'বিসমিল্লাহি ওয়ালাজনা ওয়া বিসমিল্লাহি খারাজনা ওয়া আলাল্লাহি রাব্বিনা তাওয়াক্কালনা',
    },
    meaning: {
      en: 'In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we place our trust.',
      bn: 'আল্লাহর নামে আমরা প্রবেশ করলাম, আল্লাহর নামে বের হলাম এবং আমাদের প্রতিপালক আল্লাহর উপরই ভরসা করলাম।',
    },
    reference: { en: 'Sunan Abi Dawud 5096', bn: 'সুনানে আবু দাউদ, হাদিস ৫০৯৬' },
  },
  {
    id: 'entering-bathroom',
    category: 'daily',
    title: { en: 'Entering the Bathroom', bn: 'টয়লেটে প্রবেশের দোয়া' },
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: {
      en: "Allahumma inni a'udhu bika minal-khubthi wal-khaba'ith",
      bn: 'আল্লাহুম্মা ইন্নী আ\'ঊযু বিকা মিনাল খুবুসি ওয়াল খাবা-ইস',
    },
    meaning: {
      en: 'O Allah, I seek refuge in You from male and female devils.',
      bn: 'হে আল্লাহ, আমি পুরুষ ও নারী শয়তানদের অনিষ্ট থেকে তোমার আশ্রয় চাই।',
    },
    reference: { en: 'Sahih al-Bukhari 142', bn: 'সহীহ বুখারী, হাদিস ১৪২' },
  },
  {
    id: 'leaving-bathroom',
    category: 'daily',
    title: { en: 'Leaving the Bathroom', bn: 'টয়লেট থেকে বের হওয়ার দোয়া' },
    arabic: 'غُفْرَانَكَ',
    transliteration: { en: 'Ghufranak', bn: 'গুফরানাক' },
    meaning: {
      en: 'I seek Your forgiveness.',
      bn: 'হে আল্লাহ, আমি তোমার ক্ষমা প্রার্থনা করছি।',
    },
    reference: { en: 'Sunan Abi Dawud 30', bn: 'সুনানে আবু দাউদ, হাদিস ৩০' },
  },
  {
    id: 'before-sleeping',
    category: 'daily',
    title: { en: 'Before Sleeping', bn: 'ঘুমানোর আগের দোয়া' },
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: {
      en: 'Bismika Allahumma amutu wa ahya',
      bn: 'বিসমিকা আল্লাহুম্মা আমূতু ওয়া আহইয়া',
    },
    meaning: {
      en: 'In Your name, O Allah, I die and I live.',
      bn: 'হে আল্লাহ, তোমার নামেই আমি মৃত্যুবরণ করি এবং জীবিত হই।',
    },
    reference: { en: 'Sahih al-Bukhari 6324', bn: 'সহীহ বুখারী, হাদিস ৬৩২৪' },
  },

  // --- PRAYER & ADHAN (নামাজ ও আযান) ---
  {
    id: 'after-adhan',
    category: 'prayer',
    title: { en: 'After the Adhan', bn: 'আযানের পরের দোয়া' },
    arabic:
      'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    transliteration: {
      en: "Allahumma rabba hadhihid-da'watit-tammah was-salatil-qa'imah, ati Muhammadanil-wasilata wal-fadilah, wab'ath-hu maqamam-mahmudanil-ladhi wa'adtah",
      bn: 'আল্লাহুম্মা রাব্বা হাযিহিদ দা\'ওয়াতিত তাম্মাহ ওয়াস সালাতিল কায়িমাহ, আতি মুহাম্মাদানিল অসীলাতা ওয়াল ফাদীলাহ, ওয়াব\'আছহু মাক্বামাম মাহমূদানিল্লাযী ওয়া\'আদতাহ',
    },
    meaning: {
      en: 'O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and favor, and raise him to the praiseworthy station You promised him.',
      bn: 'হে আল্লাহ, এই পরিপূর্ণ আহ্বান ও প্রতিষ্ঠিত সালাতের প্রতিপালক, মুহাম্মাদ (সাঃ)-কে ওসিলা ও মর্যাদা দান করো এবং তাঁকে সে প্রশংসিত স্থানে পৌঁছে দাও যার প্রতিশ্রুতি তুমি তাঁকে দিয়েছ।',
    },
    reference: { en: 'Sahih al-Bukhari 614', bn: 'সহীহ বুখারী, হাদিস ৬১৪' },
  },
  {
    id: 'entering-mosque',
    category: 'prayer',
    title: { en: 'Entering the Mosque', bn: 'মসজিদে প্রবেশের দোয়া' },
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: {
      en: 'Allahummaf-tah li abwaba rahmatik',
      bn: 'আল্লাহুম্মাফ-তাহলী আবওয়াবা রাহমাতিক',
    },
    meaning: {
      en: 'O Allah, open for me the doors of Your mercy.',
      bn: 'হে আল্লাহ, আমার জন্য তোমার রহমতের দরজাসমূহ খুলে দাও।',
    },
    reference: { en: 'Sahih Muslim 713', bn: 'সহীহ মুসলিম, হাদিস ৭১৩' },
  },
  {
    id: 'leaving-mosque',
    category: 'prayer',
    title: { en: 'Leaving the Mosque', bn: 'মসজিদ থেকে বের হওয়ার দোয়া' },
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: {
      en: "Allahumma inni as'aluka min fadlik",
      bn: 'আল্লাহুম্মা ইন্নী আস-আলুকা মিন ফাদলিক',
    },
    meaning: {
      en: 'O Allah, I ask You from Your bounty.',
      bn: 'হে আল্লাহ, আমি তোমার অনুগ্রহ ও অনুগ্রহরাজি প্রার্থনা করছি।',
    },
    reference: { en: 'Sahih Muslim 713', bn: 'সহীহ মুসলিম, হাদিস ৭১৩' },
  },
  {
    id: 'after-salam',
    category: 'prayer',
    title: { en: 'After Finishing Prayer (Salam)', bn: 'সালাম ফেরানোর পরের দোয়া' },
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: {
      en: 'Allahumma antas-salamu wa minkas-salam, tabarakta ya dhal-jalali wal-ikram',
      bn: 'আল্লাহুম্মা আনতাস সালামু ওয়া মিনকাস সালাম, তাবারাকতা ইয়া যাল জালালি ওয়াল ইকরাম',
    },
    meaning: {
      en: 'O Allah, You are Peace, and from You comes peace. Blessed are You, O Possessor of Glory and Honor.',
      bn: 'হে আল্লাহ, তুমিই শান্তি এবং তোমার পক্ষ থেকেই আসে শান্তি। তুমি বরকতময়, হে মর্যাদা ও সম্মানের অধিকারী।',
    },
    reference: { en: 'Sahih Muslim 591', bn: 'সহীহ মুসলিম, হাদিস ৫৯১' },
  },

  // --- PROTECTION & DISTRESS (বিপদ ও হেফাজত) ---
  {
    id: 'distress',
    category: 'protection',
    title: { en: 'In Times of Distress & Anxiety', bn: 'বিপদ ও পেরেশানির সময়ের দোয়া' },
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: {
      en: "Hasbunallahu wa ni'mal wakil",
      bn: 'হাসবুনাল্লাহু ওয়া নি\'মাল ওয়াকীল',
    },
    meaning: {
      en: 'Allah is sufficient for us, and He is the best disposer of affairs.',
      bn: 'আল্লাহই আমাদের জন্য যথেষ্ট এবং তিনিই সর্বোত্তম অভিভাবক ও কর্মবিধায়ক।',
    },
    reference: { en: 'Sahih al-Bukhari 4563', bn: 'সহীহ বুখারী, হাদিস ৪৫৬৩' },
  },
  {
    id: 'morning-protection',
    category: 'protection',
    title: { en: 'Protection from All Harm', bn: 'সকল অনিষ্ট থেকে হেফাজতের দোয়া' },
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: {
      en: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
      bn: 'বিসমিল্লাহিল্লাযী লা ইয়াদুররু মা\'আ ইসমিহী শাইউন ফিল আরদ্বি ওয়ালা ফিস সামা-ই, ওয়া হুয়াস সামী\'উল \'আলীম',
    },
    meaning: {
      en: 'In the name of Allah, with whose name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, All-Knowing.',
      bn: 'আল্লাহর নামে, যাঁর নামের সাথে আসমান ও জমিনের কোনো বস্তুই কোনো ক্ষতি করতে পারে না, আর তিনিই সর্বশ্রোতা ও সর্বজ্ঞানী।',
    },
    reference: { en: 'Sunan Abi Dawud 5088', bn: 'সুনানে আবু দাউদ, হাদিস ৫০৮৮' },
  },
  {
    id: 'yunus-dua',
    category: 'protection',
    title: { en: "Prophet Yunus's Prayer in Darkness", bn: 'ইউনুস (আ.)-এর দোয়া (দোয়ায়ে ইউনুস)' },
    arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: {
      en: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin',
      bn: 'লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নী কুনতু মিনায যলিমীন',
    },
    meaning: {
      en: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
      bn: 'তুমি ছাড়া কোনো সত্য ইলাহ নেই, তুমি পরম পবিত্র। নিশ্চয়ই আমি অত্যাচারীদের অন্তর্ভুক্ত ছিলাম।',
    },
    reference: { en: 'Surah Al-Anbiya 21:87 / Tirmidhi 3505', bn: 'সূরা আল-আম্বিয়া ২১:৮৭ / জামে তিরমিযী ৩৫০৫' },
  },

  // --- FORGIVENESS & REPENTANCE (ক্ষমা ও তাওবা) ---
  {
    id: 'sayyidul-istighfar',
    category: 'forgiveness',
    title: { en: 'Sayyidul Istighfar (Master of Forgiveness)', bn: 'সাইয়িদুল ইস্তিগফার (শ্রেষ্ঠ তওবা)' },
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: {
      en: "Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya wa abu'u bidhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa anta",
      bn: 'আল্লাহুম্মা আনতা রাব্বী লা ইলাহা ইল্লা আনতা খালাক্বতানী ওয়া আনা আবদুকা ওয়া আনা আলা আহদিকা ওয়া ওয়াদিকা মাসতাতা\'তু, আ\'ঊযু বিকা মিন শাররি মা সানা\'তু, আবূউ লাকা বিনি\'মাতিকা আলাইয়্যা ওয়া আবূউ বিযানবী ফাগফিরলী ফাইন্নাহু লা ইয়াগফিরুয যুনূবা ইল্লা আনতা',
    },
    meaning: {
      en: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I remain faithful to Your promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for none can forgive sins except You.',
      bn: 'হে আল্লাহ, তুমিই আমার প্রতিপালক, তুমি ছাড়া সত্য কোনো মাবুদ নেই। তুমি আমাকে সৃষ্টি করেছ, আমি তোমার বান্দা এবং আমি সাধ্যমতো তোমার অঙ্গীকার ও প্রতিশ্রুতির উপর কায়েম আছি। আমি আমার কৃতকর্মের অনিষ্ট থেকে তোমার আশ্রয় চাই। আমার প্রতি তোমার নিয়ামত স্বীকার করছি এবং আমার গুনাহ স্বীকার করছি। অতএব তুমি আমাকে ক্ষমা করে দাও, কেননা তুমি ছাড়া কেউ গুনাহ ক্ষমা করতে পারে না।',
    },
    reference: { en: 'Sahih al-Bukhari 6306', bn: 'সহীহ বুখারী, হাদিস ৬৩০৬' },
  },
  {
    id: 'adam-repentance',
    category: 'forgiveness',
    title: { en: "Adam & Hawwa's Prayer for Forgiveness", bn: 'আদম ও হাওয়া (আ.)-এর তওবার দোয়া' },
    arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    transliteration: {
      en: 'Rabbana zalamna anfusana wa-in lam taghfir lana wa-tarhamna lana-kunanna minal-khasirin',
      bn: 'রব্বানা যালামনা আনফুসানা ওয়া ইল্লাম তাগফির লানা ওয়া তারহামনা লানাকূনান্না মিনাল খাসিরীন',
    },
    meaning: {
      en: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
      bn: 'হে আমাদের প্রতিপালক, আমরা নিজেদের উপর জুলুম করেছি। আর যদি তুমি আমাদের ক্ষমা না করো এবং আমাদের প্রতি দয়া না করো, তবে অবশ্যই আমরা ক্ষতিগ্রস্তদের অন্তর্ভুক্ত হয়ে যাব।',
    },
    reference: { en: 'Surah Al-A’raf 7:23', bn: 'সূরা আল-আ\'রাফ ৭:২৩' },
  },

  // --- FAMILY & KNOWLEDGE (পরিবার ও জ্ঞান) ---
  {
    id: 'parents-dua',
    category: 'family',
    title: { en: 'Prayer for Parents', bn: 'পিতামাতার জন্য দোয়া' },
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: {
      en: 'Rabbir-hamhuma kama rabbayani saghira',
      bn: 'রব্বির হামহুমা কামা রব্বায়ানী সাগীরা',
    },
    meaning: {
      en: 'My Lord, have mercy upon them as they brought me up when I was small.',
      bn: 'হে আমার প্রতিপালক, তাদের দুজনের প্রতি দয়া করো, যেভাবে তারা শৈশবে আমাকে স্নেহ-মমতা দিয়ে লালন-পালন করেছেন।',
    },
    reference: { en: 'Surah Al-Isra 17:24', bn: 'সূরা আল-ইসরা ১৭:২৪' },
  },
  {
    id: 'righteous-family',
    category: 'family',
    title: { en: 'Prayer for Righteous Spouse & Children', bn: 'নেক পরিবার ও সন্তানের জন্য দোয়া' },
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: {
      en: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama",
      bn: 'রব্বানা হাব লানা মিন আযওয়াজিনা ওয়া যুররিইয়্যাতিনা ক্বুররাতা আ\'ইয়ুনিওঁ ওয়াজ\'আলনা লিল মুত্তাকীনা ইমামা',
    },
    meaning: {
      en: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.',
      bn: 'হে আমাদের প্রতিপালক, আমাদের জন্য আমাদের স্ত্রী ও সন্তানদের নয়নপ্রীতি বানিয়ে দাও এবং আমাদেরকে মুত্তাকীদের জন্য আদর্শ নেতা বানাও।',
    },
    reference: { en: 'Surah Al-Furqan 25:74', bn: 'সূরা আল-ফুরকান ২৫:৭৪' },
  },
  {
    id: 'increase-knowledge',
    category: 'family',
    title: { en: 'Prayer for Increasing Knowledge', bn: 'জ্ঞান বৃদ্ধির দোয়া' },
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: {
      en: 'Rabbi zidni ilma',
      bn: 'রব্বি যিদনী \'ইলমা',
    },
    meaning: {
      en: 'My Lord, increase me in knowledge.',
      bn: 'হে আমার প্রতিপালক, আমার জ্ঞান বৃদ্ধি করে দাও।',
    },
    reference: { en: 'Surah Ta-Ha 20:114', bn: 'সূরা ত্বা-হা ২০:১১৪' },
  },

  // --- TRAVEL (সফর) ---
  {
    id: 'travel',
    category: 'travel',
    title: { en: 'For Travel & Boarding a Vehicle', bn: 'সফরের দোয়া ও যানবাহনে ওঠার দোয়া' },
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: {
      en: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
      bn: 'সুবহানাল্লাযী সাখখারা লানা হাযা ওয়ামা কুন্না লাহু মুক্বরিনীন ওয়া ইন্না ইলা রাব্বিনা লামুনক্বালিবূন',
    },
    meaning: {
      en: 'Glory to Him who has subjected this to us, and we could never have accomplished it by ourselves. And indeed, to our Lord we will return.',
      bn: 'পবিত্র সেই মহান সত্তা যিনি একে আমাদের বশীভূত করে দিয়েছেন, অথচ আমরা নিজেরা একে বশীভূত করতে সক্ষম ছিলাম না। আর নিশ্চয়ই আমরা আমাদের প্রতিপালকের কাছেই প্রত্যাবর্তনকারী।',
    },
    reference: { en: 'Surah Az-Zukhruf 43:13-14 / Muslim 1342', bn: 'সূরা আয-যুখরুফ ৪৩:১৩-১৪ / সহীহ মুসলিম ১৩৪২' },
  },
];
