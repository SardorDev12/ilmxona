import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  Author,
  ContentStatus,
  Course,
  GlossaryTerm,
  LearningPath,
  Lesson,
  Module,
} from "./types";
import { normalize } from "./types";

/**
 * Reads for the public site. RLS decides visibility: published rows are
 * readable by anyone, and an author or moderator additionally sees their
 * own drafts — so these queries do not filter by status themselves,
 * except where a page should show only what is live.
 *
 * Every function returns empty rather than throwing when Supabase is
 * unconfigured, so the site renders (empty) without a backend.
 */

const COURSE_COLUMNS =
  "id, slug, title, subtitle, description, category, difficulty, duration_hours, accent, objectives, prerequisites, status, review_note, author_id, created_at, updated_at, published_at";

const LESSON_COLUMNS =
  "id, course_id, module_id, slug, title, intro, why_important, body, common_mistakes, exercise, quiz, related_terms, duration_min, position, status, review_note, author_id, created_at, updated_at, published_at";

export async function publishedCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: true })
    .returns<Course[]>();

  return data ?? [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle<Course>();

  return data;
}

export async function courseModules(courseId: string): Promise<Module[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select("id, title, position")
    .eq("course_id", courseId)
    .order("position", { ascending: true })
    .returns<Module[]>();

  return data ?? [];
}

export async function courseLessons(
  courseId: string,
  onlyPublished = true,
): Promise<Lesson[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  let query = supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("course_id", courseId);

  if (onlyPublished) query = query.eq("status", "PUBLISHED");

  const { data } = await query
    .order("position", { ascending: true })
    .returns<Lesson[]>();

  return data ?? [];
}

export async function getLesson(
  courseSlug: string,
  lessonSlug: string,
): Promise<{
  course: Course;
  lesson: Lesson;
  /** Every lesson of the course, in order — the sidebar renders them all. */
  lessons: Lesson[];
  previous: Lesson | null;
  next: Lesson | null;
  position: number;
  total: number;
} | null> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return null;

  const lessons = await courseLessons(course.id);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;

  return {
    course,
    lesson: lessons[index],
    lessons,
    previous: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
    position: index + 1,
    total: lessons.length,
  };
}

export async function latestLessons(limit = 6) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select(`${LESSON_COLUMNS}, courses!inner(slug, title)`)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)
    .returns<(Lesson & { courses: { slug: string; title: string } })[]>();

  return data ?? [];
}

export async function publishedGlossary(): Promise<GlossaryTerm[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("id, slug, term, en, ru, definition, example, related, status")
    .eq("status", "PUBLISHED")
    .order("term", { ascending: true })
    .returns<GlossaryTerm[]>();

  return data ?? [];
}

export async function getGlossaryTerm(
  slug: string,
): Promise<GlossaryTerm | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("id, slug, term, en, ru, definition, example, related, status")
    .eq("slug", slug)
    .maybeSingle<GlossaryTerm>();

  return data;
}

/** Published lessons that list a glossary term as related. */
export async function lessonsForTerm(termSlug: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, slug, title, courses!inner(slug, title)")
    .eq("status", "PUBLISHED")
    .contains("related_terms", [termSlug])
    .returns<
      {
        id: string;
        slug: string;
        title: string;
        courses: { slug: string; title: string };
      }[]
    >();

  return data ?? [];
}

export async function publishedPaths(): Promise<LearningPath[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select(
      "id, slug, title, description, difficulty, duration_months, outcomes, skills, status",
    )
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: true })
    .returns<LearningPath[]>();

  return data ?? [];
}

export async function getPath(slug: string): Promise<LearningPath | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select(
      "id, slug, title, description, difficulty, duration_months, outcomes, skills, status",
    )
    .eq("slug", slug)
    .maybeSingle<LearningPath>();

  return data;
}

export async function pathCourses(pathId: string): Promise<Course[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_path_courses")
    .select(`position, courses!inner(${COURSE_COLUMNS})`)
    .eq("path_id", pathId)
    .order("position", { ascending: true })
    .returns<{ position: number; courses: Course }[]>();

  return (data ?? []).map((row) => row.courses);
}

export async function getAuthor(id: string): Promise<Author | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .eq("id", id)
    .maybeSingle<Author>();

  return data;
}

export async function getProfileByUsername(username: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, role, created_at")
    .eq("username", username)
    .maybeSingle<
      Author & { bio: string | null; role: string; created_at: string }
    >();

  return data;
}

/** Users who have at least one published course or lesson. */
export async function creators() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, role")
    .in("role", ["CREATOR", "MODERATOR", "ADMIN"])
    .order("username", { ascending: true })
    .returns<(Author & { bio: string | null; role: string })[]>();

  return data ?? [];
}

/**
 * Courses a lesson can be filed under: everything published, plus the
 * author's own drafts — a brand-new course would otherwise have nowhere
 * to put its first lesson. RLS already limits what comes back, so the
 * filter here only widens the published set by the caller's own rows.
 */
export async function authorableCourses(userId: string) {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, status, modules(id, title, position)")
    .or(`status.eq.PUBLISHED,author_id.eq.${userId}`)
    .order("title", { ascending: true })
    .returns<
      {
        id: string;
        slug: string;
        title: string;
        status: ContentStatus;
        modules: { id: string; title: string; position: number }[];
      }[]
    >();

  return (data ?? []).map((course) => ({
    ...course,
    modules: [...course.modules].sort((a, b) => a.position - b.position),
  }));
}

/** Published work by one author, for their public profile. */
export async function publishedByAuthor(authorId: string) {
  if (!isSupabaseConfigured()) return { courses: [], lessons: [] };

  const supabase = await createClient();
  const [courses, lessons] = await Promise.all([
    supabase
      .from("courses")
      .select(COURSE_COLUMNS)
      .eq("author_id", authorId)
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false, nullsFirst: false })
      .returns<Course[]>(),
    supabase
      .from("lessons")
      .select(`${LESSON_COLUMNS}, courses!inner(slug, title)`)
      .eq("author_id", authorId)
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false, nullsFirst: false })
      .returns<(Lesson & { courses: { slug: string; title: string } })[]>(),
  ]);

  return { courses: courses.data ?? [], lessons: lessons.data ?? [] };
}

/**
 * How much each author has published, keyed by profile id. Counting in
 * one pass beats a per-author query on the contributors listing.
 */
export async function authorStats(): Promise<
  Map<string, { courses: number; lessons: number }>
> {
  const stats = new Map<string, { courses: number; lessons: number }>();
  if (!isSupabaseConfigured()) return stats;

  const supabase = await createClient();
  const [courses, lessons] = await Promise.all([
    supabase
      .from("courses")
      .select("author_id")
      .eq("status", "PUBLISHED")
      .returns<{ author_id: string }[]>(),
    supabase
      .from("lessons")
      .select("author_id")
      .eq("status", "PUBLISHED")
      .returns<{ author_id: string }[]>(),
  ]);

  function bump(id: string, key: "courses" | "lessons") {
    const entry = stats.get(id) ?? { courses: 0, lessons: 0 };
    entry[key] += 1;
    stats.set(id, entry);
  }

  for (const row of courses.data ?? []) bump(row.author_id, "courses");
  for (const row of lessons.data ?? []) bump(row.author_id, "lessons");

  return stats;
}

/** Content the signed-in user has authored, newest first. */
export async function myContent(userId: string) {
  if (!isSupabaseConfigured()) return { courses: [], lessons: [] };

  const supabase = await createClient();
  const [courses, lessons] = await Promise.all([
    supabase
      .from("courses")
      .select(COURSE_COLUMNS)
      .eq("author_id", userId)
      .order("updated_at", { ascending: false })
      .returns<Course[]>(),
    supabase
      .from("lessons")
      .select(`${LESSON_COLUMNS}, courses!inner(slug, title)`)
      .eq("author_id", userId)
      .order("updated_at", { ascending: false })
      .returns<(Lesson & { courses: { slug: string; title: string } })[]>(),
  ]);

  return { courses: courses.data ?? [], lessons: lessons.data ?? [] };
}

/** Everything awaiting moderator attention. */
export async function reviewQueue() {
  if (!isSupabaseConfigured()) return { courses: [], lessons: [] };

  const supabase = await createClient();
  const [courses, lessons] = await Promise.all([
    supabase
      .from("courses")
      .select(`${COURSE_COLUMNS}, profiles!courses_author_id_fkey(username)`)
      .eq("status", "SUBMITTED")
      .order("updated_at", { ascending: true })
      .returns<(Course & { profiles: { username: string } })[]>(),
    supabase
      .from("lessons")
      .select(
        `${LESSON_COLUMNS}, courses!inner(slug, title), profiles!lessons_author_id_fkey(username)`,
      )
      .eq("status", "SUBMITTED")
      .order("updated_at", { ascending: true })
      .returns<
        (Lesson & {
          courses: { slug: string; title: string };
          profiles: { username: string };
        })[]
      >(),
  ]);

  return { courses: courses.data ?? [], lessons: lessons.data ?? [] };
}

export type SearchResult = {
  kind: "Kurs" | "Dars" | "Yo'nalish" | "Lug'at";
  title: string;
  description: string;
  href: string;
  rank: number;
};

/**
 * Ranking follows docs/PRD.md §20: exact title match, then partial title
 * match, then body relevance. Matching happens in the application rather
 * than SQL so the Uzbek apostrophe folding above applies — Postgres would
 * treat "o'zbek" and "ozbek" as different words.
 */
export async function search(query: string): Promise<SearchResult[]> {
  const q = normalize(query);
  if (!q) return [];

  const [courses, glossary, paths] = await Promise.all([
    publishedCourses(),
    publishedGlossary(),
    publishedPaths(),
  ]);

  const results: SearchResult[] = [];

  function consider(
    kind: SearchResult["kind"],
    title: string,
    description: string,
    href: string,
    haystack: string,
  ) {
    const t = normalize(title);
    const body = normalize(haystack);

    let rank: number;
    if (t === q) rank = 0;
    else if (t.startsWith(q)) rank = 1;
    else if (t.includes(q)) rank = 2;
    else if (body.includes(q)) rank = 3;
    else return;

    results.push({ kind, title, description, href, rank });
  }

  for (const course of courses) {
    consider(
      "Kurs",
      course.title,
      course.subtitle,
      `/courses/${course.slug}`,
      `${course.description} ${course.category} ${course.objectives.join(" ")}`,
    );

    for (const lesson of await courseLessons(course.id)) {
      consider(
        "Dars",
        lesson.title,
        lesson.intro || course.title,
        `/courses/${course.slug}/lessons/${lesson.slug}`,
        `${lesson.intro} ${lesson.why_important} ${course.title}`,
      );
    }
  }

  for (const path of paths) {
    consider(
      "Yo'nalish",
      path.title,
      path.description,
      `/learning-paths/${path.slug}`,
      `${path.description} ${path.skills.join(" ")}`,
    );
  }

  for (const term of glossary) {
    consider(
      "Lug'at",
      term.term,
      term.definition,
      `/glossary/${term.slug}`,
      `${term.definition} ${term.en} ${term.ru ?? ""}`,
    );
  }

  return results.sort(
    (a, b) => a.rank - b.rank || a.title.localeCompare(b.title),
  );
}

export async function platformTotals() {
  if (!isSupabaseConfigured()) {
    return { courses: 0, lessons: 0, terms: 0, paths: 0, creators: 0 };
  }

  const supabase = await createClient();
  const published = { count: "exact" as const, head: true };

  const [courses, lessons, terms, paths, people] = await Promise.all([
    supabase
      .from("courses")
      .select("*", published)
      .eq("status", "PUBLISHED"),
    supabase
      .from("lessons")
      .select("*", published)
      .eq("status", "PUBLISHED"),
    supabase
      .from("glossary_terms")
      .select("*", published)
      .eq("status", "PUBLISHED"),
    supabase
      .from("learning_paths")
      .select("*", published)
      .eq("status", "PUBLISHED"),
    supabase
      .from("profiles")
      .select("*", published)
      .in("role", ["CREATOR", "MODERATOR", "ADMIN"]),
  ]);

  return {
    courses: courses.count ?? 0,
    lessons: lessons.count ?? 0,
    terms: terms.count ?? 0,
    paths: paths.count ?? 0,
    creators: people.count ?? 0,
  };
}
