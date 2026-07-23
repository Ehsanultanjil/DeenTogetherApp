-- Lets a family admin either hand off admin to another member (so they can
-- then leave via the existing leave_family, which already blocks a sole
-- admin from leaving) or delete the family outright for everyone. Same
-- security-definer + role-check + revoke/grant pattern as every other RPC
-- in 0002_rls_and_functions.sql.

create or replace function promote_member(p_family_id uuid, p_new_admin_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_caller_role text;
begin
  select role into v_caller_role from family_members
  where family_id = p_family_id and user_id = auth.uid();

  if v_caller_role is distinct from 'admin' then
    raise exception 'Only an admin can promote another member';
  end if;

  if not exists (
    select 1 from family_members where family_id = p_family_id and user_id = p_new_admin_id
  ) then
    raise exception 'Not a member of this family';
  end if;

  update family_members set role = 'admin'
  where family_id = p_family_id and user_id = p_new_admin_id;
end;
$$;

create or replace function delete_family(p_family_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_caller_role text;
begin
  select role into v_caller_role from family_members
  where family_id = p_family_id and user_id = auth.uid();

  if v_caller_role is distinct from 'admin' then
    raise exception 'Only an admin can delete this family';
  end if;

  -- family_members.family_id and profiles.current_family_id both cascade
  -- (on delete cascade / on delete set null) — no manual cleanup needed.
  delete from families where id = p_family_id;
end;
$$;

revoke execute on function promote_member(uuid, uuid) from public;
revoke execute on function delete_family(uuid) from public;

grant execute on function promote_member(uuid, uuid) to authenticated;
grant execute on function delete_family(uuid) to authenticated;
