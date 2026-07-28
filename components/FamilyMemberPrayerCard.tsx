import { Image, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { resolveAvatarSource } from '../constants/avatarPresets';
import type { WaqtName, WaqtVisualState } from '../lib/prayerTimes';
import type { MaterialSymbolName } from '../constants/materialSymbols';

const WAQT_ORDER: WaqtName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

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

type Props = {
  name: string;
  role?: string;
  progressLabel: string; // e.g. "80%"
  avatarUri?: string;
  isAdmin?: boolean;
  todayLabel?: string;
  // null => member hasn't set a location yet, so per-waqt state can't be
  // computed at all — render muted rather than guessing a false "missed".
  waqtStates: Record<WaqtName, WaqtVisualState> | null;
  waqtLabel: (waqt: WaqtName) => string;
  locationUnknownLabel?: string;
};

export function FamilyMemberPrayerCard({
  name,
  role,
  progressLabel,
  avatarUri,
  isAdmin = false,
  todayLabel = 'Today',
  waqtStates,
  waqtLabel,
  locationUnknownLabel = "Hasn't set a location yet",
}: Props) {
  const Colors = useColors();
  const avatarSource = resolveAvatarSource(avatarUri);
  const circleSize = 22;

  return (
    <View className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-variant/10">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View
            style={{ width: 48, height: 48, borderRadius: 24 }}
            className="overflow-hidden border-2 border-primary/10 bg-surface-container-high items-center justify-center"
          >
            {avatarSource ? (
              <Image source={avatarSource} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Icon name="person" color="#404943" />
            )}
          </View>
          <View>
            <Text className="font-bold text-[16px] text-on-surface">{name}</Text>
            {role ? (
              <View className="flex-row items-center gap-1 mt-0.5">
                {isAdmin ? <Icon name="shield_with_heart" size={14} filled color="#0f5238" /> : null}
                <Text className="text-[12px] text-on-surface-variant">{role}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View className="items-end">
          <Text className="font-bold text-primary text-[16px]">{progressLabel}</Text>
          <Text className="text-[12px] text-on-surface-variant">{todayLabel}</Text>
        </View>
      </View>

      {waqtStates ? (
        <View className="flex-row justify-between mt-3">
          {WAQT_ORDER.map((waqt) => {
            const state = waqtStates[waqt];
            const isDone = state === 'done';
            const isCurrent = state === 'current';
            const isMissed = state === 'missed';
            return (
              <View key={waqt} className="items-center" style={{ width: `${100 / WAQT_ORDER.length}%` }}>
                <View
                  className={`items-center justify-center rounded-full ${
                    isDone
                      ? 'bg-primary-container'
                      : isCurrent
                        ? 'bg-surface-container border-2 border-primary'
                        : !isMissed
                          ? 'bg-surface-container border border-outline-variant'
                          : ''
                  }`}
                  style={{
                    width: circleSize,
                    height: circleSize,
                    ...(isMissed ? { backgroundColor: '#ba1a1a' } : null),
                  }}
                >
                  {isDone ? (
                    <Icon name="check" size={12} color="#ffffff" />
                  ) : isMissed ? (
                    <Icon name="close" size={12} color="#ffffff" />
                  ) : (
                    <Icon
                      name={WAQT_ICON[waqt]}
                      size={11}
                      color={isCurrent ? '#f5b942' : Colors.onSurfaceVariant}
                    />
                  )}
                </View>
                <Text className="text-[8px] mt-1 text-center text-on-surface-variant" numberOfLines={1}>
                  {waqtLabel(waqt)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row gap-1.5">
            {WAQT_ORDER.map((waqt) => (
              <View
                key={waqt}
                className="items-center justify-center rounded-full bg-surface-container border border-outline-variant opacity-40"
                style={{ width: circleSize, height: circleSize }}
              >
                <Icon name={WAQT_ICON[waqt]} size={11} color={Colors.onSurfaceVariant} />
              </View>
            ))}
          </View>
          <Text className="text-[10px] text-on-surface-variant italic flex-1 text-right ml-2" numberOfLines={2}>
            {locationUnknownLabel}
          </Text>
        </View>
      )}
    </View>
  );
}
