import { View } from 'react-native';
import { Text } from './Text';
import { useClockTick } from '../lib/hooks/useClockTick';
import { useT } from '../lib/hooks/useT';
import { formatCountdown, formatTime, type DayPrayerTimes } from '../lib/prayerTimes';

type Props = {
  times: DayPrayerTimes;
  // Tomorrow's Maghrib — only actually used once today's Iftar has already
  // passed, but cheap enough that the caller just always computes it.
  tomorrowMaghrib: Date | null;
};

// Extracted out of Home for the same reason as HomePrayerTimeline: the
// countdown text here needs a 1s tick, but nothing else on the screen does.
export function SahriIftarCountdownRow({ times, tomorrowMaghrib }: Props) {
  const { t, n, localeTag } = useT();
  const now = useClockTick();

  const tomorrowFajr = times.windows[times.windows.length - 1].end;
  const isFastingHours = now >= times.fajr && now < times.maghrib;
  const sahriIsToday = now < times.fajr;
  const iftarIsToday = now < times.maghrib;
  const sahriTime = sahriIsToday ? times.fajr : tomorrowFajr;
  const iftarTime = iftarIsToday ? times.maghrib : (tomorrowMaghrib ?? times.maghrib);
  const countdownTarget = isFastingHours ? times.maghrib : sahriIsToday ? times.fajr : tomorrowFajr;
  const countdownRemainingMs = Math.max(0, countdownTarget.getTime() - now.getTime());

  return (
    <View className="flex-row bg-surface-container-lowest rounded-xl border border-surface-container-low mb-2 overflow-hidden">
      <View className="flex-1 items-center py-3 border-r border-surface-container-low">
        <Text className="text-[15px] font-bold text-on-surface">{formatTime(sahriTime, times.timeZone, localeTag)}</Text>
        <Text className="text-[11px] text-on-surface-variant mt-1 text-center">
          {t(sahriIsToday ? 'todaysSahri' : 'nextSahri')}
        </Text>
      </View>
      <View className="flex-1 items-center py-3 border-r border-surface-container-low">
        <Text className="text-[15px] font-bold text-on-surface">{formatTime(iftarTime, times.timeZone, localeTag)}</Text>
        <Text className="text-[11px] text-on-surface-variant mt-1 text-center">
          {t(iftarIsToday ? 'todaysIftar' : 'nextIftar')}
        </Text>
      </View>
      <View className="flex-1 items-center py-3">
        <Text className="text-[15px] font-bold text-on-surface">{formatCountdown(countdownRemainingMs, n)}</Text>
        <Text className="text-[11px] text-on-surface-variant mt-1 text-center">
          {t(isFastingHours ? 'iftarTimeLeft' : 'sahriTimeLeft')}
        </Text>
      </View>
    </View>
  );
}
