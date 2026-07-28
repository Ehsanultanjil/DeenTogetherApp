import { useMemo, useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, View } from 'react-native';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { Text } from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressRing } from '../../components/ProgressRing';
import { FamilyMemberRow } from '../../components/FamilyMemberRow';
import { PrayerNotificationHistoryModal } from '../../components/PrayerNotificationHistoryModal';
import { Icon } from '../../components/Icon';
import { LocationPicker } from '../../components/LocationPicker';
import { useColors } from '../../constants/theme';
import { usePrayerTimes } from '../../lib/hooks/usePrayerTimes';
import { useClockTick } from '../../lib/hooks/useClockTick';
import { useLocationName } from '../../lib/hooks/useLocationName';
import { usePrayerSettings } from '../../lib/hooks/usePrayerSettings';
import { useTodayPrayerLogs } from '../../lib/hooks/usePrayerLogs';
import { useTodayQuranLog } from '../../lib/hooks/useQuranLog';
import { usePrayerNotifications } from '../../lib/hooks/usePrayerNotifications';
import { useNotificationSettings } from '../../lib/hooks/useNotificationSettings';
import { useCurrentFamilyId, useFamilyTodayStatus } from '../../lib/hooks/useFamily';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationPreferenceStore } from '../../store/useLocationPreferenceStore';
import { BANGLADESH_DISTRICTS, nearestDistrict } from '../../lib/bangladeshDistricts';
import { useT } from '../../lib/hooks/useT';
import {
  computePrayerTimes,
  formatCountdown,
  formatTime,
  getCurrentMakruh,
  getCurrentWaqt,
  locationDateString,
  type WaqtName,
} from '../../lib/prayerTimes';
import type { MakruhKey } from '../../lib/prayerTimes';
import type { MaterialSymbolName } from '../../constants/materialSymbols';

const WAQT_KEY: Record<WaqtName, 'waqtFajr' | 'waqtDhuhr' | 'waqtAsr' | 'waqtMaghrib' | 'waqtIsha'> = {
  fajr: 'waqtFajr',
  dhuhr: 'waqtDhuhr',
  asr: 'waqtAsr',
  maghrib: 'waqtMaghrib',
  isha: 'waqtIsha',
};

const WAQT_ICON: Record<WaqtName, MaterialSymbolName> = {
  fajr: 'wb_twilight',
  dhuhr: 'sunny',
  asr: 'sunny',
  maghrib: 'wb_sunny',
  isha: 'bedtime',
};

const WAQT_ORDER: WaqtName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const MAKRUH_KEY: Record<MakruhKey, 'makruhSunrise' | 'makruhIstiwa' | 'makruhSunset'> = {
  sunrise: 'makruhSunrise',
  istiwa: 'makruhIstiwa',
  sunset: 'makruhSunset',
};

export default function Home() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { t, n, localeTag, locale } = useT();
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [notificationHistoryOpen, setNotificationHistoryOpen] = useState(false);
  const locationPreference = useLocationPreferenceStore((s) => s.preference);
  const { settings } = usePrayerSettings();
  const { times, locationStatus, coords, logDateString } = usePrayerTimes(settings);
  const gpsCoords = locationPreference.mode === 'gps' ? coords : null;
  const geocodedPlace = useLocationName(gpsCoords);
  const locationLabel =
    locationPreference.mode === 'manual'
      ? (() => {
          const district = BANGLADESH_DISTRICTS.find((d) => d.id === locationPreference.districtId);
          return district ? (locale === 'bn' ? district.nameBn : district.nameEn) : t('currentLocationLabel');
        })()
      : gpsCoords
        ? (() => {
            const district = nearestDistrict(gpsCoords.latitude, gpsCoords.longitude);
            const districtName = locale === 'bn' ? district.nameBn : district.nameEn;
            // Reverse-geocode gives a finer "area" (e.g. Mirpur) — only
            // worth showing alongside the district when it actually adds
            // something (skip if it's the same name or missing/offline).
            const area = geocodedPlace?.area;
            return area && area.toLowerCase() !== districtName.toLowerCase()
              ? `${area}, ${districtName}`
              : districtName;
          })()
        : t('currentLocationLabel');
  const now = useClockTick();
  const dateString = times ? locationDateString(times.timeZone, now) : null;
  const { completed } = useTodayPrayerLogs(dateString);
  // Between midnight and real Fajr, all 5 waqts still belong to yesterday's
  // date (see usePrayerTimes.ts) — home's completion count/percentage should
  // reflect that carried-over day, not today's not-yet-started prayers.
  const { completed: carryoverCompleted } = useTodayPrayerLogs(logDateString);
  const effectiveCompleted = logDateString ? carryoverCompleted : completed;
  const effectiveDateString = logDateString ?? dateString;
  const { completed: quranCompleted, toggle: toggleQuran } = useTodayQuranLog(effectiveDateString);

  // Tomorrow's Maghrib — only needed once today's Iftar has already
  // passed, but cheap enough to just always compute alongside today's.
  const tomorrowTimes = useMemo(() => {
    if (!coords) return null;
    return computePrayerTimes({
      latitude: coords.latitude,
      longitude: coords.longitude,
      date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      calcMethod: settings.calcMethod,
      madhab: settings.madhab,
      safetyMarginMinutes: settings.safetyMarginMinutes,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateString, coords?.latitude, coords?.longitude, settings.calcMethod, settings.madhab, settings.safetyMarginMinutes]);
  const { enabled: notificationsEnabled } = useNotificationSettings();
  usePrayerNotifications(times, dateString, completed, locale, notificationsEnabled);

  const currentWaqt = times ? getCurrentWaqt(times.windows, now).current.name : null;
  const { data: currentFamilyId } = useCurrentFamilyId();
  const { data: familyStatus } = useFamilyTodayStatus(currentFamilyId ?? null, currentWaqt);
  const familyMembersExceptMe = (familyStatus ?? []).filter((m) => m.user_id !== session?.user.id);

  const completedToday = Object.values(effectiveCompleted).filter(Boolean).length;
  const totalPrayers = 5;

  const hasMissedToday = times
    ? times.windows.some((w) => w.start <= now && now >= w.end && !completed[w.name])
    : false;

  const locationHeader = (
    <View
      className="w-full flex-row justify-between items-center px-gutter bg-surface"
      style={{ paddingTop: insets.top, height: 56 + insets.top }}
    >
      <Pressable onPress={() => setLocationPickerOpen(true)} className="flex-row items-center gap-1 py-2 active:opacity-70">
        <Icon name="location_on" color={Colors.primary} size={20} />
        <Text className="text-[16px] font-bold text-on-surface">{locationLabel}</Text>
        <Icon name="expand_more" color={Colors.onSurfaceVariant} size={18} />
      </Pressable>
      <Pressable
        onPress={() => setNotificationHistoryOpen(true)}
        className="p-2 rounded-full active:opacity-70 relative"
        hitSlop={8}
      >
        <Icon name="notifications" color={Colors.primary} />
        {hasMissedToday ? (
          <View className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" />
        ) : null}
      </Pressable>
    </View>
  );

  if (!times) {
    return (
      <View className="flex-1 bg-surface">
        {locationHeader}
        <View className="flex-1 items-center justify-center px-gutter">
          <Icon name="info" size={32} color={Colors.onSurfaceVariant} />
          <Text className="text-[16px] font-bold text-on-surface mt-3 text-center">
            {locationStatus === 'denied'
              ? t('locationNeeded')
              : locationStatus === 'error'
                ? t('locationErrorTitle')
                : t('findingLocation')}
          </Text>
          <Text className="text-[13px] text-on-surface-variant mt-1 text-center">{t('locationExplainer')}</Text>
        </View>
        <LocationPicker visible={locationPickerOpen} onClose={() => setLocationPickerOpen(false)} />
        <PrayerNotificationHistoryModal
          visible={notificationHistoryOpen}
          onClose={() => setNotificationHistoryOpen(false)}
          times={times}
          completed={completed}
          now={now}
        />
      </View>
    );
  }

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

  const isFastingHours = now >= times.fajr && now < times.maghrib;
  const sahriIsToday = now < times.fajr;
  const iftarIsToday = now < times.maghrib;
  const sahriTime = sahriIsToday ? times.fajr : tomorrowFajr;
  const iftarTime = iftarIsToday ? times.maghrib : (tomorrowTimes?.maghrib ?? times.maghrib);
  const countdownTarget = isFastingHours ? times.maghrib : sahriIsToday ? times.fajr : tomorrowFajr;
  const countdownRemainingMs = Math.max(0, countdownTarget.getTime() - now.getTime());

  return (
    <View className="flex-1 bg-surface">
      {locationHeader}
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: tabBarHeight + 32, paddingTop: 8 }}>
        <View className="bg-surface-container-lowest rounded-xl border border-surface-container-low px-4 py-2.5 mb-2">
          <Text className="text-[12px] text-on-surface-variant text-center">
            {now.toLocaleDateString(localeTag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: times.timeZone })} ·
            {' '}{t('sunrise')} {formatTime(times.sunrise, times.timeZone, localeTag)} · {t('sunset')}{' '}
            {formatTime(times.sunset, times.timeZone, localeTag)}
          </Text>
        </View>

        <ImageBackground
          source={require('../../assets/backgrounds/prayer-times-bg.png')}
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
              <Text className="text-on-primary-container font-bold text-[13px]">{t(WAQT_KEY[current.name])}</Text>
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
                      {t(WAQT_KEY[w.name])}
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

        <View className="mb-2">
          <View className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-variant/20">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[13px] font-bold text-on-surface">{t('todaysPrayersTitle')}</Text>
            <Text className="text-[11px] font-bold text-primary">
              {t('completedFraction', { done: n(completedToday), total: n(totalPrayers) })}
            </Text>
          </View>
          <View className="flex-row items-start justify-between" style={{ position: 'relative' }}>
            <View
              className="bg-outline-variant"
              style={{
                position: 'absolute',
                top: 17,
                left: `${100 / WAQT_ORDER.length / 2}%`,
                right: `${100 / WAQT_ORDER.length / 2}%`,
                height: 1.5,
                zIndex: -1,
              }}
            />
            {WAQT_ORDER.map((waqt) => {
              const isCurrentWaqt = waqt === currentWaqt;
              const isDone = effectiveCompleted[waqt];
              const waqtWindow = times.windows.find((w) => w.name === waqt);
              const isMissed = !isDone && !isCurrentWaqt && !!waqtWindow && now >= waqtWindow.end;
              const circleSize = isCurrentWaqt ? 36 : 28;
              return (
                <View key={waqt} className="items-center" style={{ width: `${100 / WAQT_ORDER.length}%` }}>
                  <View style={{ height: 35, alignItems: 'center', justifyContent: 'center' }}>
                    <View
                      className={`items-center justify-center rounded-full ${
                        isDone
                          ? 'bg-primary-container'
                          : isCurrentWaqt
                            ? 'bg-surface-container border-2 border-primary'
                            : !isMissed
                              ? 'bg-surface-container border border-outline-variant'
                              : ''
                      }`}
                      style={{
                        width: circleSize,
                        height: circleSize,
                        ...(isMissed ? { backgroundColor: '#ba1a1a' } : null),
                        ...(isCurrentWaqt
                          ? {
                              shadowColor: Colors.primary,
                              shadowOpacity: 0.6,
                              shadowRadius: 5,
                              shadowOffset: { width: 0, height: 0 },
                              elevation: 4,
                            }
                          : isDone
                            ? {
                                shadowColor: Colors.primary,
                                shadowOpacity: 0.3,
                                shadowRadius: 20,
                                shadowOffset: { width: 0, height: 0 },
                                elevation: 3,
                              }
                            : isMissed
                              ? {
                                  shadowColor: '#ba1a1a',
                                  shadowOpacity: 0.3,
                                  shadowRadius: 20,
                                  shadowOffset: { width: 0, height: 0 },
                                  elevation: 3,
                                }
                              : null),
                      }}
                    >
                      {isDone ? (
                        <Icon name="check" size={14} color="#ffffff" />
                      ) : isMissed ? (
                        <Icon name="close" size={14} color="#ffffff" />
                      ) : (
                        <Icon
                          name={WAQT_ICON[waqt]}
                          size={isCurrentWaqt ? 17 : 12}
                          color={isCurrentWaqt ? '#f5b942' : Colors.onSurfaceVariant}
                        />
                      )}
                    </View>
                  </View>
                  <Text
                    className={`text-[9px] mt-1 text-center ${
                      isCurrentWaqt ? 'font-bold text-on-surface' : 'text-on-surface-variant'
                    }`}
                  >
                    {t(WAQT_KEY[waqt])}
                  </Text>
                  {isCurrentWaqt ? (
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        marginTop: 2,
                        borderLeftWidth: 3,
                        borderRightWidth: 3,
                        borderBottomWidth: 4,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderBottomColor: Colors.primary,
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={() => toggleQuran(!quranCompleted)}
              className={`flex-1 rounded-full px-3 py-2 flex-row items-center justify-center gap-1.5 active:opacity-80 ${
                quranCompleted ? 'bg-primary-container' : 'bg-surface-container border border-outline-variant'
              }`}
            >
              <Icon name="menu_book" size={14} color={quranCompleted ? '#ffffff' : Colors.onSurfaceVariant} />
              <Text className={`text-[10px] font-bold ${quranCompleted ? 'text-white' : 'text-on-surface-variant'}`}>
                {t('quranLabel')}
              </Text>
              <Icon
                name={quranCompleted ? 'check_circle' : 'radio_button_unchecked'}
                filled={quranCompleted}
                size={13}
                color={quranCompleted ? '#ffffff' : Colors.outlineVariant}
              />
            </Pressable>
            {currentWaqt ? (
              <Pressable
                onPress={() => router.push('/today')}
                className="flex-1 bg-primary-fixed rounded-full px-2 py-2 flex-row items-center justify-center gap-1"
              >
                <Text className="text-[10px] font-bold text-on-primary-fixed" numberOfLines={1}>
                  {t('updatePrayerCta')}
                </Text>
                <Icon name="chevron_right" size={13} color={Colors.onPrimaryFixed} />
              </Pressable>
            ) : null}
          </View>
          </View>
          <View
            className="bg-primary-container rounded-b-xl"
            style={{
              marginHorizontal: 8,
              paddingHorizontal: 14,
              paddingVertical: 6,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Text className="text-[9.5px] text-on-primary-container/100" style={{ lineHeight: 12 }} numberOfLines={1}>
              <Text className="italic">{t('hadithQuote')}</Text>
              <Text className="text-on-primary-container/80"> {t('hadithReference')}</Text>
            </Text>
          </View>
        </View>

        <View className="bg-surface-container-lowest rounded-xl border border-surface-container-low p-4 mb-2">
          <View className="flex-row items-center gap-2 mb-3">
            <Icon name="info" size={18} color={Colors.error} />
            <Text className="text-[14px] font-bold text-error">{t('dislikedTimes')}</Text>
          </View>
          <View className="flex-row gap-2 mb-3">
            {times.makruh.map((m) => (
              <View key={m.key} className="flex-1 bg-error/10 rounded-xl p-3 items-center border border-error/20">
                <View className="flex-row items-center gap-1">
                  <Text className="text-[12px] font-bold text-error text-center">{t(MAKRUH_KEY[m.key])}</Text>
                  {m.key === 'sunset' ? (
                    <Pressable
                      onPress={() => Alert.alert(t('sunsetExceptionTitle'), t('sunsetExceptionBody'))}
                      hitSlop={8}
                    >
                      <Icon name="info" size={13} color={Colors.error} />
                    </Pressable>
                  ) : null}
                </View>
                <Text className="text-[11px] text-on-surface-variant mt-1 text-center">
                  {formatTime(m.start, times.timeZone, localeTag)} – {formatTime(m.end, times.timeZone, localeTag)}
                </Text>
              </View>
            ))}
          </View>
          <Text className="text-[10px] text-on-surface-variant">{t('prohibitedTimesNote')}</Text>
        </View>

        <View className="flex-row bg-surface-container-lowest rounded-xl border border-surface-container-low mb-2 overflow-hidden">
          <View className="flex-1 items-center py-3 border-r border-surface-container-low">
            <Text className="text-[15px] font-bold text-on-surface">
              {formatTime(sahriTime, times.timeZone, localeTag)}
            </Text>
            <Text className="text-[11px] text-on-surface-variant mt-1 text-center">
              {t(sahriIsToday ? 'todaysSahri' : 'nextSahri')}
            </Text>
          </View>
          <View className="flex-1 items-center py-3 border-r border-surface-container-low">
            <Text className="text-[15px] font-bold text-on-surface">
              {formatTime(iftarTime, times.timeZone, localeTag)}
            </Text>
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

        <View className="mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[18px] font-bold text-on-surface">{t('familyStatus')}</Text>
            <Pressable onPress={() => router.push('/(tabs)/family')}>
              <Text className="text-primary text-[14px] font-semibold">{t('viewAll')}</Text>
            </Pressable>
          </View>
          {!currentFamilyId ? (
            <Pressable
              onPress={() => router.push('/(tabs)/family')}
              className="bg-surface-container-lowest rounded-xl p-4 border border-surface-variant/20 items-center active:opacity-90"
            >
              <Text className="text-[14px] text-on-surface-variant text-center">{t('noFamilyYetHome')}</Text>
            </Pressable>
          ) : (
            <View className="gap-3">
              {familyMembersExceptMe.map((m) => (
                <Pressable
                  key={m.user_id}
                  onPress={() =>
                    router.push({
                      pathname: '/family/member-calendar',
                      params: { userId: m.user_id, name: m.full_name ?? t('memberRole') },
                    })
                  }
                >
                  <FamilyMemberRow
                    name={m.full_name ?? t('memberRole')}
                    progressLabel={`${n(m.percent)}%`}
                    dotsCompleted={Math.round((m.percent / 100) * 5)}
                    avatarUri={m.avatar_url ?? undefined}
                    todayLabel={t('todayLabel')}
                  />
                </Pressable>
              ))}
              {familyMembersExceptMe.length === 0 ? (
                <Text className="text-[13px] text-on-surface-variant">{t('noOtherMembers')}</Text>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push('/today')}
        style={{ position: 'absolute', bottom: tabBarHeight + 16, right: 24 }}
        className="w-14 h-14 bg-primary rounded-full shadow-lg items-center justify-center active:opacity-90"
      >
        <Icon name="add" color="#ffffff" />
      </Pressable>
      <LocationPicker visible={locationPickerOpen} onClose={() => setLocationPickerOpen(false)} />
      <PrayerNotificationHistoryModal
        visible={notificationHistoryOpen}
        onClose={() => setNotificationHistoryOpen(false)}
        times={times}
        completed={completed}
        now={now}
      />
    </View>
  );
}
