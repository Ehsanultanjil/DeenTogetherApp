import { ImageBackground, View } from 'react-native';
import { Text } from './Text';
import { ProgressRing } from './ProgressRing';
import { useClockTick } from '../lib/hooks/useClockTick';
import { useT } from '../lib/hooks/useT';
import { waqtDisplayKey } from '../constants/waqt';
import { formatCountdown, formatTime, getCurrentMakruh, getCurrentWaqt, isJummahDay, type DayPrayerTimes } from '../lib/prayerTimes';

type Props = {
  times: DayPrayerTimes;
};

// Extracted out of Home so its own 1s countdown ticker doesn't force the
// rest of the screen (family list, disliked-times card, etc.) to re-render
// every second too — only this subtree needs that granularity.
export function HomePrayerTimeline({ times }: Props) {
  const { t, n, localeTag } = useT();
  const now = useClockTick();

  const { current, remainingMs } = getCurrentWaqt(times.windows, now);
  const currentDurationMs = current.end.getTime() - current.start.getTime();
  const currentProgress = currentDurationMs > 0 ? (remainingMs / currentDurationMs) * 100 : 0;
  const activeMakruh = getCurrentMakruh(times.makruh, now);
  const makruhDurationMs = activeMakruh ? activeMakruh.end.getTime() - activeMakruh.start.getTime() : 0;
  const makruhRemainingMs = activeMakruh ? Math.max(0, activeMakruh.end.getTime() - now.getTime()) : 0;
  const makruhProgress = makruhDurationMs > 0 ? (makruhRemainingMs / makruhDurationMs) * 100 : 0;
  // Between the Fajr window ending (sunrise) and Dhuhr starting, `current`
  // above stays stuck on Fajr with remainingMs clamped to 0 (its own window
  // already ended) — the ring would otherwise show a dead 00:00:00 "Fajr".
  // Duha is display-only (never logged/tracked as a waqt), so it's handled
  // entirely here rather than folded into `windows`.
  const inDuha = !activeMakruh && now >= times.duha.start && now < times.duha.end;
  const duhaDurationMs = times.duha.end.getTime() - times.duha.start.getTime();
  const duhaRemainingMs = Math.max(0, times.duha.end.getTime() - now.getTime());
  const duhaProgress = duhaDurationMs > 0 ? (duhaRemainingMs / duhaDurationMs) * 100 : 0;
  const tomorrowFajr = times.windows[times.windows.length - 1].end;
  // Islamic midnight (moddhorat) — midpoint of the night from Maghrib to
  // next Fajr, not clock midnight. Isha becomes makruh to delay past this.
  const moddhorat = new Date(times.maghrib.getTime() + (tomorrowFajr.getTime() - times.maghrib.getTime()) / 2);

  return (
    <ImageBackground
      source={require('../assets/backgrounds/prayer-times-bg.png')}
      resizeMode="cover"
      imageStyle={{
        borderRadius: 12,
        // Nudge the photo a little to the right within its frame. cover
        // exactly fills the box with no slack to shift into, so the
        // image is overscanned symmetrically first (wider than the box,
        // centered) to create room on both sides, then translated —
        // this way the shift can't expose a gap on either edge.
        width: '116%',
        left: '-6%',
        transform: [{ translateX: 20 }],
      }}
      style={{
        width: '100%',
        height: 230,
        borderRadius: 12,
        marginBottom: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        overflow: 'hidden',
      }}
    >
      {activeMakruh ? (
        <ProgressRing size={90} strokeWidth={9} progress={makruhProgress} color="#ff0000" trackColor="transparent">
          <Text className="text-on-primary-container font-bold text-[13px]">{t('prohibitedTimeRingLabel')}</Text>
          <Text className="text-on-primary-container text-[12px] font-bold mt-0.5">{formatCountdown(makruhRemainingMs, n)}</Text>
        </ProgressRing>
      ) : inDuha ? (
        <ProgressRing size={90} strokeWidth={9} progress={duhaProgress} color="#a8e7c5" trackColor="transparent">
          <Text className="text-on-primary-container font-bold text-[13px]">{t('duhaTimeRingLabel')}</Text>
          <Text className="text-on-primary-container text-[10px] opacity-80">{t('left')}</Text>
          <Text className="text-on-primary-container text-[12px] font-bold mt-0.5">
            {formatCountdown(duhaRemainingMs, n)}
          </Text>
        </ProgressRing>
      ) : (
        <ProgressRing size={90} strokeWidth={9} progress={currentProgress} color="#a8e7c5" trackColor="transparent">
          <Text className="text-on-primary-container font-bold text-[13px]">
            {t(waqtDisplayKey(current.name, isJummahDay(times.timeZone, current.start)))}
          </Text>
          <Text className="text-on-primary-container text-[10px] opacity-80">{t('left')}</Text>
          <Text className="text-on-primary-container text-[12px] font-bold mt-0.5">
            {formatCountdown(remainingMs, n)}
          </Text>
        </ProgressRing>
      )}
      <View className="flex-1">
        {times.windows.map((w, idx) => {
          const isCurrent = w.name === current.name;
          const prevIsCurrent = idx !== 0 && times.windows[idx - 1].name === current.name;
          const showDivider = idx !== 0 && !isCurrent && !prevIsCurrent;
          return (
            <View key={w.name}>
              <View
                className={`flex-row items-center justify-between px-2.5 py-1.5 rounded-lg ${
                  isCurrent ? 'bg-primary-fixed' : ''
                } ${showDivider ? 'border-t border-on-primary-container/15' : ''}`}
              >
                <Text
                  className={`text-[13px] font-bold ${isCurrent ? 'text-on-primary-fixed' : 'text-on-primary-container'}`}
                >
                  {t(waqtDisplayKey(w.name, isJummahDay(times.timeZone, w.start)))}
                </Text>
                <Text
                  className={`text-[12px] ${isCurrent ? 'text-on-primary-fixed' : 'text-on-primary-container opacity-80'}`}
                >
                  {formatTime(w.start, times.timeZone, localeTag)} – {formatTime(w.end, times.timeZone, localeTag)}
                </Text>
              </View>
              {w.name === 'isha' ? (
                <Text className="text-[10px] text-on-primary-container opacity-70 px-2.5 pt-0.5 text-right">
                  {t('ishaMakruhNote', { time: formatTime(moddhorat, times.timeZone, localeTag) })}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </ImageBackground>
  );
}
