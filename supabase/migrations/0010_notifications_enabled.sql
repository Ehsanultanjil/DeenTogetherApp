-- Master switch for local prayer-time notifications, independent of the
-- OS-level permission. Defaults to true so existing users keep the
-- already-on behavior; usePrayerNotifications gates scheduling on this.
alter table profiles
  add column notifications_enabled boolean not null default true;
