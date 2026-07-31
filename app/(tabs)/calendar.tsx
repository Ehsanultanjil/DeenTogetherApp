import { useRouter } from 'expo-router';
import { MonthCalendarGrid } from '../../components/MonthCalendarGrid';
import { useTabBarHeight } from '../../lib/hooks/useTabBarHeight';
import { useT } from '../../lib/hooks/useT';

export default function CalendarScreen() {
  const router = useRouter();
  const { t } = useT();
  const tabBarHeight = useTabBarHeight();

  return (
    <MonthCalendarGrid
      title={t('tabCalendar')}
      contentPaddingBottom={tabBarHeight + 16}
      onSeeMonthStats={(year, month) =>
        router.push({ pathname: '/month-stats', params: { year: String(year), month: String(month) } })
      }
    />
  );
}
