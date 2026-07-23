-- Onboarding gate: new Google sign-ins need one extra step (display name +
-- avatar) since Google doesn't collect either the way our signup form
-- does. Email/password signup already asks for full_name up front and
-- passes onboarding_completed: true in its signUp() call, so that path is
-- unaffected — see app/(auth)/signup.tsx.
alter table profiles add column if not exists onboarding_completed boolean not null default false;

-- Backfill: anyone who already has a name is a pre-existing user, not
-- someone who should suddenly be sent through onboarding.
update profiles set onboarding_completed = true where full_name is not null;

create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, avatar_url, onboarding_completed)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce((new.raw_user_meta_data ->> 'onboarding_completed')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
