-- DeenTogether core schema.
-- Multi-family-per-user model: family_members has no unique(user_id),
-- profiles.current_family_id tracks which family drives the Home/Family screens.

create table if not exists profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  avatar_url         text,
  current_family_id  uuid, -- fk added after families exists
  calc_method        text default 'MuslimWorldLeague',
  madhab             text check (madhab in ('hanafi','maliki','shafii','hanbali')) default 'shafii',
  last_latitude      double precision,
  last_longitude     double precision,
  created_at         timestamptz not null default now()
);

create table if not exists families (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  invite_code   text not null unique,
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now()
);

alter table profiles
  add constraint profiles_current_family_id_fkey
  foreign key (current_family_id) references families(id) on delete set null;

create table if not exists family_members (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        text not null check (role in ('admin','member')) default 'member',
  joined_at   timestamptz not null default now(),
  unique (family_id, user_id)
);

create table if not exists prayer_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  prayer_date    date not null,
  prayer_name    text not null check (prayer_name in ('fajr','dhuhr','asr','maghrib','isha')),
  completed      boolean not null default false,
  completed_at   timestamptz,
  updated_at     timestamptz not null default now(),
  unique (user_id, prayer_date, prayer_name)
);

-- Auto-create a profile row whenever a new auth user signs up
-- (covers both email/password and OAuth signups).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
