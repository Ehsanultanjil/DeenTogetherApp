// Comprehensive list of all 114 Surahs of the Holy Quran with Arabic, English, and authentic Bengali metadata.
export type Surah = {
  id: number;
  name_simple: string;
  name_arabic: string;
  name_bn: string;
  meaning_bn: string;
  revelation_place: 'makkah' | 'madinah';
  verses_count: number;
};

export const SURAHS: Surah[] = [
    {
        "id":  1,
        "name_simple":  "Al-Fatihah",
        "name_arabic":  "الفاتحة",
        "name_bn":  "আল-ফাতিহা",
        "meaning_bn":  "সূচনা",
        "revelation_place":  "makkah",
        "verses_count":  7
    },
    {
        "id":  2,
        "name_simple":  "Al-Baqarah",
        "name_arabic":  "البقرة",
        "name_bn":  "আল-বাকারা",
        "meaning_bn":  "বকনা-বাছুর",
        "revelation_place":  "madinah",
        "verses_count":  286
    },
    {
        "id":  3,
        "name_simple":  "Ali \u0027Imran",
        "name_arabic":  "آل عمران",
        "name_bn":  "আলে ইমরান",
        "meaning_bn":  "ইমরানের পরিবার",
        "revelation_place":  "madinah",
        "verses_count":  200
    },
    {
        "id":  4,
        "name_simple":  "An-Nisa",
        "name_arabic":  "النساء",
        "name_bn":  "আন-নিসা",
        "meaning_bn":  "নারী",
        "revelation_place":  "madinah",
        "verses_count":  176
    },
    {
        "id":  5,
        "name_simple":  "Al-Ma\u0027idah",
        "name_arabic":  "المائدة",
        "name_bn":  "আল-মায়িদাহ",
        "meaning_bn":  "খাদ্য পরিবেশিত টেবিল",
        "revelation_place":  "madinah",
        "verses_count":  120
    },
    {
        "id":  6,
        "name_simple":  "Al-An\u0027am",
        "name_arabic":  "الأنعام",
        "name_bn":  "আল-আন\u0027আম",
        "meaning_bn":  "গৃহপালিত পশু",
        "revelation_place":  "makkah",
        "verses_count":  165
    },
    {
        "id":  7,
        "name_simple":  "Al-A\u0027raf",
        "name_arabic":  "الأعراف",
        "name_bn":  "আল-আ\u0027রাফ",
        "meaning_bn":  "উচু স্থান",
        "revelation_place":  "makkah",
        "verses_count":  206
    },
    {
        "id":  8,
        "name_simple":  "Al-Anfal",
        "name_arabic":  "الأنفال",
        "name_bn":  "আল-আনফাল",
        "meaning_bn":  "যুদ্ধ-লব্ধ ধনসম্পদ",
        "revelation_place":  "madinah",
        "verses_count":  75
    },
    {
        "id":  9,
        "name_simple":  "At-Tawbah",
        "name_arabic":  "التوبة",
        "name_bn":  "আত-তাওবাহ",
        "meaning_bn":  "অনুশোচনা",
        "revelation_place":  "madinah",
        "verses_count":  129
    },
    {
        "id":  10,
        "name_simple":  "Yunus",
        "name_arabic":  "يونس",
        "name_bn":  "ইউনুস",
        "meaning_bn":  "নবী ইউনুস",
        "revelation_place":  "makkah",
        "verses_count":  109
    },
    {
        "id":  11,
        "name_simple":  "Hud",
        "name_arabic":  "هود",
        "name_bn":  "হুদ",
        "meaning_bn":  "নবী হুদ",
        "revelation_place":  "makkah",
        "verses_count":  123
    },
    {
        "id":  12,
        "name_simple":  "Yusuf",
        "name_arabic":  "يوسف",
        "name_bn":  "ইউসুফ",
        "meaning_bn":  "নবী ইউসুফ",
        "revelation_place":  "makkah",
        "verses_count":  111
    },
    {
        "id":  13,
        "name_simple":  "Ar-Ra\u0027d",
        "name_arabic":  "الرعد",
        "name_bn":  "আর-রাদ",
        "meaning_bn":  "বজ্রপাত",
        "revelation_place":  "madinah",
        "verses_count":  43
    },
    {
        "id":  14,
        "name_simple":  "Ibrahim",
        "name_arabic":  "ابراهيم",
        "name_bn":  "ইব্রাহিম",
        "meaning_bn":  "নবী ইবরাহীম",
        "revelation_place":  "makkah",
        "verses_count":  52
    },
    {
        "id":  15,
        "name_simple":  "Al-Hijr",
        "name_arabic":  "الحجر",
        "name_bn":  "আল-হিজর",
        "meaning_bn":  "পাথুরে পাহাড়",
        "revelation_place":  "makkah",
        "verses_count":  99
    },
    {
        "id":  16,
        "name_simple":  "An-Nahl",
        "name_arabic":  "النحل",
        "name_bn":  "আন-নাহল",
        "meaning_bn":  "মৌমাছি",
        "revelation_place":  "makkah",
        "verses_count":  128
    },
    {
        "id":  17,
        "name_simple":  "Al-Isra",
        "name_arabic":  "الإسراء",
        "name_bn":  "বনি ইসরাঈল",
        "meaning_bn":  "ইহুদি জাতি",
        "revelation_place":  "makkah",
        "verses_count":  111
    },
    {
        "id":  18,
        "name_simple":  "Al-Kahf",
        "name_arabic":  "الكهف",
        "name_bn":  "আল-কাহফ",
        "meaning_bn":  "গুহা",
        "revelation_place":  "makkah",
        "verses_count":  110
    },
    {
        "id":  19,
        "name_simple":  "Maryam",
        "name_arabic":  "مريم",
        "name_bn":  "মারইয়াম",
        "meaning_bn":  "মারইয়াম (ঈসা নবীর মা)",
        "revelation_place":  "makkah",
        "verses_count":  98
    },
    {
        "id":  20,
        "name_simple":  "Taha",
        "name_arabic":  "طه",
        "name_bn":  "ত্বা-হা",
        "meaning_bn":  "ত়া হা",
        "revelation_place":  "makkah",
        "verses_count":  135
    },
    {
        "id":  21,
        "name_simple":  "Al-Anbya",
        "name_arabic":  "الأنبياء",
        "name_bn":  "আল-আম্বিয়া",
        "meaning_bn":  "নবীগণ",
        "revelation_place":  "makkah",
        "verses_count":  112
    },
    {
        "id":  22,
        "name_simple":  "Al-Hajj",
        "name_arabic":  "الحج",
        "name_bn":  "আল-হজ্জ",
        "meaning_bn":  "হ়াজ্জ",
        "revelation_place":  "madinah",
        "verses_count":  78
    },
    {
        "id":  23,
        "name_simple":  "Al-Mu\u0027minun",
        "name_arabic":  "المؤمنون",
        "name_bn":  "আল-মু\u0027মিনুন",
        "meaning_bn":  "বিশ্বাসী",
        "revelation_place":  "makkah",
        "verses_count":  118
    },
    {
        "id":  24,
        "name_simple":  "An-Nur",
        "name_arabic":  "النور",
        "name_bn":  "আন-নূর",
        "meaning_bn":  "আলো",
        "revelation_place":  "madinah",
        "verses_count":  64
    },
    {
        "id":  25,
        "name_simple":  "Al-Furqan",
        "name_arabic":  "الفرقان",
        "name_bn":  "আল-ফুরকান",
        "meaning_bn":  "মানদণ্ড",
        "revelation_place":  "makkah",
        "verses_count":  77
    },
    {
        "id":  26,
        "name_simple":  "Ash-Shu\u0027ara",
        "name_arabic":  "الشعراء",
        "name_bn":  "আশ-শু\u0027আরা",
        "meaning_bn":  "কবি",
        "revelation_place":  "makkah",
        "verses_count":  227
    },
    {
        "id":  27,
        "name_simple":  "An-Naml",
        "name_arabic":  "النمل",
        "name_bn":  "আন-নামল",
        "meaning_bn":  "পিঁপড়া",
        "revelation_place":  "makkah",
        "verses_count":  93
    },
    {
        "id":  28,
        "name_simple":  "Al-Qasas",
        "name_arabic":  "القصص",
        "name_bn":  "আল-কাসাস",
        "meaning_bn":  "কাহিনি",
        "revelation_place":  "makkah",
        "verses_count":  88
    },
    {
        "id":  29,
        "name_simple":  "Al-\u0027Ankabut",
        "name_arabic":  "العنكبوت",
        "name_bn":  "আল-আনকাবুত",
        "meaning_bn":  "মাকড়শা",
        "revelation_place":  "makkah",
        "verses_count":  69
    },
    {
        "id":  30,
        "name_simple":  "Ar-Rum",
        "name_arabic":  "الروم",
        "name_bn":  "আর-রূম",
        "meaning_bn":  "রোমান জাতি",
        "revelation_place":  "makkah",
        "verses_count":  60
    },
    {
        "id":  31,
        "name_simple":  "Luqman",
        "name_arabic":  "لقمان",
        "name_bn":  "লুকমান",
        "meaning_bn":  "এক জ্ঞানী ব্যাক্তি",
        "revelation_place":  "makkah",
        "verses_count":  34
    },
    {
        "id":  32,
        "name_simple":  "As-Sajdah",
        "name_arabic":  "السجدة",
        "name_bn":  "আস-সাজদাহ",
        "meaning_bn":  "সিজদা",
        "revelation_place":  "makkah",
        "verses_count":  30
    },
    {
        "id":  33,
        "name_simple":  "Al-Ahzab",
        "name_arabic":  "الأحزاب",
        "name_bn":  "আল-আহযাব",
        "meaning_bn":  "জোট",
        "revelation_place":  "madinah",
        "verses_count":  73
    },
    {
        "id":  34,
        "name_simple":  "Saba",
        "name_arabic":  "سبإ",
        "name_bn":  "সাবা",
        "meaning_bn":  "রানী সাবা/শেবা",
        "revelation_place":  "makkah",
        "verses_count":  54
    },
    {
        "id":  35,
        "name_simple":  "Fatir",
        "name_arabic":  "فاطر",
        "name_bn":  "ফাতির",
        "meaning_bn":  "আদি স্রষ্টা",
        "revelation_place":  "makkah",
        "verses_count":  45
    },
    {
        "id":  36,
        "name_simple":  "Ya-Sin",
        "name_arabic":  "يس",
        "name_bn":  "ইয়াসিন",
        "meaning_bn":  "ইয়াসীন",
        "revelation_place":  "makkah",
        "verses_count":  83
    },
    {
        "id":  37,
        "name_simple":  "As-Saffat",
        "name_arabic":  "الصافات",
        "name_bn":  "আস-সাফফাত",
        "meaning_bn":  "সারিবদ্ধভাবে দাঁড়ানো",
        "revelation_place":  "makkah",
        "verses_count":  182
    },
    {
        "id":  38,
        "name_simple":  "Sad",
        "name_arabic":  "ص",
        "name_bn":  "সোয়াদ",
        "meaning_bn":  "আরবি বর্ণ সাদ",
        "revelation_place":  "makkah",
        "verses_count":  88
    },
    {
        "id":  39,
        "name_simple":  "Az-Zumar",
        "name_arabic":  "الزمر",
        "name_bn":  "আজ-জুমার",
        "meaning_bn":  "দলবদ্ধ জনতা",
        "revelation_place":  "makkah",
        "verses_count":  75
    },
    {
        "id":  40,
        "name_simple":  "Ghafir",
        "name_arabic":  "غافر",
        "name_bn":  "গাফির",
        "meaning_bn":  "ক্ষমাকারী",
        "revelation_place":  "makkah",
        "verses_count":  85
    },
    {
        "id":  41,
        "name_simple":  "Fussilat",
        "name_arabic":  "فصلت",
        "name_bn":  "ফুসসিলাত",
        "meaning_bn":  "সুস্পষ্ট বিবরণ",
        "revelation_place":  "makkah",
        "verses_count":  54
    },
    {
        "id":  42,
        "name_simple":  "Ash-Shuraa",
        "name_arabic":  "الشورى",
        "name_bn":  "আশ-শুরা",
        "meaning_bn":  "পরামর্শ",
        "revelation_place":  "makkah",
        "verses_count":  53
    },
    {
        "id":  43,
        "name_simple":  "Az-Zukhruf",
        "name_arabic":  "الزخرف",
        "name_bn":  "আজ-জুখরুফ",
        "meaning_bn":  "সোনাদানা",
        "revelation_place":  "makkah",
        "verses_count":  89
    },
    {
        "id":  44,
        "name_simple":  "Ad-Dukhan",
        "name_arabic":  "الدخان",
        "name_bn":  "আদ-দুখান",
        "meaning_bn":  "ধোঁয়া",
        "revelation_place":  "makkah",
        "verses_count":  59
    },
    {
        "id":  45,
        "name_simple":  "Al-Jathiyah",
        "name_arabic":  "الجاثية",
        "name_bn":  "আল-জাসিয়াহ",
        "meaning_bn":  "নতজানু",
        "revelation_place":  "makkah",
        "verses_count":  37
    },
    {
        "id":  46,
        "name_simple":  "Al-Ahqaf",
        "name_arabic":  "الأحقاف",
        "name_bn":  "আল-আহকাফ",
        "meaning_bn":  "বালুর পাহাড়",
        "revelation_place":  "makkah",
        "verses_count":  35
    },
    {
        "id":  47,
        "name_simple":  "Muhammad",
        "name_arabic":  "محمد",
        "name_bn":  "মুহাম্মদ",
        "meaning_bn":  "নবী মুহাম্মদ",
        "revelation_place":  "madinah",
        "verses_count":  38
    },
    {
        "id":  48,
        "name_simple":  "Al-Fath",
        "name_arabic":  "الفتح",
        "name_bn":  "আল-ফাতহ",
        "meaning_bn":  "বিজয়",
        "revelation_place":  "madinah",
        "verses_count":  29
    },
    {
        "id":  49,
        "name_simple":  "Al-Hujurat",
        "name_arabic":  "الحجرات",
        "name_bn":  "আল-হুজুরাত",
        "meaning_bn":  "আবাস",
        "revelation_place":  "madinah",
        "verses_count":  18
    },
    {
        "id":  50,
        "name_simple":  "Qaf",
        "name_arabic":  "ق",
        "name_bn":  "ক্বাফ",
        "meaning_bn":  "কাফ",
        "revelation_place":  "makkah",
        "verses_count":  45
    },
    {
        "id":  51,
        "name_simple":  "Adh-Dhariyat",
        "name_arabic":  "الذاريات",
        "name_bn":  "আজ-যারিয়াত",
        "meaning_bn":  "বিক্ষেপকারী বাতাস",
        "revelation_place":  "makkah",
        "verses_count":  60
    },
    {
        "id":  52,
        "name_simple":  "At-Tur",
        "name_arabic":  "الطور",
        "name_bn":  "আত-তূর",
        "meaning_bn":  "পাহাড়",
        "revelation_place":  "makkah",
        "verses_count":  49
    },
    {
        "id":  53,
        "name_simple":  "An-Najm",
        "name_arabic":  "النجم",
        "name_bn":  "আন-নাজম",
        "meaning_bn":  "তারা",
        "revelation_place":  "makkah",
        "verses_count":  62
    },
    {
        "id":  54,
        "name_simple":  "Al-Qamar",
        "name_arabic":  "القمر",
        "name_bn":  "আল-ক্বামার",
        "meaning_bn":  "চাঁদ",
        "revelation_place":  "makkah",
        "verses_count":  55
    },
    {
        "id":  55,
        "name_simple":  "Ar-Rahman",
        "name_arabic":  "الرحمن",
        "name_bn":  "আর-রহমান",
        "meaning_bn":  "পরম করুণাময়",
        "revelation_place":  "madinah",
        "verses_count":  78
    },
    {
        "id":  56,
        "name_simple":  "Al-Waqi\u0027ah",
        "name_arabic":  "الواقعة",
        "name_bn":  "আল-ওয়াকি\u0027আহ",
        "meaning_bn":  "নিশ্চিত ঘটনা",
        "revelation_place":  "makkah",
        "verses_count":  96
    },
    {
        "id":  57,
        "name_simple":  "Al-Hadid",
        "name_arabic":  "الحديد",
        "name_bn":  "আল-হাদিদ",
        "meaning_bn":  "লোহা",
        "revelation_place":  "madinah",
        "verses_count":  29
    },
    {
        "id":  58,
        "name_simple":  "Al-Mujadila",
        "name_arabic":  "المجادلة",
        "name_bn":  "আল-মুজাদালাহ",
        "meaning_bn":  "অনুযোগকারিণী",
        "revelation_place":  "madinah",
        "verses_count":  22
    },
    {
        "id":  59,
        "name_simple":  "Al-Hashr",
        "name_arabic":  "الحشر",
        "name_bn":  "আল-হাশর",
        "meaning_bn":  "সমাবেশ",
        "revelation_place":  "madinah",
        "verses_count":  24
    },
    {
        "id":  60,
        "name_simple":  "Al-Mumtahanah",
        "name_arabic":  "الممتحنة",
        "name_bn":  "আল-মুমতাহানাহ",
        "meaning_bn":  "নারী, যাকে পরীক্ষা করা হবে",
        "revelation_place":  "madinah",
        "verses_count":  13
    },
    {
        "id":  61,
        "name_simple":  "As-Saf",
        "name_arabic":  "الصف",
        "name_bn":  "আস-সাফ",
        "meaning_bn":  "সারিবদ্ধ সৈন্যদল",
        "revelation_place":  "madinah",
        "verses_count":  14
    },
    {
        "id":  62,
        "name_simple":  "Al-Jumu\u0027ah",
        "name_arabic":  "الجمعة",
        "name_bn":  "আল-জুমু\u0027আহ",
        "meaning_bn":  "সম্মেলন/শুক্রবার",
        "revelation_place":  "madinah",
        "verses_count":  11
    },
    {
        "id":  63,
        "name_simple":  "Al-Munafiqun",
        "name_arabic":  "المنافقون",
        "name_bn":  "আল-মুনাফিকুন",
        "meaning_bn":  "ভণ্ড বিশ্বাসী",
        "revelation_place":  "madinah",
        "verses_count":  11
    },
    {
        "id":  64,
        "name_simple":  "At-Taghabun",
        "name_arabic":  "التغابن",
        "name_bn":  "আত-তাগাবুন",
        "meaning_bn":  "মোহ অপসারণ",
        "revelation_place":  "madinah",
        "verses_count":  18
    },
    {
        "id":  65,
        "name_simple":  "At-Talaq",
        "name_arabic":  "الطلاق",
        "name_bn":  "আত-ত্বালাক",
        "meaning_bn":  "তালাক",
        "revelation_place":  "madinah",
        "verses_count":  12
    },
    {
        "id":  66,
        "name_simple":  "At-Tahrim",
        "name_arabic":  "التحريم",
        "name_bn":  "আত-তাহরীম",
        "meaning_bn":  "নিষিদ্ধকরণ",
        "revelation_place":  "madinah",
        "verses_count":  12
    },
    {
        "id":  67,
        "name_simple":  "Al-Mulk",
        "name_arabic":  "الملك",
        "name_bn":  "আল-মুলক",
        "meaning_bn":  "সার্বভৌম কর্তৃত্ব",
        "revelation_place":  "makkah",
        "verses_count":  30
    },
    {
        "id":  68,
        "name_simple":  "Al-Qalam",
        "name_arabic":  "القلم",
        "name_bn":  "আল-কলম",
        "meaning_bn":  "কলম",
        "revelation_place":  "makkah",
        "verses_count":  52
    },
    {
        "id":  69,
        "name_simple":  "Al-Haqqah",
        "name_arabic":  "الحاقة",
        "name_bn":  "আল-হাক্কাহ",
        "meaning_bn":  "নিশ্চিত সত্য",
        "revelation_place":  "makkah",
        "verses_count":  52
    },
    {
        "id":  70,
        "name_simple":  "Al-Ma\u0027arij",
        "name_arabic":  "المعارج",
        "name_bn":  "আল-মা\u0027আরিজ",
        "meaning_bn":  "উন্নয়নের সোপান",
        "revelation_place":  "makkah",
        "verses_count":  44
    },
    {
        "id":  71,
        "name_simple":  "Nuh",
        "name_arabic":  "نوح",
        "name_bn":  "নূহ",
        "meaning_bn":  "নবী নূহ",
        "revelation_place":  "makkah",
        "verses_count":  28
    },
    {
        "id":  72,
        "name_simple":  "Al-Jinn",
        "name_arabic":  "الجن",
        "name_bn":  "আল-জ্বিন",
        "meaning_bn":  "জিন সম্প্রদায়",
        "revelation_place":  "makkah",
        "verses_count":  28
    },
    {
        "id":  73,
        "name_simple":  "Al-Muzzammil",
        "name_arabic":  "المزمل",
        "name_bn":  "আল-মুযযাম্মিল",
        "meaning_bn":  "বস্ত্রাচ্ছাদনকারী",
        "revelation_place":  "makkah",
        "verses_count":  20
    },
    {
        "id":  74,
        "name_simple":  "Al-Muddaththir",
        "name_arabic":  "المدثر",
        "name_bn":  "আল-মুদ্দাসসির",
        "meaning_bn":  "পোশাক পরিহিত",
        "revelation_place":  "makkah",
        "verses_count":  56
    },
    {
        "id":  75,
        "name_simple":  "Al-Qiyamah",
        "name_arabic":  "القيامة",
        "name_bn":  "আল-কিয়ামাহ",
        "meaning_bn":  "পুনরুত্থান",
        "revelation_place":  "makkah",
        "verses_count":  40
    },
    {
        "id":  76,
        "name_simple":  "Al-Insan",
        "name_arabic":  "الانسان",
        "name_bn":  "আল-ইনসান",
        "meaning_bn":  "মানবজাতি",
        "revelation_place":  "madinah",
        "verses_count":  31
    },
    {
        "id":  77,
        "name_simple":  "Al-Mursalat",
        "name_arabic":  "المرسلات",
        "name_bn":  "আল-মুরসালাত",
        "meaning_bn":  "প্রেরিত পুরুষ",
        "revelation_place":  "makkah",
        "verses_count":  50
    },
    {
        "id":  78,
        "name_simple":  "An-Naba",
        "name_arabic":  "النبإ",
        "name_bn":  "আন-নাবা",
        "meaning_bn":  "মহাসংবাদ",
        "revelation_place":  "makkah",
        "verses_count":  40
    },
    {
        "id":  79,
        "name_simple":  "An-Nazi\u0027at",
        "name_arabic":  "النازعات",
        "name_bn":  "আন-নাযি\u0027আত",
        "meaning_bn":  "প্রচেষ্টাকারী",
        "revelation_place":  "makkah",
        "verses_count":  46
    },
    {
        "id":  80,
        "name_simple":  "\u0027Abasa",
        "name_arabic":  "عبس",
        "name_bn":  "আবাসা",
        "meaning_bn":  "সে ভ্রু কুঁচকালো",
        "revelation_place":  "makkah",
        "verses_count":  42
    },
    {
        "id":  81,
        "name_simple":  "At-Takwir",
        "name_arabic":  "التكوير",
        "name_bn":  "আত-তাকবীর",
        "meaning_bn":  "অন্ধকারাচ্ছন্ন",
        "revelation_place":  "makkah",
        "verses_count":  29
    },
    {
        "id":  82,
        "name_simple":  "Al-Infitar",
        "name_arabic":  "الإنفطار",
        "name_bn":  "আল-ইনফিতার",
        "meaning_bn":  "বিদীর্ণ করা",
        "revelation_place":  "makkah",
        "verses_count":  19
    },
    {
        "id":  83,
        "name_simple":  "Al-Mutaffifin",
        "name_arabic":  "المطففين",
        "name_bn":  "আল-মুতাফফিফীন",
        "meaning_bn":  "প্রতারণা করা",
        "revelation_place":  "makkah",
        "verses_count":  36
    },
    {
        "id":  84,
        "name_simple":  "Al-Inshiqaq",
        "name_arabic":  "الإنشقاق",
        "name_bn":  "আল-ইনশিকাক",
        "meaning_bn":  "খণ্ড-বিখণ্ডকরণ",
        "revelation_place":  "makkah",
        "verses_count":  25
    },
    {
        "id":  85,
        "name_simple":  "Al-Buruj",
        "name_arabic":  "البروج",
        "name_bn":  "আল-বুরূজ",
        "meaning_bn":  "নক্ষত্রপুঞ্জ",
        "revelation_place":  "makkah",
        "verses_count":  22
    },
    {
        "id":  86,
        "name_simple":  "At-Tariq",
        "name_arabic":  "الطارق",
        "name_bn":  "আত-তারিক",
        "meaning_bn":  "রাতের আগন্তুক",
        "revelation_place":  "makkah",
        "verses_count":  17
    },
    {
        "id":  87,
        "name_simple":  "Al-A\u0027la",
        "name_arabic":  "الأعلى",
        "name_bn":  "আল-আ\u0027লা",
        "meaning_bn":  "সর্বোন্নত",
        "revelation_place":  "makkah",
        "verses_count":  19
    },
    {
        "id":  88,
        "name_simple":  "Al-Ghashiyah",
        "name_arabic":  "الغاشية",
        "name_bn":  "আল-গাশিয়াহ",
        "meaning_bn":  "বিহ্বলকর ঘটনা",
        "revelation_place":  "makkah",
        "verses_count":  26
    },
    {
        "id":  89,
        "name_simple":  "Al-Fajr",
        "name_arabic":  "الفجر",
        "name_bn":  "আল-ফজর",
        "meaning_bn":  "ভোরবেলা",
        "revelation_place":  "makkah",
        "verses_count":  30
    },
    {
        "id":  90,
        "name_simple":  "Al-Balad",
        "name_arabic":  "البلد",
        "name_bn":  "আল-বালাদ",
        "meaning_bn":  "নগর",
        "revelation_place":  "makkah",
        "verses_count":  20
    },
    {
        "id":  91,
        "name_simple":  "Ash-Shams",
        "name_arabic":  "الشمس",
        "name_bn":  "আশ-শামস",
        "meaning_bn":  "সূর্য",
        "revelation_place":  "makkah",
        "verses_count":  15
    },
    {
        "id":  92,
        "name_simple":  "Al-Layl",
        "name_arabic":  "الليل",
        "name_bn":  "আল-লায়ল",
        "meaning_bn":  "রাত",
        "revelation_place":  "makkah",
        "verses_count":  21
    },
    {
        "id":  93,
        "name_simple":  "Ad-Duhaa",
        "name_arabic":  "الضحى",
        "name_bn":  "আদ-দুহা",
        "meaning_bn":  "পূর্বাহ্নের সুর্যকিরণ",
        "revelation_place":  "makkah",
        "verses_count":  11
    },
    {
        "id":  94,
        "name_simple":  "Ash-Sharh",
        "name_arabic":  "الشرح",
        "name_bn":  "আল-ইনশিরাহ",
        "meaning_bn":  "বক্ষ প্রশস্তকরণ",
        "revelation_place":  "makkah",
        "verses_count":  8
    },
    {
        "id":  95,
        "name_simple":  "At-Tin",
        "name_arabic":  "التين",
        "name_bn":  "আত-তীন",
        "meaning_bn":  "ডুমুর",
        "revelation_place":  "makkah",
        "verses_count":  8
    },
    {
        "id":  96,
        "name_simple":  "Al-\u0027Alaq",
        "name_arabic":  "العلق",
        "name_bn":  "আল-আলাক",
        "meaning_bn":  "রক্তপিণ্ড",
        "revelation_place":  "makkah",
        "verses_count":  19
    },
    {
        "id":  97,
        "name_simple":  "Al-Qadr",
        "name_arabic":  "القدر",
        "name_bn":  "আল-কদর",
        "meaning_bn":  "মহিমান্বিত",
        "revelation_place":  "makkah",
        "verses_count":  5
    },
    {
        "id":  98,
        "name_simple":  "Al-Bayyinah",
        "name_arabic":  "البينة",
        "name_bn":  "আল-বাইয়্যিনাহ",
        "meaning_bn":  "প্রমাণ",
        "revelation_place":  "madinah",
        "verses_count":  8
    },
    {
        "id":  99,
        "name_simple":  "Az-Zalzalah",
        "name_arabic":  "الزلزلة",
        "name_bn":  "আজ-যালযালাহ",
        "meaning_bn":  "ভূমিকম্প",
        "revelation_place":  "madinah",
        "verses_count":  8
    },
    {
        "id":  100,
        "name_simple":  "Al-\u0027Adiyat",
        "name_arabic":  "العاديات",
        "name_bn":  "আল-আদিয়াত",
        "meaning_bn":  "অভিযানকারী",
        "revelation_place":  "makkah",
        "verses_count":  11
    },
    {
        "id":  101,
        "name_simple":  "Al-Qari\u0027ah",
        "name_arabic":  "القارعة",
        "name_bn":  "আল-কারি\u0027আহ",
        "meaning_bn":  "মহাসংকট",
        "revelation_place":  "makkah",
        "verses_count":  11
    },
    {
        "id":  102,
        "name_simple":  "At-Takathur",
        "name_arabic":  "التكاثر",
        "name_bn":  "আত-তাকাসুর",
        "meaning_bn":  "প্রাচুর্যের প্রতিযোগিতা",
        "revelation_place":  "makkah",
        "verses_count":  8
    },
    {
        "id":  103,
        "name_simple":  "Al-\u0027Asr",
        "name_arabic":  "العصر",
        "name_bn":  "আল-আসর",
        "meaning_bn":  "সময়",
        "revelation_place":  "makkah",
        "verses_count":  3
    },
    {
        "id":  104,
        "name_simple":  "Al-Humazah",
        "name_arabic":  "الهمزة",
        "name_bn":  "আল-হুমাযাহ",
        "meaning_bn":  "পরনিন্দাকারী",
        "revelation_place":  "makkah",
        "verses_count":  9
    },
    {
        "id":  105,
        "name_simple":  "Al-Fil",
        "name_arabic":  "الفيل",
        "name_bn":  "আল-ফীল",
        "meaning_bn":  "হাতি",
        "revelation_place":  "makkah",
        "verses_count":  5
    },
    {
        "id":  106,
        "name_simple":  "Quraysh",
        "name_arabic":  "قريش",
        "name_bn":  "কুরাইশ",
        "meaning_bn":  "কুরাইশ গোত্র",
        "revelation_place":  "makkah",
        "verses_count":  4
    },
    {
        "id":  107,
        "name_simple":  "Al-Ma\u0027un",
        "name_arabic":  "الماعون",
        "name_bn":  "আল-মা\u0027উন",
        "meaning_bn":  "সাহায্য সহায়তা",
        "revelation_place":  "makkah",
        "verses_count":  7
    },
    {
        "id":  108,
        "name_simple":  "Al-Kawthar",
        "name_arabic":  "الكوثر",
        "name_bn":  "আল-কাওসার",
        "meaning_bn":  "কাউসার/প্রাচুর্য",
        "revelation_place":  "makkah",
        "verses_count":  3
    },
    {
        "id":  109,
        "name_simple":  "Al-Kafirun",
        "name_arabic":  "الكافرون",
        "name_bn":  "আল-কাফিরুন",
        "meaning_bn":  "অবিশ্বাসী",
        "revelation_place":  "makkah",
        "verses_count":  6
    },
    {
        "id":  110,
        "name_simple":  "An-Nasr",
        "name_arabic":  "النصر",
        "name_bn":  "আন-নাসর",
        "meaning_bn":  "সাহায্য",
        "revelation_place":  "madinah",
        "verses_count":  3
    },
    {
        "id":  111,
        "name_simple":  "Al-Masad",
        "name_arabic":  "المسد",
        "name_bn":  "আল-লাহাব",
        "meaning_bn":  "খেজুরের পাকানো (রশি)",
        "revelation_place":  "makkah",
        "verses_count":  5
    },
    {
        "id":  112,
        "name_simple":  "Al-Ikhlas",
        "name_arabic":  "الإخلاص",
        "name_bn":  "আল-ইখলাস",
        "meaning_bn":  "আন্তরিকতা",
        "revelation_place":  "makkah",
        "verses_count":  4
    },
    {
        "id":  113,
        "name_simple":  "Al-Falaq",
        "name_arabic":  "الفلق",
        "name_bn":  "আল-ফালাক",
        "meaning_bn":  "নিশিভোর",
        "revelation_place":  "makkah",
        "verses_count":  5
    },
    {
        "id":  114,
        "name_simple":  "An-Nas",
        "name_arabic":  "الناس",
        "name_bn":  "আন-নাস",
        "meaning_bn":  "মানুষ জাতি",
        "revelation_place":  "makkah",
        "verses_count":  6
    }
];

export function getSurahById(id: number): Surah | undefined {
  return SURAHS.find((s) => s.id === id);
}
