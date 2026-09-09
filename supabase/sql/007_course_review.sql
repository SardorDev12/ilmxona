-- 007_course_review.sql
--
-- Review is per course, not per item. A lesson is never reviewed on its
-- own: it is an update *to a course*, and the moderator opens the course
-- to read it. Two consequences for the schema:
--
--   1. A lesson may be created already SUBMITTED, so that adding a lesson
--      to a live course puts that course in the moderator's queue right
--      away. 006 allowed only DRAFT on insert, which forced an insert
--      followed by an update — two round trips for one intent.
--   2. The queue asks "which courses have submitted lessons?" on every
--      load, so that lookup gets its own partial index.
--
-- Apply after 006_content.sql.

-- ------------------------------------------------------- lesson creation

drop policy if exists "create own lessons" on public.lessons;

-- Still the author's own row, and still not publishable by them: only
-- DRAFT (keep writing) or SUBMITTED (send to review with the course).
create policy "create own lessons" on public.lessons for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and status in ('DRAFT', 'SUBMITTED')
  );

-- --------------------------------------------------------------- queue

-- The review queue lists courses that either are themselves submitted or
-- carry submitted lessons. The second half of that is this lookup.
create index if not exists lessons_submitted_idx
  on public.lessons (course_id)
  where status = 'SUBMITTED';
