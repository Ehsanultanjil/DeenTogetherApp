import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../components/Text';
import { useRouter } from 'expo-router';
import { TopAppBar } from '../components/TopAppBar';
import { ProgressRing } from '../components/ProgressRing';
import { PrayerCard } from '../components/PrayerCard';
import { Icon } from '../components/Icon';
import { useColors } from '../constants/theme';
import { usePrayerTimes } from '../lib/hooks/usePrayerTimes';
import { useClockTick } from '../lib/hooks/useClockTick';
import { usePrayerSettings } from '../lib/hooks/usePrayerSettings';
import { useTodayPrayerLogs, useIshaCarryover } from '../lib/hooks/usePrayerLogs';
import { useTodayQuranLog } from '../lib/hooks/useQuranLog';
import { useT } from '../lib/hooks/useT';
import { formatTime, locationDateString, type WaqtName } from '../lib/prayerTimes';
import type { MaterialSymbolName } from '../constants/materialSymbols';

const WAQT_ICON: Record<WaqtName, MaterialSymbolName> = {
  fajr: 'wb_twilight',
  dhuhr: 'sunny',
  asr: 'sunny',
  maghrib: 'wb_sunny',
  isha: 'bedtime',
};

const WAQT_KEY: Record<WaqtName, 'waqtFajr' | 'waqtDhuhr' | 'waqtAsr' | 'waqtMaghrib' | 'waqtIsha'> = {
  fajr: 'waqtFajr',
  dhuhr: 'waqtDhuhr',
  asr: 'waqtAsr',
  maghrib: 'waqtMaghrib',
  isha: 'waqtIsha',
};

export default function TodayPrayers() {
  const router = useRouter();
  const { t, n, localeTag } = useT();
  const Colors = useColors();
  const { settings } = usePrayerSettings();
  const { times, locationStatus, ishaDateString } = usePrayerTimes(settings);
  const now = useClockTick(60_000);
  const dateString = times ? locationDateString(times.timeZone, now) : null;
  const { completed, toggle } = useTodayPrayerLogs(dateString);
  const ishaCarryover = useIshaCarryover(ishaDateString);
  const { completed: quranCompleted, toggle: toggleQuran } = useTodayQuranLog(dateString);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const percentage = Math.round((completedCount / 5) * 100);

  if (!times) {
    return (
      <View className="flex-1 bg-surface">
        <TopAppBar title={t('todayTitle')} showBack />
        <View className="flex-1 items-center justify-center px-gutter">
          <Icon name="info" size={32} color={Colors.onSurfaceVariant} />
          <Text className="text-[14px] text-on-surface-variant mt-3 text-center">
            {locationStatus === 'denied' ? t('locationNeededToday') : t('findingLocation')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar
        title={t('todayTitle')}
        showBack
        dateText={now.toLocaleDateString(localeTag, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: times.timeZone,
        })}
      />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 48, paddingTop: 16 }}>
        <View className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-variant flex-row items-center gap-6 mb-6">
          <ProgressRing size={80} strokeWidth={8} progress={percentage}>
            <Text className="text-[18px] font-bold text-primary">{n(percentage)}%</Text>
          </ProgressRing>
          <View className="flex-1">
            <Text className="text-[18px] font-bold text-on-surface">
              {percentage >= 80 ? t('greatProgress') : t('keepGoing')}
            </Text>
            <Text className="text-[14px] text-on-surface-variant">
              {t('prayersCompletedOf', { count: n(completedCount) })}
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {times.windows.map((w) => {
            const isCarryoverIsha = w.name === 'isha' && !!ishaDateString;
            const isDone = isCarryoverIsha ? ishaCarryover.completed : completed[w.name];
            return (
              <PrayerCard
                key={w.name}
                name={t(WAQT_KEY[w.name])}
                timeRange={`${formatTime(w.start, times.timeZone, localeTag)} – ${formatTime(w.end, times.timeZone, localeTag)}`}
                completed={isDone}
                icon={WAQT_ICON[w.name]}
                onToggle={() => (isCarryoverIsha ? ishaCarryover.toggle(!isDone) : toggle(w.name, !isDone))}
                disabled={now < w.start}
              />
            );
          })}
        </View>

        <View className="mt-3">
          <PrayerCard
            name={t('readQuranToday')}
            timeRange={t('quranAnytimeLabel')}
            completed={quranCompleted}
            icon="menu_book"
            onToggle={() => toggleQuran(!quranCompleted)}
          />
        </View>

        <View className="mt-8">
          <Pressable
            onPress={() => router.back()}
            className="w-full h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-90"
          >
            <Text className="text-on-primary font-bold text-[16px]">{t('done')}</Text>
          </Pressable>
          <Text className="text-center text-[12px] text-on-surface-variant mt-4">{t('savedInstantly')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}
