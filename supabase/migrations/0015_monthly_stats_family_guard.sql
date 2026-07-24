-- Tightens get_monthly_stats to match the RLS policies it sits next to
-- (prayer_logs/daily_deeds SELECT already restrict reads to self or a
-- shared family member via shares_family_with). Being SECURITY DEFINER,
-- this function's internal queries bypass RLS entirely and had no such
-- check — any authenticated user could previously call it with anyone's
-- p_user_id and read their monthly stats. Converts to plpgsql (from plain
-- sql) since the guard needs an IF/RAISE.

drop function if exists get_monthly_stats(uuid, int, int);

create function get_monthly_stats(
  p_user_id uuid default auth.uid(),
  p_year int default extract(year from current_date)::int,
  p_month int default extract(month from current_date)::int
)
returns table(prayers_done bigint, days_tracked bigint, best_streak int, month_progress numeric, quran_days bigint)
language plpgsql security definer stable set search_path = public as $$
begin
  if not (p_user_id = auth.uid() or shares_family_with(p_user_id)) then
    raise exception 'Not authorized to view this user''s stats';
  end if;

  return query
  with month_logs as (
    select * from prayer_logs
    where user_id = p_user_id
      and extract(year from prayer_date) = p_year
      and extract(month from prayer_date) = p_month
  ),
  daily as (
    select prayer_date, count(*) filter (where completed) as done_count
    from month_logs group by prayer_date
  ),
  full_days as (
    select prayer_date,
      prayer_date - (row_number() over (order by prayer_date))::int as grp
    from daily where done_count = 5
  ),
  streak_lengths as (
    select count(*) as len from full_days group by grp
  ),
  quran_month as (
    select count(*) as quran_days from daily_deeds
    where user_id = p_user_id
      and deed_type = 'quran'
      and completed
      and extract(year from deed_date) = p_year
      and extract(month from deed_date) = p_month
  )
  select
    (select count(*) from month_logs where completed)::bigint,
    (select count(*) from daily)::bigint,
    coalesce((select max(len) from streak_lengths), 0)::int,
    case when (select count(*) from daily) = 0 then 0::numeric
      else round((select count(*) from month_logs where completed)::numeric / ((select count(*) from daily) * 5) * 100)
    end,
    (select quran_days from quran_month)::bigint;
end;
$$;

revoke execute on function get_monthly_stats(uuid, int, int) from public;
grant execute on function get_monthly_stats(uuid, int, int) to authenticated;
