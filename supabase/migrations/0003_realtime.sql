-- Enable Realtime for live family-status updates on Home/Family screens.
-- Supabase Realtime postgres_changes only fires for tables explicitly
-- added to this publication, and (with RLS enabled, as ours is) only
-- delivers rows the subscribing client is allowed to SELECT.
alter publication supabase_realtime add table prayer_logs;
alter publication supabase_realtime add table family_members;
