-- Ilmxona — keep profiles.updated_at accurate.
--
-- Run in the Supabase SQL editor after 003_grants.sql.
--
-- The column defaults to now() on insert but nothing advanced it on
-- update, so it silently recorded the creation time forever.
--
-- Done in a trigger rather than by having the app set the column: the
-- update grant is deliberately column-scoped (see 003), and widening it
-- to include updated_at would let a client backdate its own row.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
