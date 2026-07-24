-- Guard called by the delete-account Edge Function before it touches
-- auth.users — mirrors leave_family's sole-admin protection (0002) so
-- deleting your account can't silently orphan a family you administer.
create or replace function assert_account_deletable()
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_family_name text;
begin
  select f.name into v_family_name
  from family_members fm
  join families f on f.id = fm.family_id
  where fm.user_id = auth.uid()
    and fm.role = 'admin'
    and (select count(*) from family_members fm2 where fm2.family_id = fm.family_id and fm2.role = 'admin') <= 1
  limit 1;

  if v_family_name is not null then
    raise exception 'You are the only admin of "%". Delete that family or promote another member first.', v_family_name;
  end if;
end;
$$;

revoke execute on function assert_account_deletable() from public;
grant execute on function assert_account_deletable() to authenticated;
