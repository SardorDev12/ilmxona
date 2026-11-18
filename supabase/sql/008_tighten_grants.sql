-- 008_tighten_grants.sql
--
-- SECURITY FIX. Any signed-in user could make themselves ADMIN:
--
--   supabase.from('profiles').update({ role: 'ADMIN' }).eq('id', myId)
--
-- 003_grants.sql granted `authenticated` UPDATE on four columns of
-- profiles precisely so that `role` could not be one of them. But a
-- Supabase project ships with default privileges on the public schema:
--
--   alter default privileges for role postgres in schema public
--     grant all on tables to postgres, anon, authenticated, service_role;
--
-- Those apply to every table created afterwards, so profiles was born
-- with a blanket UPDATE for `authenticated`. Grants are additive: the
-- narrow grant in 003 added nothing that was not already there, and the
-- RLS policy "users can update their own profile" then let the write
-- through. The user came out an ADMIN, passing is_moderator() and able
-- to publish their own work and delete anyone's course.
--
-- Fixed in two independent layers, because one of them already failed:
--   1. Privileges: revoke the blanket grants, re-grant exactly what is
--      intended, and stop future tables inheriting the same defaults.
--   2. A trigger that refuses a role change from the API roles outright,
--      so the rule survives the next time a grant is widened by accident.
--
-- Apply after 007_course_review.sql.

-- ------------------------------------------------- 1. privileges, exactly

revoke all on public.profiles      from anon, authenticated;
revoke all on public.audit_logs    from anon, authenticated;
revoke all on public.courses       from anon, authenticated;
revoke all on public.modules       from anon, authenticated;
revoke all on public.lessons       from anon, authenticated;
revoke all on public.glossary_terms from anon, authenticated;
revoke all on public.learning_paths from anon, authenticated;
revoke all on public.learning_path_courses from anon, authenticated;

-- Reading is public; RLS decides which rows.
grant select on public.profiles, public.courses, public.modules,
                public.lessons, public.glossary_terms,
                public.learning_paths, public.learning_path_courses
  to anon, authenticated;

-- A signed-in user edits their own profile — but never their own role.
grant update (username, display_name, avatar_url, bio)
  on public.profiles to authenticated;

-- The audit log is readable only by admins, and only via RLS.
grant select on public.audit_logs to authenticated;

-- Authoring. RLS restricts these to the author's own rows, and the
-- `with check` clauses in 006 are what keep PUBLISHED out of reach.
grant insert, update, delete on public.courses, public.modules,
                public.lessons, public.glossary_terms,
                public.learning_paths, public.learning_path_courses
  to authenticated;

-- The admin client (service role) changes roles and writes audit rows.
-- Granted explicitly rather than left to Supabase's defaults, so the
-- feature does not depend on a privilege this repo never asked for.
grant select, insert, update, delete on public.profiles, public.audit_logs
  to service_role;
grant select, insert, update, delete on public.courses, public.modules,
                public.lessons, public.glossary_terms,
                public.learning_paths, public.learning_path_courses
  to service_role;

-- Stop the next table inheriting a blanket grant the same way. New
-- tables must name their privileges, as the ones above now do.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

-- 003 set this when the only table was profiles; it would hand every
-- future table a read grant before anyone decided it should be public.
alter default privileges in schema public
  revoke select on tables from anon, authenticated;

-- ------------------------------------------------ 2. the role guard

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only the API roles are restricted. service_role is the admin client,
  -- and postgres is whoever is typing in the SQL editor — including the
  -- person bootstrapping the very first administrator.
  if current_user in ('anon', 'authenticated')
     and new.role is distinct from old.role
     and public.current_user_role() <> 'ADMIN'
  then
    raise exception 'Rolni faqat administrator o''zgartira oladi'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ------------------------------------------------------ 3. verification
--
-- Run this afterwards. It must return exactly four rows —
-- avatar_url, bio, display_name, username — and nothing else:
--
--   select column_name
--     from information_schema.column_privileges
--    where grantee = 'authenticated'
--      and table_name = 'profiles'
--      and privilege_type = 'UPDATE'
--    order by column_name;
