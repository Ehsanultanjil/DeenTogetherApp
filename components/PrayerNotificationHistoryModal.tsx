import { FlatList, View } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { useT } from '../lib/hooks/useT';
import { startedLine, missedLine } from '../lib/notifications/config';
import { formatTime, isJummahDay, type DayPrayerTimes, type WaqtName } from '../lib/prayerTimes';
import type { CompletionMap } from '../lib/hooks/usePrayerLogs';
import { BottomSheetModal } from './BottomSheetModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  times: DayPrayerTimes | null;
  completed: CompletionMap;
  now: Date;
};

type Status = 'prayed' | 'missed' | 'current';
type HistoryEntry = { waqt: WaqtName; time: string; status: Status; isJummah: boolean };

// Derived live from today's prayer times + completion state — mirrors
// exactly what the local scheduled notifications say (same startedLine/
// missedLine text), so this reads as "history of what you were notified
// about" without needing to separately log every notification firing.
export function PrayerNotificationHistoryModal({ visible, onClose, times, completed, now }: Props) {
  const { t, localeTag, locale } = useT();
  const Colors = useColors();

  const entries: HistoryEntry[] = times
    ? [...times.windows]
        .filter((w) => w.start <= now)
        .map((w) => ({
          waqt: w.name,
          time: formatTime(w.start, times.timeZone, localeTag),
          status: (completed[w.name] ? 'prayed' : now >= w.end ? 'missed' : 'current') as Status,
          isJummah: isJummahDay(times.timeZone, w.start),
        }))
        .reverse()
    : [];

  const ICON: Record<Status, { name: 'check_circle' | 'info' | 'radio_button_unchecked'; color: string; filled: boolean }> = {
    prayed: { name: 'check_circle', color: Colors.primary, filled: true },
    missed: { name: 'info', color: Colors.error, filled: false },
    current: { name: 'radio_button_unchecked', color: Colors.onSurfaceVariant, filled: false },
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('notificationHistoryTitle')}
      sheetStyle={{ maxHeight: '70%' }}
    >
      {entries.length === 0 ? (
        <Text className="text-center text-on-surface-variant text-[13px] py-8 px-6">{t('notificationHistoryEmpty')}</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.waqt}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => {
            const icon = ICON[item.status];
            return (
              <View className="flex-row items-center gap-3 px-6 py-3 border-b border-surface-container-low">
                <Icon name={icon.name} filled={icon.filled} size={20} color={icon.color} />
                <View className="flex-1">
                  <Text className="text-on-surface text-[14px]">
                    {item.status === 'missed'
                      ? missedLine(item.waqt, locale, item.isJummah)
                      : startedLine(item.waqt, locale, item.isJummah)}
                  </Text>
                  <Text className="text-on-surface-variant text-[11px] mt-0.5">{item.time}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </BottomSheetModal>
  );
}
