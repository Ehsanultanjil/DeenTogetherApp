-- Family tab per-waqt grid (green check / red cross per Fajr/Dhuhr/Asr/
-- Maghrib/Isha, like Home's ring row). "Missed" must be computed with each
-- member's OWN location + calc settings — adhan window math and tz-lookup
-- only exist client-side (lib/prayerTimes.ts), not in Postgres — so this
-- RPC ships raw ingredients only: each member's location/settings plus a
-- 3-day window of prayer_logs (server yesterday/today/tomorrow), wide
-- enough to contain whatever calendar day the client determines is "today"
-- at that member's own location. The client computes windows via
-- computePrayerTimes and picks the right day per member.
create or replace function get_family_prayer_grid(p_family_id uuid)
returns table(
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  last_latitude double precision,
  last_longitude double precision,
  calc_method text,
  madhab text,
  safety_margin_minutes smallint,
  logs jsonb
)
language plpgsql security definer stable set search_path = public as $$
begin
  if not is_family_member(p_family_id) then
    raise exception 'Not a member of this family';
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.avatar_url,
    fm.role,
    p.last_latitude,
    p.last_longitude,
    p.calc_method,
    p.madhab,
    p.safety_margin_minutes,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'prayer_date', pl.prayer_date,
        'prayer_name', pl.prayer_name,
        'completed', pl.completed
      ))
      from prayer_logs pl
      where pl.user_id = p.id
        and pl.prayer_date between current_date - 1 and current_date + 1
    ), '[]'::jsonb)
  from family_members fm
  join profiles p on p.id = fm.user_id
  where fm.family_id = p_family_id;
end;
$$;

revoke execute on function get_family_prayer_grid(uuid) from public;
grant execute on function get_family_prayer_grid(uuid) to authenticated;
