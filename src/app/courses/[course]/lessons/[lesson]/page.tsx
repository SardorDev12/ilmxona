import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  courseModules,
  getAuthor,
  getGlossaryTerm,
  getLesson,
} from "@/lib/content/queries";
import { LessonBody } from "@/components/content/lesson-body";
import { LessonSidebar } from "@/components/content/lesson-sidebar";
import { Quiz } from "@/components/content/quiz";
import { ExerciseBlock } from "@/components/content/exercise";
import { Avatar } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[course]/lessons/[lesson]">): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const found = await getLesson(courseSlug, lessonSlug);
  if (!found) return {};

  return {
    title: found.lesson.title,
    description: found.lesson.intro,
    alternates: {
      canonical: `/courses/${courseSlug}/lessons/${lessonSlug}`,
    },
    openGraph: {
      title: `${found.lesson.title} — Ilmxona`,
      description: found.lesson.intro,
      type: "article",
      modifiedTime: found.lesson.updated_at,
    },
  };
}

export default async function LessonPage({
  params,
}: PageProps<"/courses/[course]/lessons/[lesson]">) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const found = await getLesson(courseSlug, lessonSlug);
  if (!found) notFound();

  const { course, lesson, lessons, previous, next, position, total } = found;

  const [modules, author, terms] = await Promise.all([
    courseModules(course.id),
    getAuthor(lesson.author_id),
    Promise.all(lesson.related_terms.map((slug) => getGlossaryTerm(slug))),
  ]);

  const relatedTerms = terms.filter((t) => t !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-10">
      <LessonSidebar
        course={course}
        modules={modules}
        lessons={lessons}
        currentSlug={lesson.slug}
      />

      <article className="min-w-0 lg:max-w-3xl">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-foreground">
            Kurslar
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`/courses/${course.slug}`}
            className="hover:text-foreground"
          >
            {course.title}
          </Link>
        </nav>

        <header className="mb-8 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {position}-dars / {total}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {lesson.title}
          </h1>
          {lesson.intro && (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {lesson.intro}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{lesson.duration_min} daqiqa</span>
            <span aria-hidden>·</span>
            <span>
              Yangilandi: {new Date(lesson.updated_at).toLocaleDateString("uz")}
            </span>
          </div>
        </header>

        {lesson.why_important && (
          <section className="mb-8 rounded-xl border border-border bg-muted/50 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Nima uchun bu muhim?
            </h2>
            <p className="leading-relaxed">{lesson.why_important}</p>
          </section>
        )}

        <LessonBody blocks={lesson.body} />

        {lesson.common_mistakes.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">
              Ko&apos;p uchraydigan xatolar
            </h2>
            <ul className="flex flex-col gap-2">
              {lesson.common_mistakes.map((mistake) => (
                <li
                  key={mistake}
                  className="flex gap-3 rounded-lg border border-border px-4 py-3 text-sm leading-relaxed"
                >
                  <span className="text-destructive" aria-hidden>
                    ✗
                  </span>
                  {mistake}
                </li>
              ))}
            </ul>
          </section>
        )}

        {lesson.exercise && (
          <section className="mt-12">
            <h2 className="mb-1 text-xl font-semibold">Mashq</h2>
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              {lesson.exercise.title}
            </p>
            <ExerciseBlock exercise={lesson.exercise} />
          </section>
        )}

        {lesson.quiz.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Test</h2>
            <Quiz questions={lesson.quiz} />
          </section>
        )}

        {relatedTerms.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Bog&apos;liq atamalar</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map((term) => (
                <Link key={term.slug} href={`/glossary/${term.slug}`}>
                  <Badge variant="outline" className="hover:border-primary">
                    {term.term}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {author && (
          <section className="mt-12">
            <Card>
              <CardContent className="flex flex-wrap gap-6 p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={author.display_name ?? author.username} />
                  <div>
                    <p className="text-xs text-muted-foreground">Muallif</p>
                    <Link
                      href={`/u/${author.username}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {author.display_name ?? author.username}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <nav className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          {previous ? (
            <ButtonLink
              href={`/courses/${course.slug}/lessons/${previous.slug}`}
              variant="outline"
            >
              ← {previous.title}
            </ButtonLink>
          ) : (
            <span />
          )}
          {next && (
            <ButtonLink href={`/courses/${course.slug}/lessons/${next.slug}`}>
              {next.title} →
            </ButtonLink>
          )}
        </nav>
      </article>
    </div>
  );
}
