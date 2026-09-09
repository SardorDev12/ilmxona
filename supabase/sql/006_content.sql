-- Ilmxona — content lives in the database.
--
-- Run in the Supabase SQL editor after 005.
--
-- Until now courses, lessons, the glossary and learning paths were
-- hard-coded in src/content. This moves them into Postgres so the
-- editors write real rows and the platform starts empty.
--
-- Lesson bodies, exercises and quizzes stay as jsonb: they are already
-- document-shaped (an ordered list of typed blocks), and splitting them
-- into tables would buy nothing but joins.

create type public.content_status as enum (
  'DRAFT',
  'SUBMITTED',
  'CHANGES_REQUESTED',
  'PUBLISHED'
);

-- Reading a user's own role inside a policy on `profiles` would recurse.
-- security definer reads it once, outside RLS.
create or replace function public.current_user_role()
returns public.role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = (select auth.uid())
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_user_role() in ('MODERATOR', 'ADMIN'), false)
$$;

-- ---------------------------------------------------------------- courses

create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  subtitle       text not null default '',
  description    text not null default '',
  category       text not null default 'Boshqa',
  difficulty     text not null default 'Boshlang''ich',
  duration_hours integer not null default 10,
  accent         text not null default 'from-sky-500 to-blue-600',
  objectives     text[] not null default '{}',
  prerequisites  text[] not null default '{}',
  author_id      uuid not null references public.profiles (id) on delete cascade,
  reviewer_id    uuid references public.profiles (id) on delete set null,
  status         public.content_status not null default 'DRAFT',
  review_note    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  published_at   timestamptz
);

create index if not exists courses_status_idx on public.courses (status);
create index if not exists courses_author_idx on public.courses (author_id);

-- ---------------------------------------------------------------- modules

create table if not exists public.modules (
  id        uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title     text not null,
  position  integer not null default 0
);

create index if not exists modules_course_idx on public.modules (course_id, position);

-- ---------------------------------------------------------------- lessons

create table if not exists public.lessons (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.courses (id) on delete cascade,
  module_id       uuid references public.modules (id) on delete set null,
  slug            text not null,
  title           text not null,
  intro           text not null default '',
  why_important   text not null default '',
  body            jsonb not null default '[]',
  common_mistakes text[] not null default '{}',
  exercise        jsonb,
  quiz            jsonb not null default '[]',
  related_terms   text[] not null default '{}',
  duration_min    integer not null default 10,
  position        integer not null default 0,
  author_id       uuid not null references public.profiles (id) on delete cascade,
  reviewer_id     uuid references public.profiles (id) on delete set null,
  status          public.content_status not null default 'DRAFT',
  review_note     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz,
  unique (course_id, slug)
);

create index if not exists lessons_course_idx on public.lessons (course_id, position);
create index if not exists lessons_status_idx on public.lessons (status);
create index if not exists lessons_author_idx on public.lessons (author_id);

-- --------------------------------------------------------------- glossary

create table if not exists public.glossary_terms (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  term       text not null,
  en         text not null default '',
  ru         text,
  definition text not null default '',
  example    text,
  related    text[] not null default '{}',
  author_id  uuid not null references public.profiles (id) on delete cascade,
  status     public.content_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------- learning paths

create table if not exists public.learning_paths (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  description     text not null default '',
  difficulty      text not null default 'Boshlang''ich',
  duration_months integer not null default 3,
  outcomes        text[] not null default '{}',
  skills          text[] not null default '{}',
  author_id       uuid not null references public.profiles (id) on delete cascade,
  status          public.content_status not null default 'DRAFT',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.learning_path_courses (
  path_id   uuid not null references public.learning_paths (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  position  integer not null default 0,
  primary key (path_id, course_id)
);

-- ------------------------------------------------------------ updated_at

drop trigger if exists courses_touch on public.courses;
create trigger courses_touch before update on public.courses
  for each row execute function public.touch_updated_at();

drop trigger if exists lessons_touch on public.lessons;
create trigger lessons_touch before update on public.lessons
  for each row execute function public.touch_updated_at();

drop trigger if exists glossary_touch on public.glossary_terms;
create trigger glossary_touch before update on public.glossary_terms
  for each row execute function public.touch_updated_at();

drop trigger if exists paths_touch on public.learning_paths;
create trigger paths_touch before update on public.learning_paths
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------- privileges
-- Grants come before RLS: without them the API roles are refused outright
-- and the policies never run (see 003_grants.sql).

grant select on public.courses, public.modules, public.lessons,
                public.glossary_terms, public.learning_paths,
                public.learning_path_courses
  to anon, authenticated;

grant insert, update, delete on public.courses, public.modules,
                public.lessons, public.glossary_terms,
                public.learning_paths, public.learning_path_courses
  to authenticated;

-- ------------------------------------------------------------------- RLS

alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.glossary_terms enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_courses enable row level security;

-- Reading is open to everyone, but only for published rows. Authors also
-- see their own drafts; moderators see everything.
create policy "read published courses" on public.courses for select
  using (
    status = 'PUBLISHED'
    or author_id = (select auth.uid())
    or public.is_moderator()
  );

create policy "read published lessons" on public.lessons for select
  using (
    status = 'PUBLISHED'
    or author_id = (select auth.uid())
    or public.is_moderator()
  );

create policy "read published glossary" on public.glossary_terms for select
  using (
    status = 'PUBLISHED'
    or author_id = (select auth.uid())
    or public.is_moderator()
  );

create policy "read published paths" on public.learning_paths for select
  using (
    status = 'PUBLISHED'
    or author_id = (select auth.uid())
    or public.is_moderator()
  );

-- Modules and path membership follow their parent's visibility.
create policy "read modules of visible courses" on public.modules for select
  using (
    exists (select 1 from public.courses c where c.id = course_id)
  );

create policy "read path courses" on public.learning_path_courses for select
  using (
    exists (select 1 from public.learning_paths p where p.id = path_id)
  );

-- Anyone signed in may create, as themselves, starting as a draft.
create policy "create own courses" on public.courses for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'DRAFT');

create policy "create own lessons" on public.lessons for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'DRAFT');

create policy "create own glossary" on public.glossary_terms for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'DRAFT');

create policy "create own paths" on public.learning_paths for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'DRAFT');

create policy "create modules for own courses" on public.modules for insert to authenticated
  with check (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.author_id = (select auth.uid())
    )
    or public.is_moderator()
  );

create policy "create own path courses" on public.learning_path_courses
  for insert to authenticated
  with check (
    exists (
      select 1 from public.learning_paths p
      where p.id = path_id and p.author_id = (select auth.uid())
    )
    or public.is_moderator()
  );

-- Authors edit their own work while it is a draft or has been sent back,
-- and may move it to SUBMITTED. The `with check` is what stops them
-- setting PUBLISHED themselves — publishing is a moderator action.
create policy "authors edit own courses" on public.courses for update to authenticated
  using (author_id = (select auth.uid()) and status in ('DRAFT', 'CHANGES_REQUESTED'))
  with check (author_id = (select auth.uid()) and status in ('DRAFT', 'SUBMITTED'));

create policy "authors edit own lessons" on public.lessons for update to authenticated
  using (author_id = (select auth.uid()) and status in ('DRAFT', 'CHANGES_REQUESTED'))
  with check (author_id = (select auth.uid()) and status in ('DRAFT', 'SUBMITTED'));

create policy "authors edit own glossary" on public.glossary_terms for update to authenticated
  using (author_id = (select auth.uid()) and status in ('DRAFT', 'CHANGES_REQUESTED'))
  with check (author_id = (select auth.uid()) and status in ('DRAFT', 'SUBMITTED'));

create policy "authors edit own paths" on public.learning_paths for update to authenticated
  using (author_id = (select auth.uid()) and status in ('DRAFT', 'CHANGES_REQUESTED'))
  with check (author_id = (select auth.uid()) and status in ('DRAFT', 'SUBMITTED'));

create policy "authors edit own modules" on public.modules for update to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.author_id = (select auth.uid())
    )
    or public.is_moderator()
  )
  with check (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.author_id = (select auth.uid())
    )
    or public.is_moderator()
  );

create policy "authors delete own modules" on public.modules for delete to authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.author_id = (select auth.uid())
    )
    or public.is_moderator()
  );

create policy "authors delete own courses" on public.courses for delete to authenticated
  using (
    (author_id = (select auth.uid()) and status = 'DRAFT') or public.is_moderator()
  );

create policy "authors delete own lessons" on public.lessons for delete to authenticated
  using (
    (author_id = (select auth.uid()) and status = 'DRAFT') or public.is_moderator()
  );

create policy "authors delete own path courses" on public.learning_path_courses
  for delete to authenticated
  using (
    exists (
      select 1 from public.learning_paths p
      where p.id = path_id and p.author_id = (select auth.uid())
    )
    or public.is_moderator()
  );

-- Moderators review, publish and send back. Separate from the author
-- policies so publishing is reachable only through this path.
create policy "moderators update courses" on public.courses for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

create policy "moderators update lessons" on public.lessons for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

create policy "moderators update glossary" on public.glossary_terms for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

create policy "moderators update paths" on public.learning_paths for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());
