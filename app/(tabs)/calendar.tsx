import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { StatTile } from '../../components/StatTile';
import { CalendarDayCell } from '../../components/CalendarDayCell';
import { Icon } from '../../components/Icon';
import { useColors } from '../../constants/theme';
import { useMonthlyStats, useMonthlyDayStatus, type DayStatus } from '../../lib/hooks/useMonthlyStats';
import { useDayPrayerLogs } from '../../lib/hooks/useDayPrayerLogs';
import { useT } from '../../lib/hooks/useT';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import type { WaqtName } from '../../lib/prayerTimes';

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const WAQT_ORDER: WaqtName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const WAQT_KEY: Record<WaqtName, 'waqtFajr' | 'waqtDhuhr' | 'waqtAsr' | 'waqtMaghrib' | 'waqtIsha'> = {
  fajr: 'waqtFajr',
  dhuhr: 'waqtDhuhr',
  asr: 'waqtAsr',
  maghrib: 'waqtMaghrib',
  isha: 'waqtIsha',
};

export default function CalendarScreen() {
  const { t, n, localeTag } = useT();
  const Colors = useColors();
  const tabBarHeight = useTabBarHeight();
  const DAY_STATUS_COLOR: Record<DayStatus, string> = {
    all: Colors.primary,
    some: '#facc15',
    none: '#ef4444',
  };
  const DAY_STATUS_TEXT_COLOR: Record<DayStatus, string> = {
    all: '#ffffff',
    some: '#78350f',
    none: '#ffffff',
  };
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-12

  const { data: stats } = useMonthlyStats(viewYear, viewMonth);
  const { data: dayStatus } = useMonthlyDayStatus(viewYear, viewMonth);

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1;
  const today = now.getDate();
  const [selectedDay, setSelectedDay] = useState<number | null>(isCurrentMonth ? today : null);
  const selectedDateString = selectedDay
    ? `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const { completed: selectedDayCompleted } = useDayPrayerLogs(selectedDateString);
  const selectedDateLabel = selectedDay
    ? new Date(viewYear, viewMonth - 1, selectedDay).toLocaleDateString(localeTag, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstWeekday = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7; // 0=Mon
  const prevMonthDays = daysInMonth(viewYear, viewMonth - 1 === 0 ? 12 : viewMonth - 1);
  const leadingFaded = Array.from({ length: firstWeekday }, (_, i) => prevMonthDays - firstWeekday + i + 1);

  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString(localeTag, {
    month: 'long',
    year: 'numeric',
  });
  // Mon-first weekday short labels, locale-aware (2026-06-01 is a Monday).
  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    new Date(2026, 5, 1 + i).toLocaleDateString(localeTag, { weekday: 'short' })
  );

  const goPrev = () => {
    setSelectedDay(null);
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    setSelectedDay(null);
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('tabCalendar')} />
      <ScrollView className="flex-1 px-container-margin" contentContainerStyle={{ paddingBottom: tabBarHeight + 16, paddingTop: 12 }}>
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={goPrev} hitSlop={8}>
            <Icon name="chevron_left" color={Colors.onSurfaceVariant} />
          </Pressable>
          <Text className="text-[18px] font-bold text-on-surface">{monthLabel}</Text>
          <Pressable onPress={goNext} hitSlop={8}>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View className="bg-surface-container-lowest rounded-xl p-4 shadow-sm mb-6 border border-surface-container-low">
          <View className="flex-row mb-3">
            {weekdayLabels.map((d, i) => (
              <Text key={i} className="flex-1 text-center text-[12px] font-bold text-on-surface-variant opacity-60">
                {d}
              </Text>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {leadingFaded.map((d, i) => (
              <View key={`lead-${i}`} style={{ width: `${100 / 7}%` }}>
                <CalendarDayCell day={n(d)} faded />
              </View>
            ))}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
              <View key={day} style={{ width: `${100 / 7}%` }}>
                <CalendarDayCell
                  day={n(day)}
                  isToday={isCurrentMonth && day === today}
                  isSelected={selectedDay === day}
                  dotColor={dayStatus?.[day] ? DAY_STATUS_COLOR[dayStatus[day].status] : undefined}
                  dotTextColor={dayStatus?.[day] ? DAY_STATUS_TEXT_COLOR[dayStatus[day].status] : undefined}
                  isPremium={dayStatus?.[day]?.status === 'all' && !!dayStatus[day].quranDone}
                  onPress={() => setSelectedDay(day)}
                />
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row gap-3 mb-6 items-stretch">
          {selectedDateLabel ? (
            <View className="flex-1 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-low">
              <Text className="text-[14px] font-bold text-on-surface mb-3">{selectedDateLabel}</Text>
              <View className="gap-2">
                {WAQT_ORDER.map((waqt) => (
                  <View key={waqt} className="flex-row items-center gap-3">
                    <Icon
                      name={selectedDayCompleted[waqt] ? 'check_circle' : 'radio_button_unchecked'}
                      filled={selectedDayCompleted[waqt]}
                      size={18}
                      color={selectedDayCompleted[waqt] ? Colors.primary : Colors.outlineVariant}
                    />
                    <Text
                      className={`text-[14px] ${selectedDayCompleted[waqt] ? 'text-on-surface' : 'text-on-surface-variant'}`}
                    >
                      {t(WAQT_KEY[waqt])}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View className="flex-1 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-low gap-2">
            <Text className="text-[14px] font-bold text-on-surface mb-1">{t('legend')}</Text>
            <View className="flex-row items-center gap-3">
              <View className="w-2.5 h-2.5 rounded-full bg-primary" />
              <Text className="text-[12px] text-on-surface-variant flex-1">{t('legendAll')}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#facc15' }} />
              <Text className="text-[12px] text-on-surface-variant flex-1">{t('legendSome')}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <Text className="text-[12px] text-on-surface-variant flex-1">{t('legendNone')}</Text>
            </View>
          </View>
        </View>

        <Text className="text-[18px] font-bold text-on-surface mb-4">{t('thisMonth')}</Text>
        <View className="flex-row flex-wrap justify-between">
          <View style={{ width: '48%', marginBottom: 16 }}>
            <StatTile label={t('prayersDoneStat')} value={n(stats?.prayersDone ?? 0)} icon="check_circle" iconColor={Colors.primary} />
          </View>
          <View style={{ width: '48%', marginBottom: 16 }}>
            <StatTile label={t('bestStreak')} value={n(stats?.bestStreak ?? 0)} icon="local_fire_department" iconColor="#f97316" />
          </View>
          <View style={{ width: '48%', marginBottom: 16 }}>
            <StatTile label={t('daysTracked')} value={n(stats?.daysTracked ?? 0)} icon="visibility" iconColor={Colors.secondary} />
          </View>
          <View style={{ width: '48%', marginBottom: 16 }}>
            <StatTile label={t('monthProgress')} value={`${n(stats?.monthProgress ?? 0)}%`} icon="analytics" emphasis />
          </View>
          <View style={{ width: '48%', marginBottom: 16 }}>
            <StatTile label={t('quranDaysStat')} value={n(stats?.quranDays ?? 0)} icon="menu_book" iconColor="#D4AF37" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
