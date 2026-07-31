-- get_current_streak had the same gap get_monthly_stats had before 0015:
-- SECURITY DEFINER bypasses RLS entirely, and the function took a
-- caller-supplied p_user_id with no check that the caller owns that id or
-- shares a family with them. Any authenticated user could call this RPC
-- directly with an arbitrary UUID and read that person's prayer streak.
-- Apply the same shares_family_with guard used in get_monthly_stats.

create or replace function get_current_streak(p_user_id uuid default auth.uid())
returns integer
language plpgsql security definer stable set search_path = public as $$
declare
  streak integer := 0;
  check_date date := current_date;
  done_count integer;
begin
  if not (p_user_id = auth.uid() or shares_family_with(p_user_id)) then
    raise exception 'Not authorized to view this user''s streak';
  end if;

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

revoke execute on function get_current_streak(uuid) from public;
grant execute on function get_current_streak(uuid) to authenticated;
