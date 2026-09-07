-- Ilmxona — profile auto-provisioning + row level security
--
-- Run this in the Supabase SQL editor (or `supabase db execute -f`) AFTER
-- applying the Prisma migration that creates the `profiles` table and
-- `Role` enum (`npx prisma migrate dev`). Prisma does not manage the
-- `auth` schema or RLS policies, so those live here instead.

-- 1. Auto-create a profile row whenever a new Supabase auth user is created,
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

-- 2. Row Level Security
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

alter table public.audit_logs enable row level security;

create policy "Only admins/moderators can read audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('ADMIN', 'MODERATOR')
    )
  );
