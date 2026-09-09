-- Ilmxona — collapse five roles into four.
--
-- Run in the Supabase SQL editor after 004.
--
--   USER      read, learn, and draft content for review
--   CREATOR   a user whose content has been published
--   MODERATOR reviews submissions, handles reports and comments
--   ADMIN     everything, including assigning roles
--
-- CONTRIBUTOR and REVIEWER are gone: anyone signed in may now draft and
-- submit content, so a separate "contributor" tier no longer gates
-- anything, and reviewing is a moderator duty.
--
-- Postgres cannot drop a value from an enum in place, so this swaps the
-- type. Existing rows are mapped:
--   CONTRIBUTOR -> CREATOR    (they were authors)
--   REVIEWER    -> MODERATOR  (reviewing is now moderation)

-- The audit_logs policy compares against the old type, so it has to go
-- before the type can be dropped, and comes back after.
drop policy if exists "Only admins/moderators can read audit logs"
  on public.audit_logs;

create type public.role_new as enum ('USER', 'CREATOR', 'MODERATOR', 'ADMIN');

alter table public.profiles alter column role drop default;

alter table public.profiles
  alter column role type public.role_new
  using (
    case role::text
      when 'CONTRIBUTOR' then 'CREATOR'
      when 'REVIEWER'    then 'MODERATOR'
      else role::text
    end
  )::public.role_new;

alter table public.profiles alter column role set default 'USER';

drop type public.role;
alter type public.role_new rename to role;

-- Recreate against the new type.
create policy "Only admins/moderators can read audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('ADMIN', 'MODERATOR')
    )
  );

-- Role changes go through a server action using the service role, which
-- bypasses RLS. No grant on the column is added here on purpose: leaving
-- it ungranted is what stops a signed-in user promoting themselves
-- through the REST API (see 003).
