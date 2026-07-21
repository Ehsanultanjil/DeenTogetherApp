export type Dua = {
  id: string;
  title: { en: string; bn: string };
  arabic: string;
  transliteration: string;
  meaning: { en: string; bn: string };
};

export const DUAS: Dua[] = [
  {
    id: 'waking-up',
    title: { en: 'Upon Waking Up', bn: 'ঘুম থেকে জাগার দোয়া' },
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    meaning: {
      en: 'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
      bn: 'সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাদের মৃত্যুর পর পুনরায় জীবন দান করেছেন এবং তাঁরই দিকে পুনরুত্থান।',
    },
  },
  {
    id: 'before-eating',
    title: { en: 'Before Eating', bn: 'খাবার শুরুর দোয়া' },
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    meaning: {
      en: 'In the name of Allah.',
      bn: 'আল্লাহর নামে (শুরু করছি)।',
    },
  },
  {
    id: 'after-eating',
    title: { en: 'After Eating', bn: 'খাবার শেষের দোয়া' },
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: 'Alhamdu lillahil-ladhi at\'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah',
    meaning: {
      en: 'All praise is for Allah who fed me this and provided it without any power or might from me.',
      bn: 'সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাকে এই খাবার খাইয়েছেন এবং আমার কোনো শক্তি ও সামর্থ্য ছাড়াই তা দান করেছেন।',
    },
  },
  {
    id: 'leaving-home',
    title: { en: 'Leaving the Home', bn: 'ঘর থেকে বের হওয়ার দোয়া' },
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Bismillahi tawakkaltu \'alallahi wa la hawla wa la quwwata illa billah',
    meaning: {
      en: 'In the name of Allah, I place my trust in Allah, and there is no power or might except with Allah.',
      bn: 'আল্লাহর নামে, আমি আল্লাহর উপর ভরসা করলাম এবং আল্লাহ ছাড়া কোনো শক্তি ও সামর্থ্য নেই।',
    },
  },
  {
    id: 'entering-home',
    title: { en: 'Entering the Home', bn: 'ঘরে প্রবেশের দোয়া' },
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    transliteration: 'Bismillahi walajna wa bismillahi kharajna wa \'alallahi rabbina tawakkalna',
    meaning: {
      en: 'In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we place our trust.',
      bn: 'আল্লাহর নামে আমরা প্রবেশ করলাম, আল্লাহর নামে বের হলাম এবং আমাদের প্রতিপালক আল্লাহর উপরই ভরসা করলাম।',
    },
  },
  {
    id: 'entering-bathroom',
    title: { en: 'Entering the Bathroom', bn: 'টয়লেটে প্রবেশের দোয়া' },
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: "Allahumma inni a'udhu bika minal-khubthi wal-khaba'ith",
    meaning: {
      en: 'O Allah, I seek refuge in You from male and female devils.',
      bn: 'হে আল্লাহ, আমি পুরুষ ও নারী শয়তানদের অনিষ্ট থেকে তোমার আশ্রয় চাই।',
    },
  },
  {
    id: 'leaving-bathroom',
    title: { en: 'Leaving the Bathroom', bn: 'টয়লেট থেকে বের হওয়ার দোয়া' },
    arabic: 'غُفْرَانَكَ',
    transliteration: 'Ghufranak',
    meaning: {
      en: 'I seek Your forgiveness.',
      bn: 'হে আল্লাহ, আমি তোমার ক্ষমা প্রার্থনা করছি।',
    },
  },
  {
    id: 'before-sleeping',
    title: { en: 'Before Sleeping', bn: 'ঘুমানোর আগের দোয়া' },
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: "Bismika Allahumma amutu wa ahya",
    meaning: {
      en: 'In Your name, O Allah, I die and I live.',
      bn: 'হে আল্লাহ, তোমার নামেই আমি মৃত্যুবরণ করি এবং জীবিত হই।',
    },
  },
  {
    id: 'distress',
    title: { en: 'In Times of Distress', bn: 'বিপদের সময়ের দোয়া' },
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: "Hasbunallahu wa ni'mal wakil",
    meaning: {
      en: 'Allah is sufficient for us, and He is the best disposer of affairs.',
      bn: 'আল্লাহই আমাদের জন্য যথেষ্ট এবং তিনিই উত্তম কর্মবিধায়ক।',
    },
  },
  {
    id: 'sayyidul-istighfar',
    title: { en: 'Sayyidul Istighfar (Master Prayer for Forgiveness)', bn: 'সাইয়িদুল ইস্তিগফার' },
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    transliteration:
      "Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastata'tu",
    meaning: {
      en: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I am upon Your covenant and promise as much as I am able.',
      bn: 'হে আল্লাহ, তুমিই আমার প্রতিপালক, তুমি ছাড়া কোনো ইলাহ নেই। তুমি আমাকে সৃষ্টি করেছ, আমি তোমার বান্দা এবং আমি যথাসাধ্য তোমার প্রতিশ্রুতি ও অঙ্গীকারের উপর আছি।',
    },
  },
  {
    id: 'travel',
    title: { en: 'For Travel', bn: 'সফরের দোয়া' },
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration:
      "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun",
    meaning: {
      en: 'Glory to Him who has subjected this to us, and we could never have accomplished it by ourselves. And indeed, to our Lord we will return.',
      bn: 'পবিত্র সেই সত্তা যিনি একে আমাদের বশীভূত করে দিয়েছেন, অথচ আমরা নিজেরা একে বশীভূত করতে সক্ষম ছিলাম না। আর নিশ্চয়ই আমরা আমাদের প্রতিপালকের কাছে প্রত্যাবর্তনকারী।',
    },
  },
  {
    id: 'after-adhan',
    title: { en: 'After the Adhan', bn: 'আযানের পরের দোয়া' },
    arabic:
      'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ',
    transliteration:
      "Allahumma rabba hadhihid-da'watit-tammah was-salatil-qa'imah, ati Muhammadanil-wasilata wal-fadilah",
    meaning: {
      en: 'O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and favor.',
      bn: 'হে আল্লাহ, এই পরিপূর্ণ আহ্বান ও প্রতিষ্ঠিত সালাতের প্রতিপালক, মুহাম্মাদ (সাঃ)-কে ওসিলা ও মর্যাদা দান করো।',
    },
  },
];
