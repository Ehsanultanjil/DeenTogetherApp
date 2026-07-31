-- Onboarding gender question + a private "period pause" toggle for female
-- users: while paused, salah isn't required and paused days are excluded
-- entirely from streak/monthly-percentage math (never counted as broken,
-- never counted as tracked). period_pauses is intentionally NOT covered by
-- shares_family_with anywhere in this migration — family members must never
-- be able to see or infer this data. The two stats RPCs below are the only
-- places that read it, and only ever when the caller is looking at their
-- OWN stats (p_user_id = auth.uid()); a family member viewing someone
-- else's stats via shares_family_with gets the original, unmodified
-- calculation, so nothing about a pause ever leaks to family.

alter table profiles
  add column if not exists gender text check (gender in ('male','female','prefer_not_to_say'));

create table if not exists period_pauses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  start_date  date not null,
  end_date    date, -- null = currently active/ongoing
  created_at  timestamptz not null default now()
);

alter table period_pauses enable row level security;

-- Strictly self-only — no family-sharing policy exists here on purpose.
create policy period_pauses_all on period_pauses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke execute on function get_monthly_stats(uuid, int, int) from public;
revoke execute on function get_current_streak(uuid) from public;

create or replace function get_monthly_stats(
  p_user_id uuid default auth.uid(),
  p_year int default extract(year from current_date)::int,
  p_month int default extract(month from current_date)::int
)
returns table(prayers_done bigint, days_tracked bigint, best_streak int, month_progress numeric, quran_days bigint)
language plpgsql security definer stable set search_path = public as $$
declare
  v_self boolean := (p_user_id = auth.uid());
begin
  if not (v_self or shares_family_with(p_user_id)) then
    raise exception 'Not authorized to view this user''s stats';
  end if;

  return query
  with month_logs as (
    select pl.* from prayer_logs pl
    where pl.user_id = p_user_id
      and extract(year from pl.prayer_date) = p_year
      and extract(month from pl.prayer_date) = p_month
      and (not v_self or not exists (
        select 1 from period_pauses pp
        where pp.user_id = p_user_id
          and pl.prayer_date >= pp.start_date
          and pl.prayer_date <= coalesce(pp.end_date, pl.prayer_date)
      ))
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
    (select quran_month.quran_days from quran_month)::bigint;
end;
$$;

grant execute on function get_monthly_stats(uuid, int, int) to authenticated;

-- Rebuilt on top of 0020_streak_family_guard.sql's authorization check
-- (any authenticated caller could otherwise read an arbitrary user's streak
-- via a hand-supplied p_user_id — SECURITY DEFINER bypasses RLS entirely,
-- so that guard has to live in the function body). Pause-exclusion is
-- layered on top of that unchanged, self-only as with get_monthly_stats.
create or replace function get_current_streak(p_user_id uuid default auth.uid())
returns integer
language plpgsql security definer stable set search_path = public as $$
declare
  v_self boolean := (p_user_id = auth.uid());
  streak integer := 0;
  check_date date := current_date;
  done_count integer;
  is_paused boolean;
begin
  if not (v_self or shares_family_with(p_user_id)) then
    raise exception 'Not authorized to view this user''s streak';
  end if;

  loop
    is_paused := false;
    if v_self then
      select exists (
        select 1 from period_pauses pp
        where pp.user_id = p_user_id
          and check_date >= pp.start_date
          and check_date <= coalesce(pp.end_date, check_date)
      ) into is_paused;
    end if;

    if is_paused then
      -- Paused days are skipped entirely — neither extend nor break streak.
      check_date := check_date - 1;
      continue;
    end if;

    select count(*) filter (where completed) into done_count
    from prayer_logs where user_id = p_user_id and prayer_date = check_date;

    if done_count = 5 then
      streak := streak + 1;
      check_date := check_date - 1;
    elsif check_date = current_date then
      -- today isn't finished yet; that alone shouldn't break an existing streak
      check_date := check_date - 1;
    else
      exit;
    end if;
  end loop;
  return streak;
end;
$$;

grant execute on function get_current_streak(uuid) to authenticated;
