export type Locale = 'bn' | 'en';

const en = {
  // Splash
  splashTagline: 'Together in Deen',
  login: 'Login',
  createAccount: 'Create Account',

  // Auth
  welcomeBack: 'Welcome back',
  signInSubtitle: 'Sign in to DeenTogether',
  emailPlaceholder: 'Email',
  passwordPlaceholder: 'Password',
  signingIn: 'Signing in…',
  noAccountPrompt: "Don't have an account? Create one",
  createYourAccount: 'Create your account',
  joinSubtitle: 'Join DeenTogether',
  fullNamePlaceholder: 'Full name',
  creatingAccount: 'Creating…',
  haveAccountPrompt: 'Already have an account? Log in',
  checkEmailTitle: 'Check your email',
  checkEmailBody: 'We sent a confirmation link to {{email}}. Confirm your email, then log in.',
  backToLogin: 'Back to Login',

  // Tabs
  tabHome: 'Home',
  tabCalendar: 'Calendar',
  tabDua: 'Dua',
  tabFamily: 'Family',
  tabProfile: 'Profile',

  // Location picker
  locationTitle: 'Location',
  useGpsLocation: 'Use My Current Location (GPS)',
  orSelectCity: 'Or select a district',
  searchCityPlaceholder: 'Search district…',
  noDistrictsFound: 'No districts found.',
  currentLocationLabel: 'Current Location',

  // Dua tab
  duaTitle: 'Dua',
  meaning: 'Meaning',

  // Profile theme
  darkMode: 'Dark Mode',

  // Home
  greeting: 'Assalamu Alaikum 👋',
  locationNeeded: 'Location access needed',
  locationErrorTitle: "Couldn't get your location",
  findingLocation: 'Finding your location…',
  locationExplainer: 'DeenTogether uses your location to calculate accurate prayer times for your area.',
  sunrise: 'Sunrise',
  sunset: 'Sunset',
  endsIn: '{{waqt}} ends in',
  left: 'left',
  jumuahNote: "(Jumu'ah on Fri)",
  dislikedTimes: 'Prohibited (Makruh) Times',
  prohibitedTimesNote:
    'Praying exactly at sunrise, sunset, and solar noon (istiwa) is completely prohibited (haram / makruh tahrimi).',
  ishaMakruhNote: 'Delaying Isha past Moddhorat ({{time}}) is Makruh — pray before then if possible.',
  todaysProgress: "Today's Progress",
  dailyStreak: 'Daily Streak: {{count}} 🔥',
  prayersDoneCount: '{{done}} of {{total}}',
  prayersDoneLabel: 'Prayers done',
  familyStatus: 'Family Status',
  viewAll: 'View All',
  noFamilyYetHome: 'No family yet — tap to create or join one.',
  noOtherMembers: 'No other family members yet.',

  // Today
  todayTitle: 'Today',
  greatProgress: 'Great Progress!',
  keepGoing: 'Keep Going!',
  prayersCompletedOf: '{{count}} of 5 prayers completed.',
  done: 'Done',
  savedInstantly: 'Taps save instantly — synced with your family.',
  locationNeededToday: 'Location access needed to show prayer times.',

  // Calendar
  legend: 'Legend',
  legendAll: 'All prayers completed',
  legendSome: 'Some prayers completed',
  legendNone: 'No prayers completed',
  thisMonth: 'This Month',
  prayersDoneStat: 'Prayers Done',
  bestStreak: 'Best Streak',
  daysTracked: 'Days Tracked',
  monthProgress: 'Month Progress',

  // Family
  myFamilyTitle: 'My Family',
  startCircleTitle: 'Start your family circle',
  startCircleSubtitle: 'Create a family to track prayers together, or join one with an invite code.',
  familyNamePlaceholder: 'Family name (e.g. The Rahmans)',
  createFamilyButton: 'Create Family',
  haveInviteCode: 'Have an invite code? Join a family',
  inviteMember: 'Invite Member',
  shareCodeSubtitle: 'Share code to join your prayer circle.',
  copyCodeInstead: 'Copy code instead',
  codeCopied: 'Code copied to clipboard',
  membersCount: 'Members ({{count}})',
  active: 'Active',
  joinAnotherFamily: 'Join Another Family',
  leaveThisFamily: 'Leave This Family',
  youSuffix: '(You)',
  familyAdmin: 'Family Admin',
  memberRole: 'Member',
  todayLabel: 'Today',
  shareInviteMessage: 'Join my family on DeenTogether! Use invite code: {{code}}',

  // Join family
  joinFamilyTitle: 'Join Family',
  enterCodeSubtitle: 'Enter the invite code a family member shared with you.',
  joinFamilyButton: 'Join Family',
  joiningFamily: 'Joining…',

  // Profile
  profileTitle: 'Profile',
  prayerCalcMethod: 'Prayer Calculation Method',
  madhabLabel: 'Madhab',
  notificationSettings: 'Notification Settings',
  languageLabel: 'Language',
  privacyPolicy: 'Privacy Policy',
  logOut: 'Log out',
  languageBangla: 'বাংলা',
  languageEnglish: 'English',
  chooseAvatarTitle: 'Choose Avatar',
  avatarMaleSection: 'Male',
  avatarFemaleSection: 'Female',

  // Waqt names
  waqtFajr: 'Fajr',
  waqtDhuhr: 'Dhuhr',
  waqtAsr: 'Asr',
  waqtMaghrib: 'Maghrib',
  waqtIsha: 'Isha',

  // Makruh window labels
  makruhSunrise: 'Sunrise',
  makruhIstiwa: 'Midday (Istiwa)',
  makruhSunset: 'Sunset',

  // Sahri/Iftar strip
  todaysSahri: "Today's Sahri",
  nextSahri: 'Next Sahri',
  todaysIftar: "Today's Iftar",
  nextIftar: 'Next Iftar',
  sahriTimeLeft: 'Sahri time left',
  iftarTimeLeft: 'Iftar time left',
};

const bn: typeof en = {
  splashTagline: 'দ্বীনে একসাথে',
  login: 'লগইন',
  createAccount: 'অ্যাকাউন্ট তৈরি করুন',

  welcomeBack: 'স্বাগতম',
  signInSubtitle: 'DeenTogether এ সাইন ইন করুন',
  emailPlaceholder: 'ইমেইল',
  passwordPlaceholder: 'পাসওয়ার্ড',
  signingIn: 'সাইন ইন হচ্ছে…',
  noAccountPrompt: 'অ্যাকাউন্ট নেই? তৈরি করুন',
  createYourAccount: 'আপনার অ্যাকাউন্ট তৈরি করুন',
  joinSubtitle: 'DeenTogether এ যোগ দিন',
  fullNamePlaceholder: 'পূর্ণ নাম',
  creatingAccount: 'তৈরি হচ্ছে…',
  haveAccountPrompt: 'অ্যাকাউন্ট আছে? লগ ইন করুন',
  checkEmailTitle: 'আপনার ইমেইল চেক করুন',
  checkEmailBody: 'আমরা {{email}} এ একটি নিশ্চিতকরণ লিংক পাঠিয়েছি। ইমেইল নিশ্চিত করে লগ ইন করুন।',
  backToLogin: 'লগইনে ফিরে যান',

  tabHome: 'হোম',
  tabCalendar: 'ক্যালেন্ডার',
  tabDua: 'দোয়া',
  tabFamily: 'পরিবার',
  tabProfile: 'প্রোফাইল',

  locationTitle: 'লোকেশন',
  useGpsLocation: 'আমার বর্তমান অবস্থান ব্যবহার করুন (GPS)',
  orSelectCity: 'অথবা একটি জেলা নির্বাচন করুন',
  searchCityPlaceholder: 'জেলা খুঁজুন…',
  noDistrictsFound: 'কোনো জেলা পাওয়া যায়নি।',
  currentLocationLabel: 'বর্তমান অবস্থান',

  duaTitle: 'দোয়া',
  meaning: 'অর্থ',

  darkMode: 'ডার্ক মোড',

  greeting: 'আসসালামু আলাইকুম 👋',
  locationNeeded: 'লোকেশন অ্যাক্সেস প্রয়োজন',
  locationErrorTitle: 'আপনার অবস্থান পাওয়া যায়নি',
  findingLocation: 'আপনার অবস্থান খোঁজা হচ্ছে…',
  locationExplainer: 'আপনার এলাকার সঠিক নামাজের সময় হিসাব করতে DeenTogether আপনার অবস্থান ব্যবহার করে।',
  sunrise: 'সূর্যোদয়',
  sunset: 'সূর্যাস্ত',
  endsIn: '{{waqt}} শেষ হতে বাকি',
  left: 'বাকি',
  jumuahNote: '(শুক্রবার জুমুআ)',
  dislikedTimes: 'নিষিদ্ধ (মাকরুহ) সময়',
  prohibitedTimesNote:
    'সূর্যোদয়, সূর্যাস্ত এবং দ্বিপ্রহরের (ইস্তিওয়া) সময় নামাজ পড়া সম্পূর্ণ নিষিদ্ধ (হারাম বা মাকরুহ তাহরিমি)।',
  ishaMakruhNote: 'মধ্যরাত ({{time}}) এর পর ইশা বিলম্ব করা মাকরুহ — সম্ভব হলে তার আগেই আদায় করুন।',
  todaysProgress: 'আজকের অগ্রগতি',
  dailyStreak: 'দৈনিক ধারাবাহিকতা: {{count}} 🔥',
  prayersDoneCount: '{{total}} এর মধ্যে {{done}}',
  prayersDoneLabel: 'নামাজ সম্পন্ন',
  familyStatus: 'পরিবারের অবস্থা',
  viewAll: 'সব দেখুন',
  noFamilyYetHome: 'এখনো কোনো পরিবার নেই — তৈরি বা যোগ দিতে ট্যাপ করুন।',
  noOtherMembers: 'এখনো অন্য কোনো পরিবার সদস্য নেই।',

  todayTitle: 'আজ',
  greatProgress: 'চমৎকার অগ্রগতি!',
  keepGoing: 'চালিয়ে যান!',
  prayersCompletedOf: '৫টির মধ্যে {{count}}টি নামাজ সম্পন্ন হয়েছে।',
  done: 'সম্পন্ন',
  savedInstantly: 'ট্যাপ সাথে সাথে সংরক্ষিত হয় — আপনার পরিবারের সাথে সিঙ্ক করা।',
  locationNeededToday: 'নামাজের সময় দেখাতে লোকেশন অ্যাক্সেস প্রয়োজন।',

  legend: 'সূচক',
  legendAll: 'সব নামাজ সম্পন্ন',
  legendSome: 'কিছু নামাজ সম্পন্ন',
  legendNone: 'কোনো নামাজ সম্পন্ন হয়নি',
  thisMonth: 'এই মাস',
  prayersDoneStat: 'সম্পন্ন নামাজ',
  bestStreak: 'সেরা ধারাবাহিকতা',
  daysTracked: 'ট্র্যাক করা দিন',
  monthProgress: 'মাসের অগ্রগতি',

  myFamilyTitle: 'আমার পরিবার',
  startCircleTitle: 'আপনার পরিবার বৃত্ত শুরু করুন',
  startCircleSubtitle: 'একসাথে নামাজ ট্র্যাক করতে একটি পরিবার তৈরি করুন, অথবা আমন্ত্রণ কোড দিয়ে যোগ দিন।',
  familyNamePlaceholder: 'পরিবারের নাম (যেমনঃ রহমান পরিবার)',
  createFamilyButton: 'পরিবার তৈরি করুন',
  haveInviteCode: 'আমন্ত্রণ কোড আছে? পরিবারে যোগ দিন',
  inviteMember: 'সদস্য আমন্ত্রণ করুন',
  shareCodeSubtitle: 'আপনার নামাজ বৃত্তে যোগ দিতে কোড শেয়ার করুন।',
  copyCodeInstead: 'পরিবর্তে কোড কপি করুন',
  codeCopied: 'কোড ক্লিপবোর্ডে কপি হয়েছে',
  membersCount: 'সদস্য ({{count}})',
  active: 'সক্রিয়',
  joinAnotherFamily: 'অন্য পরিবারে যোগ দিন',
  leaveThisFamily: 'এই পরিবার ত্যাগ করুন',
  youSuffix: '(আপনি)',
  familyAdmin: 'পরিবার অ্যাডমিন',
  memberRole: 'সদস্য',
  todayLabel: 'আজ',
  shareInviteMessage: 'DeenTogether এ আমার পরিবারে যোগ দিন! আমন্ত্রণ কোড ব্যবহার করুনঃ {{code}}',

  joinFamilyTitle: 'পরিবারে যোগ দিন',
  enterCodeSubtitle: 'একজন পরিবার সদস্যের দেওয়া আমন্ত্রণ কোড লিখুন।',
  joinFamilyButton: 'পরিবারে যোগ দিন',
  joiningFamily: 'যোগ দেওয়া হচ্ছে…',

  profileTitle: 'প্রোফাইল',
  prayerCalcMethod: 'নামাজের সময় গণনা পদ্ধতি',
  madhabLabel: 'মাযহাব',
  notificationSettings: 'নোটিফিকেশন সেটিংস',
  languageLabel: 'ভাষা',
  privacyPolicy: 'গোপনীয়তা নীতি',
  logOut: 'লগ আউট',
  languageBangla: 'বাংলা',
  languageEnglish: 'English',
  chooseAvatarTitle: 'অ্যাভাটার বাছাই করুন',
  avatarMaleSection: 'পুরুষ',
  avatarFemaleSection: 'মহিলা',

  waqtFajr: 'ফজর',
  waqtDhuhr: 'যুহর',
  waqtAsr: 'আসর',
  waqtMaghrib: 'মাগরিব',
  waqtIsha: 'ইশা',

  makruhSunrise: 'সূর্যোদয়',
  makruhIstiwa: 'মধ্যাহ্ন (ইস্তিওয়া)',
  makruhSunset: 'সূর্যাস্ত',

  todaysSahri: 'আজকের সাহরি',
  nextSahri: 'পরবর্তী সাহরি',
  todaysIftar: 'আজকের ইফতার',
  nextIftar: 'পরবর্তী ইফতার',
  sahriTimeLeft: 'সাহরির বাকি',
  iftarTimeLeft: 'ইফতারের বাকি',
};

export const translations = { en, bn };
export type TranslationKey = keyof typeof en;

export function translate(locale: Locale, key: TranslationKey, vars?: Record<string, string | number>): string {
  let str: string = translations[locale][key] ?? translations.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    }
  }
  return str;
}
