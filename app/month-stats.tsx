import { ScrollView, View } from 'react-native';
import { Text } from '../components/Text';
import { TopAppBar } from '../components/TopAppBar';
import { ProgressRing } from '../components/ProgressRing';
import { Icon } from '../components/Icon';
import { useColors } from '../constants/theme';
import { useMonthlyStats } from '../lib/hooks/useMonthlyStats';
import { useT } from '../lib/hooks/useT';
import { useLocalSearchParams } from 'expo-router';
import type { MaterialSymbolName } from '../constants/materialSymbols';

export default function MonthStatsScreen() {
  const { t, n, localeTag } = useT();
  const Colors = useColors();
  const params = useLocalSearchParams<{ year: string; month: string; userId?: string; name?: string }>();
  const year = Number(params.year);
  const month = Number(params.month);
  const { data: stats } = useMonthlyStats(year, month, params.userId);

  const monthLabel =
    year && month ? new Date(year, month - 1, 1).toLocaleDateString(localeTag, { month: 'long', year: 'numeric' }) : '';

  const rows: { icon: MaterialSymbolName; color: string; label: string; value: string }[] = [
    { icon: 'check_circle', color: Colors.primary, label: t('prayersDoneStat'), value: n(stats?.prayersDone ?? 0) },
    { icon: 'local_fire_department', color: '#f97316', label: t('bestStreak'), value: n(stats?.bestStreak ?? 0) },
    { icon: 'visibility', color: Colors.secondary, label: t('daysTracked'), value: n(stats?.daysTracked ?? 0) },
    { icon: 'menu_book', color: '#D4AF37', label: t('quranDaysStat'), value: n(stats?.quranDays ?? 0) },
  ];

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={params.name || t('thisMonth')} dateText={monthLabel} />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        <View className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-low">
          <View className="flex-row items-center gap-4 pb-4 mb-1 border-b border-surface-container-low">
            <ProgressRing size={64} strokeWidth={7} progress={stats?.monthProgress ?? 0}>
              <Icon name="analytics" size={20} color={Colors.onSurfaceVariant} />
            </ProgressRing>
            <View>
              <Text className="text-[13px] text-on-surface-variant">{t('monthProgress')}</Text>
              <Text className="text-[28px] font-bold text-primary">{n(stats?.monthProgress ?? 0)}%</Text>
            </View>
          </View>
          {rows.map((row, idx) => (
            <View
              key={row.label}
              className={`flex-row items-center justify-between py-3 ${
                idx !== rows.length - 1 ? 'border-b border-surface-container-low' : ''
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Icon name={row.icon} color={row.color} size={20} />
                <Text className="text-[14px] text-on-surface">{row.label}</Text>
              </View>
              <Text className="text-[14px] font-bold text-on-surface">{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
