import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { courses, getCourse, lessonCount } from "@/content";
import { getContributor } from "@/content/contributors";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/content/cards";

export function generateStaticParams() {
  return courses.map((c) => ({ course: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[course]">): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      title: `${course.title} — Ilmxona`,
      description: course.description,
    },
  };
}

export default async function CoursePage({
  params,
}: PageProps<"/courses/[course]">) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const author = getContributor(course.authorUsername);
  const reviewer = getContributor(course.reviewerUsername);
  const firstLesson = course.modules[0]?.lessons[0];

  // Hard-coded demo progress until learner progress is wired to a backend.
  const completed = 3;
  const total = lessonCount(course);
  const percent = Math.round((completed / total) * 100);

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
        <Badge className="mb-3 bg-white/20 text-white">
          {course.category}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {course.title}
        </h1>
        <p className="mt-2 max-w-2xl text-white/90">{course.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/90">
          <span>{course.difficulty}</span>
          <span>{total} ta dars</span>
          <span>{course.durationHours} soat</span>
          <span>{course.learners.toLocaleString("uz")} o&apos;quvchi</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-xl font-semibold">Kurs haqida</h2>
            <p className="leading-relaxed text-foreground/90">
              {course.description}
            </p>
          </section>

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

          <section>
            <h2 className="mb-3 text-xl font-semibold">Talablar</h2>
            <ul className="ml-5 list-disc text-sm text-foreground/90">
              {course.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Kurs dasturi</h2>
            <div className="flex flex-col gap-5">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.title}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {moduleIndex + 1}-modul · {module.title}
                  </h3>
                  <Card>
                    <ul className="divide-y divide-border">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.slug}>
                          <Link
                            href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                            className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted"
                          >
                            <span className="font-medium">{lesson.title}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {lesson.durationMin} daq
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium">Sizning natijangiz</span>
                  <span className="text-muted-foreground">{percent}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Kurs bo'yicha natija"
                >
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {total} ta darsdan {completed} tasi tugallandi
                </p>
              </div>

              {firstLesson && (
                <ButtonLink
                  href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
                  className="w-full"
                >
                  Davom etish
                </ButtonLink>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              {author && (
                <div className="flex items-center gap-3">
                  <Avatar name={author.name} />
                  <div className="min-w-0">
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
                  <div className="min-w-0">
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
        </aside>
      </div>
    </div>
  );
}
