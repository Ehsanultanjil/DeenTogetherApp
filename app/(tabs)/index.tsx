import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { Text } from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomePrayerTimeline } from '../../components/HomePrayerTimeline';
import { SahriIftarCountdownRow } from '../../components/SahriIftarCountdownRow';
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
import { usePeriodPause } from '../../lib/hooks/usePeriodPause';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationPreferenceStore } from '../../store/useLocationPreferenceStore';
import { BANGLADESH_DISTRICTS, nearestDistrict } from '../../lib/bangladeshDistricts';
import { useT } from '../../lib/hooks/useT';
import { computePrayerTimes, formatTime, getCurrentWaqt, isJummahDay, locationDateString } from '../../lib/prayerTimes';
import type { MakruhKey } from '../../lib/prayerTimes';
import { WAQT_ORDER, WAQT_ICON, waqtDisplayKey } from '../../constants/waqt';
import { NOTIFICATION_LOOKAHEAD_DAYS } from '../../lib/notifications/config';

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
  // The countdown-precision ticks live inside HomePrayerTimeline/
  // SahriIftarCountdownRow now — everything here (day rollover, waqt-list
  // highlighting, family status) only needs to notice a new minute, not a
  // new second, so this screen no longer re-renders on every tick either.
  const now = useClockTick(60_000);
  const dateString = times ? locationDateString(times.timeZone, now) : null;
  const { completed } = useTodayPrayerLogs(dateString);
  // Between midnight and real Fajr, all 5 waqts still belong to yesterday's
  // date (see usePrayerTimes.ts) — home's completion count/percentage should
  // reflect that carried-over day, not today's not-yet-started prayers.
  const { completed: carryoverCompleted } = useTodayPrayerLogs(logDateString);
  const effectiveCompleted = logDateString ? carryoverCompleted : completed;
  const effectiveDateString = logDateString ?? dateString;
  const { completed: quranCompleted, toggle: toggleQuran } = useTodayQuranLog(effectiveDateString);

  // Tomorrow through NOTIFICATION_LOOKAHEAD_DAYS days out — scheduled every
  // sync so a user who's offline or doesn't open the app for a while still
  // has every upcoming waqt already queued in the OS alarm manager, not just
  // today's (see usePrayerNotifications). Tomorrow's entry alone also feeds
  // SahriIftarCountdownRow's Maghrib countdown below.
  const upcomingDays = useMemo(() => {
    if (!coords) return [];
    const days = [];
    for (let i = 1; i < NOTIFICATION_LOOKAHEAD_DAYS; i++) {
      days.push(
        computePrayerTimes({
          latitude: coords.latitude,
          longitude: coords.longitude,
          date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000),
          calcMethod: settings.calcMethod,
          madhab: settings.madhab,
          safetyMarginMinutes: settings.safetyMarginMinutes,
        }),
      );
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateString, coords?.latitude, coords?.longitude, settings.calcMethod, settings.madhab, settings.safetyMarginMinutes]);
  const tomorrowTimes = upcomingDays[0] ?? null;
  const { enabled: notificationsEnabled } = useNotificationSettings();
  usePrayerNotifications(times, dateString, locale, notificationsEnabled, upcomingDays);

  const currentWaqt = times ? getCurrentWaqt(times.windows, now).current.name : null;
  const { isPaused, endPause } = usePeriodPause();
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

        <HomePrayerTimeline times={times} />

        <View className="mb-2">
          <View className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-variant/20">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[13px] font-bold text-on-surface">{t('todaysPrayersTitle')}</Text>
            {isPaused ? (
              <Text className="text-[11px] font-bold text-on-surface-variant">{t('periodPauseActiveLabel')}</Text>
            ) : (
              <Text className="text-[11px] font-bold text-primary">
                {t('completedFraction', { done: n(completedToday), total: n(totalPrayers) })}
              </Text>
            )}
          </View>
          {isPaused ? (
            <View className="bg-surface-container rounded-xl p-4 items-center gap-2">
              <Icon name="info" size={20} color={Colors.onSurfaceVariant} />
              <Text className="text-[12px] text-on-surface-variant text-center">{t('periodExcusedDay')}</Text>
              <Pressable
                onPress={endPause}
                className="mt-1 px-4 py-1.5 rounded-full bg-error/10 border border-error active:opacity-80"
              >
                <Text className="text-[11px] font-bold text-error">{t('endPeriodPause')}</Text>
              </Pressable>
            </View>
          ) : (
          <>
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
                        ...(isMissed ? { backgroundColor: Colors.error } : null),
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
                                  shadowColor: Colors.error,
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
                    {t(waqtDisplayKey(waqt, !!waqtWindow && isJummahDay(times.timeZone, waqtWindow.start)))}
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
          </>
          )}
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

        <SahriIftarCountdownRow times={times} tomorrowMaghrib={tomorrowTimes?.maghrib ?? null} />

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
