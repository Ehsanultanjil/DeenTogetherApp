-- leave_family always set current_family_id to null when you left your
-- current family, even if you still belonged to other families. The client
-- only loads family-tab data (members, invite code, prayer grid) for
-- current_family_id, and only shows the family switcher pills when there's
-- more than one membership — so with current_family_id null, a user in
-- multiple families would see every family vanish after leaving just one,
-- until they rejoined and current_family_id got set again. Now leaving picks
-- another remaining membership (oldest-joined) as the new current family,
-- falling back to null only when none are left.

create or replace function leave_family(p_family_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_role text;
  v_admin_count int;
  v_next_family_id uuid;
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

  select family_id into v_next_family_id from family_members
  where user_id = auth.uid()
  order by joined_at asc
  limit 1;

  update profiles set current_family_id = v_next_family_id
  where id = auth.uid() and current_family_id = p_family_id;
end;
$$;
