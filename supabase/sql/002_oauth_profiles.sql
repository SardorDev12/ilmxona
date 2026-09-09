-- Ilmxona — make profile creation work for OAuth sign-ins, and backfill
-- any auth user that predates the trigger.
--
-- Run this in the Supabase SQL editor after 001_profiles.sql.
--
-- Two problems this fixes:
--
-- 1. The original trigger only read `username` from raw_user_meta_data,
--    which email signups set but Google does not — Google supplies
--    `full_name`, `name`, `avatar_url` and `email` instead. It also
--    concatenated `new.email` directly, and in Postgres NULL || text is
--    NULL, so an account without an email address produced a NULL
--    username and failed the NOT NULL constraint — taking the whole
--    signup down with it.
--
-- 2. A trigger only fires for rows inserted after it exists. Anyone who
--    signed in before 001 was applied has an auth.users row and no
--    profile, which leaves them able to authenticate but unable to use
--    the site.

-- 1. Trigger that understands both email and OAuth signups.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_name text;
begin
  -- Prefer an explicit username, then the provider's display name, then
  -- the local part of the email. coalesce on the email too, so a missing
  -- address can never produce a NULL username.
  base_name := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username',
    split_part(coalesce(new.email, ''), '@', 1),
    'user'
  );

  if base_name = '' then
    base_name := 'user';
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    -- Suffixed with part of the uuid so two people called "sardor" can
    -- both sign up without colliding on the unique index.
    base_name || '_' || substr(new.id::text, 1, 4),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      base_name
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Backfill everyone who already signed in without getting a profile.
insert into public.profiles (id, username, display_name, avatar_url)
select
  u.id,
  coalesce(
    u.raw_user_meta_data->>'username',
    u.raw_user_meta_data->>'user_name',
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'user'
  ) || '_' || substr(u.id::text, 1, 4),
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'user'
  ),
  coalesce(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
