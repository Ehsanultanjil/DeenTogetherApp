-- RLS + helper functions + RPCs for DeenTogether.

alter table profiles enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table prayer_logs enable row level security;

-- ---------- Helper functions (SECURITY DEFINER to dodge RLS self-recursion) ----------

create or replace function is_family_member(p_family_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from family_members fm
    where fm.family_id = p_family_id and fm.user_id = p_user_id
  );
$$;

create or replace function shares_family_with(p_other_user_id uuid)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from family_members me
    join family_members them on me.family_id = them.family_id
    where me.user_id = auth.uid() and them.user_id = p_other_user_id
  );
$$;

-- ---------- RLS policies ----------

create policy profiles_select on profiles
  for select using (id = auth.uid() or shares_family_with(id));
create policy profiles_update on profiles
  for update using (id = auth.uid());

create policy families_select on families
  for select using (is_family_member(id));

create policy family_members_select on family_members
  for select using (user_id = auth.uid() or is_family_member(family_id));
create policy family_members_delete on family_members
  for delete using (user_id = auth.uid());

create policy prayer_logs_select on prayer_logs
  for select using (user_id = auth.uid() or shares_family_with(user_id));
create policy prayer_logs_insert on prayer_logs
  for insert with check (user_id = auth.uid());
create policy prayer_logs_update on prayer_logs
  for update using (user_id = auth.uid());

-- No insert/update policy on families, and no insert/role-update policy on
-- family_members: those only happen through the SECURITY DEFINER RPCs below.

-- ---------- RPCs ----------

create or replace function create_family(p_name text)
returns families
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_family families;
begin
  loop
    v_code := 'FAM-' || upper(substr(md5(random()::text), 1, 4));
    exit when not exists (select 1 from families where invite_code = v_code);
  end loop;

  insert into families (name, invite_code, created_by)
  values (p_name, v_code, auth.uid())
  returning * into v_family;

  insert into family_members (family_id, user_id, role)
  values (v_family.id, auth.uid(), 'admin');

  update profiles set current_family_id = v_family.id where id = auth.uid();

  return v_family;
end;
$$;

create or replace function join_family_by_code(p_code text)
returns family_members
language plpgsql security definer set search_path = public as $$
declare
  v_family_id uuid;
  v_member family_members;
begin
  select id into v_family_id from families where invite_code = p_code;
  if v_family_id is null then
    raise exception 'Invalid invite code';
  end if;

  if is_family_member(v_family_id) then
    raise exception 'Already a member of this family';
  end if;

  insert into family_members (family_id, user_id, role)
  values (v_family_id, auth.uid(), 'member')
  returning * into v_member;

  update profiles set current_family_id = v_family_id
  where id = auth.uid() and current_family_id is null;

  return v_member;
end;
$$;

create or replace function switch_current_family(p_family_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_family_member(p_family_id) then
    raise exception 'Not a member of this family';
  end if;
  update profiles set current_family_id = p_family_id where id = auth.uid();
end;
$$;

create or replace function leave_family(p_family_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_admin_count int;
begin
  select role into v_role from family_members
  where family_id = p_family_id and user_id = auth.uid();

  if v_role is null then
    raise exception 'Not a member of this family';
  end if;

  if v_role = 'admin' then
    select count(*) into v_admin_count from family_members
    where family_id = p_family_id and role = 'admin';
    if v_admin_count <= 1 then
      raise exception 'Cannot leave: you are the only admin. Promote another member first.';
    end if;
  end if;

  delete from family_members where family_id = p_family_id and user_id = auth.uid();

  update profiles set current_family_id = null
  where id = auth.uid() and current_family_id = p_family_id;
end;
$$;

create or replace function ensure_today_prayer_rows(p_date date default current_date)
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into prayer_logs (user_id, prayer_date, prayer_name, completed)
  select auth.uid(), p_date, name, false
  from unnest(array['fajr','dhuhr','asr','maghrib','isha']) as name
  on conflict (user_id, prayer_date, prayer_name) do nothing;
end;
$$;

create or replace function get_current_streak(p_user_id uuid default auth.uid())
returns integer
language plpgsql security definer stable set search_path = public as $$
declare
  streak integer := 0;
  check_date date := current_date;
  done_count integer;
begin
  loop
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

create or replace function get_monthly_stats(
  p_user_id uuid default auth.uid(),
  p_year int default extract(year from current_date)::int,
  p_month int default extract(month from current_date)::int
)
returns table(prayers_done bigint, days_tracked bigint, best_streak int, month_progress numeric)
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
  )
  select
    (select count(*) from month_logs where completed)::bigint,
    (select count(*) from daily)::bigint,
    coalesce((select max(len) from streak_lengths), 0)::int,
    case when (select count(*) from daily) = 0 then 0::numeric
      else round((select count(*) from month_logs where completed)::numeric / ((select count(*) from daily) * 5) * 100)
    end;
$$;

create or replace function get_family_today_status(p_family_id uuid)
returns table(user_id uuid, full_name text, avatar_url text, role text, completed_count bigint, percent numeric)
language sql security definer stable set search_path = public as $$
  select
    p.id,
    p.full_name,
    p.avatar_url,
    fm.role,
    coalesce(pl.completed_count, 0),
    coalesce(round(pl.completed_count::numeric / 5 * 100), 0)
  from family_members fm
  join profiles p on p.id = fm.user_id
  left join (
    select user_id, count(*) filter (where completed) as completed_count
    from prayer_logs
    where prayer_date = current_date
    group by user_id
  ) pl on pl.user_id = fm.user_id
  where fm.family_id = p_family_id
    and is_family_member(p_family_id);
$$;

-- ---------- Grants ----------
-- Client-callable functions: authenticated users only, not anon.

revoke execute on function is_family_member(uuid, uuid) from public;
revoke execute on function shares_family_with(uuid) from public;
revoke execute on function create_family(text) from public;
revoke execute on function join_family_by_code(text) from public;
revoke execute on function switch_current_family(uuid) from public;
revoke execute on function leave_family(uuid) from public;
revoke execute on function ensure_today_prayer_rows(date) from public;
revoke execute on function get_current_streak(uuid) from public;
revoke execute on function get_monthly_stats(uuid, int, int) from public;
revoke execute on function get_family_today_status(uuid) from public;

grant execute on function is_family_member(uuid, uuid) to authenticated;
grant execute on function shares_family_with(uuid) to authenticated;
grant execute on function create_family(text) to authenticated;
grant execute on function join_family_by_code(text) to authenticated;
grant execute on function switch_current_family(uuid) to authenticated;
grant execute on function leave_family(uuid) to authenticated;
grant execute on function ensure_today_prayer_rows(date) to authenticated;
grant execute on function get_current_streak(uuid) to authenticated;
grant execute on function get_monthly_stats(uuid, int, int) to authenticated;
grant execute on function get_family_today_status(uuid) to authenticated;
