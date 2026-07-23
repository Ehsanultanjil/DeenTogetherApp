-- Configurable per-user delay (in minutes) applied on top of the exact
-- adhan calculation for Fajr/Dhuhr/Asr/Maghrib/Isha (never Sunrise), so a
-- prayer only shows as "started" once its calculated time has safely
-- passed. Defaults to +1 minute for both new and existing users.
alter table profiles
  add column safety_margin_minutes smallint not null default 1
    constraint safety_margin_minutes_range check (safety_margin_minutes between 0 and 5);
