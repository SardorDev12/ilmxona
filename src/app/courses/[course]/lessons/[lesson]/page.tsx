import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { courses, courseLessons, getLesson } from "@/content";
import { getContributor } from "@/content/contributors";
import { getGlossaryTerm } from "@/content/glossary";
import { LessonBody } from "@/components/content/lesson-body";
import { Quiz } from "@/components/content/quiz";
import { ExerciseBlock } from "@/components/content/exercise";
import { Avatar } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export function generateStaticParams() {
  return courses.flatMap((course) =>
    courseLessons(course).map((lesson) => ({
      course: course.slug,
      lesson: lesson.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[course]/lessons/[lesson]">): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const found = getLesson(courseSlug, lessonSlug);
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
      modifiedTime: found.lesson.updatedAt,
    },
  };
}

export default async function LessonPage({
  params,
}: PageProps<"/courses/[course]/lessons/[lesson]">) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const found = getLesson(courseSlug, lessonSlug);
  if (!found) notFound();

  const { course, lesson, previous, next, position, total } = found;
  const author = getContributor(lesson.authorUsername);
  const reviewer = getContributor(lesson.reviewerUsername);
  const terms = lesson.relatedTerms
    .map(getGlossaryTerm)
    .filter((t) => t !== undefined);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
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
        <p className="text-lg leading-relaxed text-muted-foreground">
          {lesson.intro}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{lesson.durationMin} daqiqa</span>
          <span aria-hidden>·</span>
          <span>Yangilandi: {lesson.updatedAt}</span>
        </div>
      </header>

      {lesson.whyImportant && (
        <section className="mb-8 rounded-xl border border-border bg-muted/50 p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Nima uchun bu muhim?
          </h2>
          <p className="leading-relaxed">{lesson.whyImportant}</p>
        </section>
      )}

      <LessonBody blocks={lesson.body} />

      {lesson.commonMistakes.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">
            Ko&apos;p uchraydigan xatolar
          </h2>
          <ul className="flex flex-col gap-2">
            {lesson.commonMistakes.map((mistake) => (
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

      {terms.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Bog&apos;liq atamalar</h2>
          <div className="flex flex-wrap gap-2">
            {terms.map((term) => (
              <Link key={term.slug} href={`/glossary/${term.slug}`}>
                <Badge variant="outline" className="hover:border-primary">
                  {term.term}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <Card>
          <CardContent className="flex flex-wrap gap-6 p-5">
            {author && (
              <div className="flex items-center gap-3">
                <Avatar name={author.name} />
                <div>
                  <p className="text-xs text-muted-foreground">Muallif</p>
                  <Link
                    href={`/u/${author.username}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {author.name}
                  </Link>
                </div>
              </div>
            )}
            {reviewer && (
              <div className="flex items-center gap-3">
                <Avatar name={reviewer.name} />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Ko&apos;rib chiqdi
                  </p>
                  <Link
                    href={`/u/${reviewer.username}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {reviewer.name}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

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
          <ButtonLink
            href={`/courses/${course.slug}/lessons/${next.slug}`}
          >
            {next.title} →
          </ButtonLink>
        )}
      </nav>
    </article>
  );
}
