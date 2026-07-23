-- Quran daily tracker. Deliberately mirrors prayer_logs' shape (one row per
-- user/day/deed) rather than a bespoke quran_logs table, and deed_type is a
-- widenable check constraint — adding a future optional deed (Adhkar,
-- Tahajjud, ...) later is just adding to that list, not a schema change.
create table if not exists daily_deeds (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  deed_date    date not null,
  deed_type    text not null check (deed_type in ('quran')),
  completed    boolean not null default false,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique (user_id, deed_date, deed_type)
);

alter table daily_deeds enable row level security;

create policy daily_deeds_select on daily_deeds
  for select using (user_id = auth.uid() or shares_family_with(user_id));
create policy daily_deeds_insert on daily_deeds
  for insert with check (user_id = auth.uid());
create policy daily_deeds_update on daily_deeds
  for update using (user_id = auth.uid());

-- Recreate get_monthly_stats with an added quran_days column. DROP is
-- required (not just create-or-replace) because the OUT column list is
-- changing, which also means its execute grants need to be re-applied below.
drop function if exists get_monthly_stats(uuid, int, int);

create function get_monthly_stats(
  p_user_id uuid default auth.uid(),
  p_year int default extract(year from current_date)::int,
  p_month int default extract(month from current_date)::int
)
returns table(prayers_done bigint, days_tracked bigint, best_streak int, month_progress numeric, quran_days bigint)
language sql security definer stable set search_path = public as $$
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
$$;

revoke execute on function get_monthly_stats(uuid, int, int) from public;
grant execute on function get_monthly_stats(uuid, int, int) to authenticated;
