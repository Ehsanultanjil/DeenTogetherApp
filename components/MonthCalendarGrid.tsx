import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from './Text';
import { TopAppBar } from './TopAppBar';
import { CalendarDayCell } from './CalendarDayCell';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { useMonthlyDayStatus, type DayStatus } from '../lib/hooks/useMonthlyStats';
import { useDayPrayerLogs } from '../lib/hooks/useDayPrayerLogs';
import { useOwnGender, usePeriodPause, useAllPeriodPauses, isDateStringInAnyPause } from '../lib/hooks/usePeriodPause';
import { useT } from '../lib/hooks/useT';
import { WAQT_ORDER, waqtDisplayKey } from '../constants/waqt';

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

type Props = {
  title: string;
  // Omitted = the signed-in user's own calendar; set = a read-only view of
  // a family member's (see app/family/member-calendar.tsx).
  targetUserId?: string;
  // The personal Calendar tab sits under the tab bar and needs its height
  // added to the scroll padding; the member view is a plain stack screen
  // and doesn't.
  contentPaddingBottom: number;
  onSeeMonthStats: (year: number, month: number) => void;
};

// Shared by app/(tabs)/calendar.tsx and app/family/member-calendar.tsx —
// previously ~200 lines duplicated line-for-line between the two (down to
// the same off-scale paddingTop and hardcoded status colors in both).
export function MonthCalendarGrid({ title, targetUserId, contentPaddingBottom, onSeeMonthStats }: Props) {
  const { t, n, localeTag } = useT();
  const Colors = useColors();
  const DAY_STATUS_COLOR: Record<DayStatus, string> = {
    all: Colors.primary,
    some: '#facc15',
    none: '#ef4444',
    excused: Colors.outlineVariant,
  };
  const DAY_STATUS_TEXT_COLOR: Record<DayStatus, string> = {
    all: '#ffffff',
    some: '#78350f',
    none: '#ffffff',
    excused: Colors.onSurfaceVariant,
  };
  // Period pause is private, self-only data (see usePeriodPause.ts) — never
  // fetched/applied when viewing a family member's calendar.
  const isOwnCalendar = !targetUserId;
  const ownGender = useOwnGender();
  const { isPaused, startPause, endPause } = usePeriodPause();
  const { data: allPauses } = useAllPeriodPauses();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1); // 1-12

  const {
    data: dayStatus,
    isError: dayStatusErrored,
    refetch: refetchDayStatus,
  } = useMonthlyDayStatus(viewYear, viewMonth, targetUserId);

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1;
  const today = now.getDate();
  const [selectedDay, setSelectedDay] = useState<number | null>(isCurrentMonth ? today : null);
  const selectedDateString = selectedDay
    ? `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const { completed: selectedDayCompleted } = useDayPrayerLogs(selectedDateString, targetUserId);
  // No prayer-location timezone in this pure calendar-browsing view — a
  // plain local-calendar weekday check is fine here (unlike the Home/Today
  // screens, which need the prayer LOCATION's own timezone for correctness).
  const selectedDayIsFriday = selectedDay ? new Date(viewYear, viewMonth - 1, selectedDay).getDay() === 5 : false;
  const dateStringForDay = (day: number) => `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const selectedDayExcused =
    isOwnCalendar && !!selectedDateString && isDateStringInAnyPause(selectedDateString, allPauses ?? []);
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
      <TopAppBar title={title} />
      <ScrollView
        className="flex-1 px-container-margin"
        contentContainerStyle={{ paddingBottom: contentPaddingBottom, paddingTop: 16 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={goPrev} hitSlop={8}>
            <Icon name="chevron_left" color={Colors.onSurfaceVariant} />
          </Pressable>
          <Text className="text-[18px] font-bold text-on-surface">{monthLabel}</Text>
          <Pressable onPress={goNext} hitSlop={8}>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {dayStatusErrored ? (
          <Pressable
            onPress={() => refetchDayStatus()}
            className="flex-row items-center justify-between bg-error/10 border border-error rounded-xl px-4 py-3 mb-4"
          >
            <Text className="text-[13px] text-error flex-1">{t('familyLoadError')}</Text>
            <Text className="text-[13px] font-bold text-error">{t('retry')}</Text>
          </Pressable>
        ) : null}

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
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const excused = isOwnCalendar && isDateStringInAnyPause(dateStringForDay(day), allPauses ?? []);
              const status: DayStatus | undefined = excused ? 'excused' : dayStatus?.[day]?.status;
              return (
                <View key={day} style={{ width: `${100 / 7}%` }}>
                  <CalendarDayCell
                    day={n(day)}
                    isToday={isCurrentMonth && day === today}
                    isSelected={selectedDay === day}
                    dotColor={status ? DAY_STATUS_COLOR[status] : undefined}
                    dotTextColor={status ? DAY_STATUS_TEXT_COLOR[status] : undefined}
                    isPremium={status === 'all' && !!dayStatus?.[day]?.quranDone}
                    onPress={() => setSelectedDay(day)}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View className="flex-row gap-3 mb-6 items-stretch">
          {selectedDateLabel ? (
            <View className="flex-1 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-low">
              <Text className="text-[14px] font-bold text-on-surface mb-3">{selectedDateLabel}</Text>
              {selectedDayExcused ? (
                <View className="flex-row items-center gap-2">
                  <Icon name="info" size={16} color={Colors.onSurfaceVariant} />
                  <Text className="text-[12px] text-on-surface-variant flex-1">{t('periodExcusedDay')}</Text>
                </View>
              ) : (
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
                        {t(waqtDisplayKey(waqt, selectedDayIsFriday))}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          <View className="flex-1 gap-3">
            {isOwnCalendar && ownGender === 'female' ? (
              <Pressable
                onPress={isPaused ? endPause : startPause}
                className={`rounded-xl p-3 border items-center active:opacity-80 ${
                  isPaused ? 'bg-error/10 border-error' : 'bg-primary-container border-primary'
                }`}
              >
                <Text className={`text-[12px] font-bold ${isPaused ? 'text-error' : 'text-on-primary-container'}`}>
                  {isPaused ? t('endPeriodPause') : t('startPeriodPause')}
                </Text>
              </Pressable>
            ) : null}
            <View className="flex-1 bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-low gap-1.5">
              <Text className="text-[12px] font-bold text-on-surface mb-0.5">{t('legend')}</Text>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-primary" />
                <Text className="text-[11px] text-on-surface-variant flex-1">{t('legendAll')}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#facc15' }} />
                <Text className="text-[11px] text-on-surface-variant flex-1">{t('legendSome')}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                <Text className="text-[11px] text-on-surface-variant flex-1">{t('legendNone')}</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => onSeeMonthStats(viewYear, viewMonth)}
          className="flex-row items-center justify-between bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-low active:opacity-80"
        >
          <Text className="text-[14px] font-bold text-on-surface">{t('seeMonthStats')}</Text>
          <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
