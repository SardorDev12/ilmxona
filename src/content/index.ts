import { htmlCourse } from "./courses/html";
import { cssCourse } from "./courses/css";
import { javascriptCourse } from "./courses/javascript";
import { gitCourse } from "./courses/git";
import { sqlCourse } from "./courses/sql";
import { glossary } from "./glossary";
import { learningPaths } from "./paths";
import { contributors } from "./contributors";
import type { Course, Lesson } from "./types";

export const courses: Course[] = [
  htmlCourse,
  cssCourse,
  javascriptCourse,
  gitCourse,
  sqlCourse,
];

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}

export function courseLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export function lessonCount(course: Course): number {
  return courseLessons(course).length;
}

export function getLesson(courseSlug: string, lessonSlug: string) {
  const course = getCourse(courseSlug);
  if (!course) return undefined;

  const lessons = courseLessons(course);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return undefined;

  return {
    course,
    lesson: lessons[index],
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index < lessons.length - 1 ? lessons[index + 1] : undefined,
    position: index + 1,
    total: lessons.length,
  };
}

/** Every lesson across every course, newest first. */
export function latestLessons(limit = 6) {
  return courses
    .flatMap((course) =>
      courseLessons(course).map((lesson) => ({ course, lesson })),
    )
    .sort((a, b) => b.lesson.updatedAt.localeCompare(a.lesson.updatedAt))
    .slice(0, limit);
}

/**
 * Uzbek Latin uses several apostrophe characters interchangeably (oʻ, o‘,
 * o'), and people often type none at all. Strip them all so "o'zbek",
 * "oʻzbek" and "ozbek" collapse to the same key (docs/PRD.md §20).
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ʻʼ‘’'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type SearchResult = {
  kind: "Kurs" | "Dars" | "Yo'nalish" | "Lug'at" | "Muallif";
  title: string;
  description: string;
  href: string;
  /** Lower is better. */
  rank: number;
};

/**
 * Ranking follows docs/PRD.md §20: exact title match, then partial title
 * match, then content relevance.
 */
export function search(query: string): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];

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

    for (const lesson of courseLessons(course)) {
      consider(
        "Dars",
        lesson.title,
        lesson.intro || course.title,
        `/courses/${course.slug}/lessons/${lesson.slug}`,
        `${lesson.intro} ${lesson.whyImportant} ${course.title}`,
      );
    }
  }

  for (const path of learningPaths) {
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

  for (const person of contributors) {
    consider(
      "Muallif",
      person.name,
      person.title,
      `/u/${person.username}`,
      `${person.bio} ${person.expertise.join(" ")}`,
    );
  }

  return results.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title));
}

export const totals = {
  courses: courses.length,
  lessons: courses.reduce((n, c) => n + lessonCount(c), 0),
  terms: glossary.length,
  paths: learningPaths.length,
  contributors: contributors.length,
};
