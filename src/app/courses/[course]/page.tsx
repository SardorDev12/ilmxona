import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  courseLessons,
  courseModules,
  getAuthor,
  getCourseBySlug,
} from "@/lib/content/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/content/cards";
import { STATUS_LABELS } from "@/lib/content/types";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[course]">): Promise<Metadata> {
  const { course: slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

export default async function CoursePage({
  params,
}: PageProps<"/courses/[course]">) {
  const { course: slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [modules, lessons, author] = await Promise.all([
    courseModules(course.id),
    // Authors and moderators see their unpublished lessons too; RLS
    // decides, so the page asks for everything it is allowed to see.
    courseLessons(course.id, course.status === "PUBLISHED"),
    getAuthor(course.author_id),
  ]);

  const unassigned = lessons.filter((l) => l.module_id === null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:text-foreground">
          Kurslar
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{course.title}</span>
      </nav>

      <div
        className={`mb-8 rounded-xl bg-gradient-to-br ${course.accent} px-6 py-10 text-white`}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge className="bg-white/20 text-white">{course.category}</Badge>
          {course.status !== "PUBLISHED" && (
            <Badge className="bg-black/30 text-white">
              {STATUS_LABELS[course.status]}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {course.title}
        </h1>
        {course.subtitle && (
          <p className="mt-2 max-w-2xl text-white/90">{course.subtitle}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90">
          <span>{course.difficulty}</span>
          <span>{lessons.length} ta dars</span>
          <span>{course.duration_hours} soat</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-8">
          {course.description && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Kurs haqida</h2>
              <p className="leading-relaxed text-foreground/90">
                {course.description}
              </p>
            </section>
          )}

          {course.objectives.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Nimalarni o&apos;rganasiz
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {course.objectives.map((objective) => (
                  <li
                    key={objective}
                    className="flex gap-2 text-sm text-foreground/90"
                  >
                    <span className="text-accent" aria-hidden>
                      ✓
                    </span>
                    {objective}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.prerequisites.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Talablar</h2>
              <ul className="ml-5 list-disc text-sm text-foreground/90">
                {course.prerequisites.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-xl font-semibold">Kurs dasturi</h2>

            {lessons.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Bu kursda hali dars yo&apos;q.
                  </p>
                  <ButtonLink
                    href={`/contributor/lessons/new?course=${course.slug}`}
                    size="sm"
                  >
                    Dars qo&apos;shish
                  </ButtonLink>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-5">
                {modules.map((module, index) => {
                  const moduleLessons = lessons.filter(
                    (l) => l.module_id === module.id,
                  );
                  if (moduleLessons.length === 0) return null;

                  return (
                    <div key={module.id}>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {index + 1}-modul · {module.title}
                      </h3>
                      <LessonList
                        courseSlug={course.slug}
                        lessons={moduleLessons}
                      />
                    </div>
                  );
                })}

                {unassigned.length > 0 && (
                  <div>
                    {modules.length > 0 && (
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Boshqa darslar
                      </h3>
                    )}
                    <LessonList
                      courseSlug={course.slug}
                      lessons={unassigned}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          {lessons.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <ButtonLink
                  href={`/courses/${course.slug}/lessons/${lessons[0].slug}`}
                  className="w-full"
                >
                  Boshlash
                </ButtonLink>
              </CardContent>
            </Card>
          )}

          {author && (
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Avatar name={author.display_name ?? author.username} />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Muallif</p>
                  <Link
                    href={`/u/${author.username}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {author.display_name ?? author.username}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function LessonList({
  courseSlug,
  lessons,
}: {
  courseSlug: string;
  lessons: { id: string; slug: string; title: string; duration_min: number }[];
}) {
  return (
    <Card>
      <ul className="divide-y divide-border">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/courses/${courseSlug}/lessons/${lesson.slug}`}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted"
            >
              <span className="font-medium">{lesson.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {lesson.duration_min} daq
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
