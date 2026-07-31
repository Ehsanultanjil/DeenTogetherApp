import { useLocalSearchParams, useRouter } from 'expo-router';
import { MonthCalendarGrid } from '../../components/MonthCalendarGrid';
import { useT } from '../../lib/hooks/useT';

// Read-only view of a family member's calendar — MonthCalendarGrid handles
// both this and the personal Calendar tab; the day-detail panel it renders
// was already a plain read-only summary (checks/crosses, no toggles), same
// as the personal tab, so there's nothing extra to strip for "view only".
export default function MemberCalendarScreen() {
  const router = useRouter();
  const { userId, name } = useLocalSearchParams<{ userId: string; name?: string }>();
  const { t } = useT();

  return (
    <MonthCalendarGrid
      title={name ?? t('tabCalendar')}
      targetUserId={userId}
      contentPaddingBottom={32}
      onSeeMonthStats={(year, month) =>
        router.push({
          pathname: '/month-stats',
          params: { year: String(year), month: String(month), userId, name: name ?? '' },
        })
      }
    />
  );
}
