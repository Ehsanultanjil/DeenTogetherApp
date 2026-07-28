-- family_join_requests was never added to the realtime publication, so
-- admins never got a live event for new/resolved join requests — only
-- prayer_logs and family_members were wired up in 0003_realtime.sql. Client
-- had to be closed and reopened to see pending requests.

alter publication supabase_realtime add table family_join_requests;
