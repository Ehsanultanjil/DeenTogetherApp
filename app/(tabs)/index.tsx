import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { Text } from '../../components/Text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressRing } from '../../components/ProgressRing';
import { FamilyMemberRow } from '../../components/FamilyMemberRow';
import { SyncDot } from '../../components/SyncDot';
import { PrayerNotificationHistoryModal } from '../../components/PrayerNotificationHistoryModal';
import { Icon } from '../../components/Icon';
import { LocationPicker } from '../../components/LocationPicker';
import { useColors } from '../../constants/theme';
import { usePrayerTimes } from '../../lib/hooks/usePrayerTimes';
import { useClockTick } from '../../lib/hooks/useClockTick';
import { useLocationName } from '../../lib/hooks/useLocationName';
import { usePrayerSettings } from '../../lib/hooks/usePrayerSettings';
import { useTodayPrayerLogs } from '../../lib/hooks/usePrayerLogs';
import { usePrayerNotifications } from '../../lib/hooks/usePrayerNotifications';
import { useNotificationSettings } from '../../lib/hooks/useNotificationSettings';
import { useSyncStatusStore } from '../../store/useSyncStatusStore';
import { useStreak } from '../../lib/hooks/useStreak';
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

const WAQT_KEY: Record<WaqtName, 'waqtFajr' | 'waqtDhuhr' | 'waqtAsr' | 'waqtMaghrib' | 'waqtIsha'> = {
  fajr: 'waqtFajr',
  dhuhr: 'waqtDhuhr',
  asr: 'waqtAsr',
  maghrib: 'waqtMaghrib',
  isha: 'waqtIsha',
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
  const streak = useStreak();

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
  const percentage = Math.round((completedToday / totalPrayers) * 100);

  const hasMissedToday = times
    ? times.windows.some((w) => w.start <= now && now >= w.end && !completed[w.name])
    : false;

  const syncStatus = useSyncStatusStore((s) => s.status);
  const SYNC_STATUS_LABEL: Record<typeof syncStatus, string> = {
    synced: t('syncedLabel'),
    syncing: t('syncingLabel'),
    offline: t('offlineLabel'),
  };

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
        <View className="bg-surface-container-lowest rounded-xl border border-surface-container-low px-4 py-2.5 mb-4">
          <Text className="text-[12px] text-on-surface-variant text-center">
            {now.toLocaleDateString(localeTag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: times.timeZone })} ·
            {' '}{t('sunrise')} {formatTime(times.sunrise, times.timeZone, localeTag)} · {t('sunset')}{' '}
            {formatTime(times.sunset, times.timeZone, localeTag)}
          </Text>
        </View>

        <View className="bg-primary-container rounded-xl p-4 shadow-sm mb-4 flex-row items-center gap-4">
          {activeMakruh ? (
            <ProgressRing size={90} strokeWidth={9} progress={makruhProgress} color="#ffb4ab" trackColor="#93000a">
              <Text className="text-error font-bold text-[13px]">{t('prohibitedTimeRingLabel')}</Text>
              <Text className="text-error text-[12px] font-bold mt-0.5">{formatCountdown(makruhRemainingMs, n)}</Text>
            </ProgressRing>
          ) : (
            <ProgressRing size={90} strokeWidth={9} progress={currentProgress} color="#a8e7c5" trackColor="#0e5138">
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
        </View>

        <Pressable
          onPress={() => router.push('/today')}
          className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-variant/20 active:opacity-90 mb-4"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <SyncDot status={syncStatus} label={SYNC_STATUS_LABEL[syncStatus]} />
              <Text className="text-[18px] font-bold text-on-surface">{t('todaysProgress')}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="bg-primary-fixed px-3 py-1 rounded-full">
                <Text className="text-on-primary-fixed text-[12px]">{t('dailyStreak', { count: n(streak) })}</Text>
              </View>
              <Icon name="chevron_right" size={18} color={Colors.onSurfaceVariant} />
            </View>
          </View>
          <View className="flex-row items-center gap-6">
            <ProgressRing size={80} strokeWidth={9} progress={percentage}>
              <Text className="text-[20px] font-bold text-primary">{n(percentage)}%</Text>
            </ProgressRing>
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-[18px] font-bold text-primary">
                  {t('prayersDoneCount', { done: n(completedToday), total: n(totalPrayers) })}
                </Text>
                <Text className="text-[14px] text-on-surface-variant">{t('prayersDoneLabel')}</Text>
              </View>
              <View className="flex-row gap-1">
                {WAQT_ORDER.map((waqt) =>
                  effectiveCompleted[waqt] ? (
                    <Icon key={waqt} name="check_circle" filled size={16} color={Colors.primary} />
                  ) : (
                    <Icon key={waqt} name="radio_button_unchecked" size={16} color={Colors.outlineVariant} />
                  ),
                )}
              </View>
            </View>
          </View>
        </Pressable>

        <View className="bg-surface-container-lowest rounded-xl border border-surface-container-low p-4 mb-4">
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

        <View className="flex-row bg-surface-container-lowest rounded-xl border border-surface-container-low mb-4 overflow-hidden">
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

        <View className="mb-4">
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
