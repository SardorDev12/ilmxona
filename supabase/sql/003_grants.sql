-- Ilmxona — table privileges for the API roles.
--
-- Run this in the Supabase SQL editor after 001 and 002.
--
-- Postgres checks two independent things before returning a row:
--
--   1. GRANT   — may this role touch the table at all?
--   2. RLS     — which rows of it may this role see?
--
-- 001 set up the policies but no grants, so PostgREST failed at step 1
-- with "permission denied for table profiles" (SQLSTATE 42501) and never
-- reached the policies. The SQL editor runs as a privileged role that
-- bypasses both, which is why the rows looked present there.

grant usage on schema public to anon, authenticated;

-- Profiles are public: contributor pages are readable when signed out.
grant select on table public.profiles to anon, authenticated;

-- Deliberately column-scoped. The "Users can update their own profile"
-- policy in 001 restricts which *row* a user may update, but not which
-- columns — so a blanket `grant update` would let any signed-in user set
-- their own role to ADMIN. Withholding the column is what prevents it.
grant update (username, display_name, avatar_url, bio)
  on table public.profiles to authenticated;

-- Reading is still gated by the admin/moderator policy from 001.
grant select on table public.audit_logs to authenticated;

-- Tables added later inherit these, so a new table does not repeat the
-- same failure. Row visibility still has to be granted per table via RLS.
alter default privileges in schema public
  grant select on tables to anon, authenticated;
