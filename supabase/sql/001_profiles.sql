-- Ilmxona — Phase 1 schema: profiles, roles, audit log
--
-- Run this in the Supabase SQL editor (or `supabase db execute -f`).
-- These files are the source of truth for the database schema; apply them
-- in filename order.
--
-- Auth users themselves live in Supabase's `auth.users`. `profiles.id`
-- mirrors `auth.users.id` 1:1 and is populated by the trigger below.

-- 1. Roles (docs/PRD.md §28). "Visitor" isn't stored — it's the absence
--    of a session.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'role') then
    create type public.role as enum (
      'USER',
      'CONTRIBUTOR',
      'REVIEWER',
      'MODERATOR',
      'ADMIN'
    );
  end if;
end
$$;

-- 2. Profiles
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique,
  display_name text,
  avatar_url   text,
  bio          text,
  role         public.role not null default 'USER',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3. Audit log — administrative actions (role changes, suspensions,
--    moderation, ...). Written to by admin server actions in later phases.
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references public.profiles (id),
  action      text not null,
  target_type text not null,
  target_id   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_actor_id_idx
  on public.audit_logs (actor_id);
create index if not exists audit_logs_target_idx
  on public.audit_logs (target_type, target_id);

-- 4. Auto-create a profile row whenever a new Supabase auth user is created,
--    whether they signed up with email/password, Google, or Telegram.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
      || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Row Level Security.
--    The app queries Postgres through PostgREST with the user's own JWT,
--    so these policies are the actual authorization boundary — not just
--    defence in depth.
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

alter table public.audit_logs enable row level security;

drop policy if exists "Only admins/moderators can read audit logs" on public.audit_logs;
create policy "Only admins/moderators can read audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role in ('ADMIN', 'MODERATOR')
    )
  );
