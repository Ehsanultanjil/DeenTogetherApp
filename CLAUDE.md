@AGENTS.md

# DeenTogether - Project Documentation & Developer Guide

## 1. Project Overview
**DeenTogether** is an offline-first Islamic prayer companion and family circle app built with React Native and Expo (SDK 54). It allows users and families to stay consistent with their daily prayers (Salah), Quran recitation, and spiritual goals.

### Key Capabilities
- **Accurate Prayer Times**: Powered by `adhan` with customizable calculation methods (default: Karachi) and Madhab juristic settings (Hanafi / Shafi'i).
- **Bangladesh-First Location Support**: Full 64-district coordinates database with offline district selection and GPS auto-detection + reverse geocoding fallback.
- **Offline-First Synchronization**: Optimistic local updates with a persistent mutation queue (`useSyncQueueStore`) that syncs to Supabase on reconnect/resume.
- **Family Circles**: Create or join family groups via 6-character invite codes, share real-time prayer completion grids, and send prayer reminders.
- **Gender & Period Pause System**: Specialized menses pause system for female users to pause prayer requirements, protect streaks, and silence alarms.
- **Daily Deeds & Hadith**: Daily Hadith popup at Fajr start, daily Quran recitation logging, and Duha prayer tracking.
- **Multi-language Support**: Full English and Bengali (`bn`) localization.

---

## 2. Technology Stack & Versions
- **Framework**: Expo SDK 54 (`~54.0.36`), Expo Router (`~6.0.24`)
- **Runtime**: React Native `0.81.5`, React `19.1.0`
- **Language**: TypeScript `~5.9.2` (strict mode enabled)
- **Styling**: NativeWind `^4.2.6` (Tailwind CSS `v3.4.19`) with custom theme tokens
- **State Management**: Zustand `^5.0.14` (persisted stores via AsyncStorage)
- **Data Caching & Fetching**: `@tanstack/react-query` `^5.101.4` with AsyncStorage persister
- **Backend & Database**: Supabase (`@supabase/supabase-js` `^2.110.7`, PostgreSQL, Row-Level Security, Edge Functions)
- **Prayer Computations**: `adhan` `^4.4.4`, `tz-lookup` `^6.1.25`
- **Notifications**: `expo-notifications` `~0.32.17`

---

## 3. Environment & Prerequisites

### Required Environment Variables (`.env`)
Create a `.env` file in the project root based on `.env.example`:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
*Note: The app will fail to mount if these variables are missing.*

### Local Machine Paths (Windows)
When running commands in new shells or automation tasks, ensure Node.js and Git are present in `PATH`:
- Node.js: `C:\Users\ehsan\AppData\Local\Programs\nodejs`
- Git: `C:\Users\ehsan\AppData\Local\Programs\Git\cmd`

---

## 4. Common Commands

### Development
- **Start Expo dev server**: `npm run start` (or `npx expo start`)
- **Start Web dev server**: `npm run web` (or `npx expo start --web`)
- **Run Android**: `npm run android`
- **Run iOS**: `npm run ios`

### Local Native Android Build & USB Install
- **Build Standalone Release APK (Fully Offline, Self-Contained, No Metro)**:
  ```powershell
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.21.9-hotspot"
  $env:ANDROID_HOME = "C:\Users\ehsan\AppData\Local\Android\Sdk"
  $env:Path = "C:\Program Files\Eclipse Adoptium\jdk-17.0.21.9-hotspot\bin;$env:ANDROID_HOME\platform-tools;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  cd android
  .\gradlew.bat assembleRelease
  ```
  Output APK location: `android/app/build/outputs/apk/release/app-release.apk`
- **Build Debug APK locally**:
  ```powershell
  cd android; .\gradlew.bat assembleDebug
  ```
  Output APK location: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Install directly onto connected device via ADB**:
  ```powershell
  adb install -r android/app/build/outputs/apk/release/app-release.apk
  ```
- **Launch app on device**:
  ```powershell
  adb shell monkey -p com.deentogether.app -c android.intent.category.LAUNCHER 1
  ```
- **Run with Expo CLI**: `npm run android` (or `npx expo run:android`)

### Quality & Type Checking
- **TypeScript Typecheck**:
  ```bash
  npx tsc --noEmit
  ```
- **Export / Bundler Build Verification**:
  ```bash
  npx expo export --platform web
  ```

### EAS Builds
- **Development build**: `eas build --profile development --platform android`
- **Preview APK**: `eas build --profile preview --platform android`
- **Production app bundle**: `eas build --profile production --platform android`

---

## 5. Architecture & Codebase Structure

```
DeenTogetherApp/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout: font loading, auth router, QueryClient persister
│   ├── index.tsx               # Redirect to (tabs) (guest-first browsing)
│   ├── login.tsx               # Dedicated login modal screen (Google OAuth & Email/Password)
│   ├── today.tsx               # Standalone prayer timeline view
│   ├── month-stats.tsx         # Monthly statistics view
│   ├── (tabs)/                 # Main authenticated bottom tab navigation
│   │   ├── _layout.tsx         # Animated custom tab bar container
│   │   ├── index.tsx           # Home dashboard (Prayer times, Sahri/Iftar countdown, Hadith)
│   │   ├── calendar.tsx        # Month grid calendar & prayer completion history
│   │   ├── family.tsx          # Family circles, member grid, join requests, invite codes
│   │   ├── dua.tsx             # Daily Duas collection with Arabic, transliteration, Bengali/English
│   │   └── profile.tsx         # User profile, avatar picker, and settings links
│   ├── onboarding/             # New user onboarding flow
│   │   ├── language.tsx        # Language picker (English / Bengali)
│   │   ├── name.tsx            # Name input
│   │   ├── gender.tsx          # Gender selection (Male / Female)
│   │   ├── avatar.tsx          # Preset avatar picker
│   │   ├── madhab.tsx          # Madhab selection (Hanafi / Shafi'i)
│   │   └── theme.tsx           # Theme selection (Light / Dark / System)
│   ├── family/                 # Family circle secondary screens
│   │   ├── join.tsx            # Join circle via invite code
│   │   └── member-calendar.tsx # View individual family member's prayer log calendar
│   └── profile/                # Profile sub-settings screens
│       ├── namaj.tsx           # Prayer calculation method, madhab, safety margin, period pause
│       ├── settings.tsx        # App settings, notifications, password, account deletion
│       ├── theme.tsx           # Theme preference toggle
│       └── language.tsx        # App language selection
├── components/                 # Reusable UI components & modals
│   ├── AnimatedTabBar.tsx      # Custom floating/bottom animated tab bar
│   ├── CalendarDayCell.tsx     # Calendar day grid cell with completion dots
│   ├── DailyHadithPopup.tsx    # Fajr-triggered daily hadith modal
│   ├── FamilyMemberPrayerCard.tsx # Member status card with prayer pills
│   ├── HomePrayerTimeline.tsx  # Dynamic prayer circle & timeline card
│   ├── LocationPicker.tsx      # GPS vs manual Bangladesh district selector
│   ├── SahriIftarCountdownRow.tsx # Fasting countdown timer (Sahri/Iftar)
│   └── ...
├── constants/                  # Static constants, design tokens, avatar assets
│   ├── avatarPresets.ts        # Male & female avatar definitions
│   ├── theme.ts                # Color palette (Material 3 inspired emerald theme)
│   └── waqt.ts                 # Waqt order, icons, and localized labels
├── lib/                        # Business logic, helpers, and domain services
│   ├── auth/                   # Google Sign-In helper (`googleSignIn.ts`)
│   ├── hooks/                  # React Query & utility hooks (`usePrayerTimes`, `useFamily`, etc.)
│   ├── i18n/                   # Localized strings (`translations.ts`, `format.ts`)
│   ├── notifications/          # Local push notifications scheduler (`config.ts`)
│   ├── sync/                   # Offline-first queue & sync engine (`syncEngine.ts`, `runOrQueue.ts`)
│   ├── bangladeshDistricts.ts  # 64 Bangladesh districts geo coordinates & nearest calculation
│   ├── database.types.ts       # Generated Supabase TypeScript types
│   ├── prayerTimes.ts          # Core Adhan calculation wrapper, makruh windows, Duha
│   └── supabase.ts             # Supabase client instantiation
├── store/                      # Zustand client stores
│   ├── useAuthStore.ts         # User auth session & initialization state
│   ├── useLocaleStore.ts       # Language preference ('en' | 'bn')
│   ├── useThemeStore.ts        # Theme preference ('light' | 'dark' | 'system')
│   ├── useLocationPreferenceStore.ts # Manual district vs GPS mode
│   ├── useLocationStore.ts     # Current latitude, longitude, and district info
│   ├── useSyncQueueStore.ts    # Persistent offline mutation queue
│   └── useSyncStatusStore.ts   # Sync state indicator ('idle' | 'syncing' | 'synced' | 'offline')
└── supabase/                   # Supabase database configuration & migrations
    ├── config.toml             # Local Supabase CLI configuration
    ├── functions/              # Edge Functions (`delete-account`, `send-reminder`)
    └── migrations/             # SQL migrations (0001_init.sql through 0021_gender_and_period_pause.sql)
```

---

## 6. Critical Architectural Principles

### 1. Expo SDK 54 Rule
- The project is pinned to **Expo SDK 54**. Always consult https://docs.expo.dev/versions/v54.0.0/ before adopting new APIs or configuration keys.
- Do not install packages incompatible with React Native `0.81.5` or React `19.1.0`.

### 2. Guest-First Navigation & Centralized Auth
- **Guest-First Browsing**: Unauthenticated users can view and use the entire app UI (prayer times on Home, Sahri/Iftar countdown, Duas, Calendar, and local settings) without being blocked by a mandatory login screen.
- **Dedicated Login Screen**: `app/login.tsx` is an accessible modal screen for Google and Email/Password sign-in. Root `/` (`app/index.tsx`) redirects to `/(tabs)`.
- **Login-Required Indicators**: Actions that require an account (logging prayers, Quran tracking, joining/creating family circles, personal stats) display lock/login badges and open `LoginPromptModal` or `/login` when tapped.
- **Persistent Offline Sessions**: `useAuthStore` persists user sessions to `AsyncStorage`. When launching offline or during transient token refresh failures, the cached session is preserved rather than wiped, preventing logged-in users from being kicked out when they have no internet connection.

### 3. Offline-First Mutation Pattern
- State-modifying actions (prayer toggling, Quran logging, profile updates, settings updates) must use `runOrQueue()` (`lib/sync/runOrQueue.ts`).
- If an action fails due to network unavailability (`looksLikeNetworkError`), it is automatically saved to the persistent queue (`useSyncQueueStore`).
- On app resume, reconnection, or startup, `syncEngine.runSync()` automatically drains the queue FIFO.

### 4. Prayer & Location Timezone Handling
- Never rely solely on device wall-clock time for prayer calculations when user coordinates may differ from device timezone.
- `lib/prayerTimes.ts` uses `tz-lookup` to determine the precise IANA timezone of the calculated coordinates and formats `prayer_date` accordingly (`YYYY-MM-DD`).
- **Carryover Window**: Between midnight (12:00 AM) and Fajr, prayer logs correspond to the previous day's prayer cycle to ensure late night / Tahajjud / Isha verification does not reset prematurely.

### 5. Period Pause (Female Menses System)
- Female users have access to a Period Pause toggle in Prayer Settings (`app/profile/namaj.tsx`).
- When active, prayer cards display pause status, push notifications for prayer alarms are disabled, and prayer completion streaks are frozen/protected.

---

## 7. Guidelines for Agents & Contributors
1. **Verification**: Always run `npx tsc --noEmit` after changing TypeScript files to verify type correctness.
2. **Component Conventions**:
   - Use custom `<Text>` from `components/Text.tsx` instead of React Native's default to maintain typography and font family mappings.
   - Use `useColors()` from `constants/theme.ts` for dynamic light/dark theme colors.
   - Use `useT()` from `lib/hooks/useT.ts` for localized text and formatted numbers.
3. **Safe Area & Layout**:
   - Bottom tab screens must account for `useTabBarHeight()` + padding to prevent floating tab bar overlaps.
   - Top screens must incorporate `useSafeAreaInsets()` for status bar padding.
