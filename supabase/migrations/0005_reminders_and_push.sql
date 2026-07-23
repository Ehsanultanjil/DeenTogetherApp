-- Push tokens (one row per device) and family prayer reminders ("Remind").

create table if not exists push_tokens (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  expo_push_token   text not null unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table push_tokens enable row level security;

create policy push_tokens_select on push_tokens
  for select using (user_id = auth.uid());
create policy push_tokens_insert on push_tokens
  for insert with check (user_id = auth.uid());
create policy push_tokens_update on push_tokens
  for update using (user_id = auth.uid());
create policy push_tokens_delete on push_tokens
  for delete using (user_id = auth.uid());

create table if not exists prayer_reminders (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references profiles(id) on delete cascade,
  recipient_id  uuid not null references profiles(id) on delete cascade,
  prayer_name   text not null check (prayer_name in ('fajr','dhuhr','asr','maghrib','isha')),
  prayer_date   date not null,
  created_at    timestamptz not null default now()
);

alter table prayer_reminders enable row level security;

create policy prayer_reminders_select on prayer_reminders
  for select using (sender_id = auth.uid() or recipient_id = auth.uid());

-- No direct insert policy — reminders are only ever created through
-- send_prayer_reminder below, which enforces the family-membership,
-- not-already-completed, and 30-minute-cooldown rules server-side (never
-- trust the client for spam prevention).

create or replace function send_prayer_reminder(
  p_recipient_id uuid,
  p_prayer_name text,
  p_prayer_date date
)
returns prayer_reminders
language plpgsql security definer set search_path = public as $$
declare
  v_reminder prayer_reminders;
  v_already_completed boolean;
  v_last_reminded_at timestamptz;
begin
  if p_recipient_id = auth.uid() then
    raise exception 'Cannot remind yourself';
  end if;

  if not shares_family_with(p_recipient_id) then
    raise exception 'Not in the same family';
  end if;

  select coalesce(completed, false) into v_already_completed
  from prayer_logs
  where user_id = p_recipient_id and prayer_date = p_prayer_date and prayer_name = p_prayer_name;

  if coalesce(v_already_completed, false) then
    raise exception 'Prayer already completed';
  end if;

  select max(created_at) into v_last_reminded_at
  from prayer_reminders
  where sender_id = auth.uid() and recipient_id = p_recipient_id;

  if v_last_reminded_at is not null and v_last_reminded_at > now() - interval '30 minutes' then
    raise exception 'Reminder cooldown active';
  end if;

  insert into prayer_reminders (sender_id, recipient_id, prayer_name, prayer_date)
  values (auth.uid(), p_recipient_id, p_prayer_name, p_prayer_date)
  returning * into v_reminder;

  return v_reminder;
end;
$$;

revoke execute on function send_prayer_reminder(uuid, text, date) from public;
grant execute on function send_prayer_reminder(uuid, text, date) to authenticated;

-- Recreate get_family_today_status with two added output columns (needs
-- DROP since the OUT list is changing) and one added input param: the
-- caller's current waqt, computed client-side (same getCurrentWaqt logic
-- Home already uses) since prayer-time calculation depends on each user's
-- own GPS location, which the server doesn't have.
drop function if exists get_family_today_status(uuid);

create function get_family_today_status(p_family_id uuid, p_current_prayer text default null)
returns table(
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  completed_count bigint,
  percent numeric,
  current_prayer_completed boolean,
  last_reminded_at timestamptz
)
language sql security definer stable set search_path = public as $$
  select
    p.id,
    p.full_name,
    p.avatar_url,
    fm.role,
    coalesce(pl.completed_count, 0),
    coalesce(round(pl.completed_count::numeric / 5 * 100), 0),
    coalesce(cp.completed, false),
    lr.last_reminded_at
  from family_members fm
  join profiles p on p.id = fm.user_id
  left join (
    select user_id, count(*) filter (where completed) as completed_count
    from prayer_logs
    where prayer_date = current_date
    group by user_id
  ) pl on pl.user_id = fm.user_id
  left join prayer_logs cp
    on cp.user_id = fm.user_id and cp.prayer_date = current_date and cp.prayer_name = p_current_prayer
  left join lateral (
    select max(created_at) as last_reminded_at
    from prayer_reminders pr
    where pr.sender_id = auth.uid() and pr.recipient_id = fm.user_id
  ) lr on true
  where fm.family_id = p_family_id
    and is_family_member(p_family_id);
$$;

revoke execute on function get_family_today_status(uuid, text) from public;
grant execute on function get_family_today_status(uuid, text) to authenticated;
