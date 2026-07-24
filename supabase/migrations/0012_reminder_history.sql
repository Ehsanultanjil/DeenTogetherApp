-- Reminder history for the Home bell icon: today's reminders received by
-- the caller, sender name/avatar included so the client needs no extra
-- round trips. Prior days are swept lazily on each call rather than via a
-- separate cron job — simplest thing that satisfies "auto-deleted daily"
-- without depending on pg_cron being available on the project's plan.

create or replace function get_my_reminders_today()
returns table(
  id uuid,
  sender_id uuid,
  sender_name text,
  sender_avatar_url text,
  prayer_name text,
  created_at timestamptz
)
language plpgsql security definer set search_path = public as $$
begin
  delete from prayer_reminders
  where recipient_id = auth.uid() and prayer_date < current_date;

  return query
    select pr.id, pr.sender_id, p.full_name, p.avatar_url, pr.prayer_name, pr.created_at
    from prayer_reminders pr
    join profiles p on p.id = pr.sender_id
    where pr.recipient_id = auth.uid() and pr.prayer_date = current_date
    order by pr.created_at desc;
end;
$$;

revoke execute on function get_my_reminders_today() from public;
grant execute on function get_my_reminders_today() to authenticated;
