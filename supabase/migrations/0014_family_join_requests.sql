-- Joining by invite code now requires admin approval instead of adding the
-- requester to family_members immediately.

create table if not exists family_join_requests (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  unique (family_id, user_id)
);

alter table family_join_requests enable row level security;

-- The requester can see their own request; a family's admins can see every
-- request against that family (to review it). No insert/update policy —
-- only the security-definer RPCs below ever write to this table.
create policy family_join_requests_select on family_join_requests
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from family_members fm
      where fm.family_id = family_join_requests.family_id and fm.user_id = auth.uid() and fm.role = 'admin'
    )
  );

-- Return type changes from family_members to family_join_requests, which
-- CREATE OR REPLACE can't do — must drop first.
drop function if exists join_family_by_code(text);

create function join_family_by_code(p_code text)
returns family_join_requests
language plpgsql security definer set search_path = public as $$
declare
  v_family_id uuid;
  v_request family_join_requests;
begin
  select id into v_family_id from families where invite_code = p_code;
  if v_family_id is null then
    raise exception 'Invalid invite code';
  end if;

  if is_family_member(v_family_id) then
    raise exception 'Already a member of this family';
  end if;

  -- Re-requesting after a decline (or after leaving a family you were once
  -- approved into) resets the same row instead of erroring on the unique
  -- constraint; a genuinely still-pending request is left alone and
  -- reported back as "already pending" below.
  insert into family_join_requests (family_id, user_id, status, created_at, resolved_at)
  values (v_family_id, auth.uid(), 'pending', now(), null)
  on conflict (family_id, user_id) do update
    set status = 'pending', created_at = now(), resolved_at = null
    where family_join_requests.status <> 'pending'
  returning * into v_request;

  if v_request is null then
    raise exception 'A join request is already pending for this family';
  end if;

  return v_request;
end;
$$;

create or replace function get_pending_join_requests(p_family_id uuid)
returns table(id uuid, user_id uuid, full_name text, avatar_url text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select r.id, r.user_id, p.full_name, p.avatar_url, r.created_at
  from family_join_requests r
  join profiles p on p.id = r.user_id
  where r.family_id = p_family_id
    and r.status = 'pending'
    and exists (
      select 1 from family_members fm
      where fm.family_id = p_family_id and fm.user_id = auth.uid() and fm.role = 'admin'
    )
  order by r.created_at asc;
$$;

create or replace function respond_to_join_request(p_request_id uuid, p_approve boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_request family_join_requests;
  v_caller_role text;
begin
  select * into v_request from family_join_requests where id = p_request_id;
  if v_request is null then
    raise exception 'Join request not found';
  end if;

  select role into v_caller_role from family_members
  where family_id = v_request.family_id and user_id = auth.uid();

  if v_caller_role is distinct from 'admin' then
    raise exception 'Only an admin can respond to join requests';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'This request has already been resolved';
  end if;

  if p_approve then
    insert into family_members (family_id, user_id, role)
    values (v_request.family_id, v_request.user_id, 'member')
    on conflict do nothing;

    update profiles set current_family_id = v_request.family_id
    where id = v_request.user_id and current_family_id is null;

    update family_join_requests set status = 'approved', resolved_at = now() where id = p_request_id;
  else
    update family_join_requests set status = 'declined', resolved_at = now() where id = p_request_id;
  end if;
end;
$$;

revoke execute on function join_family_by_code(text) from public;
revoke execute on function get_pending_join_requests(uuid) from public;
revoke execute on function respond_to_join_request(uuid, boolean) from public;

grant execute on function join_family_by_code(text) to authenticated;
grant execute on function get_pending_join_requests(uuid) to authenticated;
grant execute on function respond_to_join_request(uuid, boolean) to authenticated;
