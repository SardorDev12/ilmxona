import Link from "next/link";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { courses, getCourse, courseLessons, lessonCount } from "@/content";
import { getLearningPath } from "@/content/paths";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { signOut } from "../(auth)/actions";

export const metadata: Metadata = { title: "Boshqaruv paneli" };

/** Hard-coded learner progress until the backend is wired up. */
const PROGRESS = [
  { courseSlug: "html", completed: 8 },
  { courseSlug: "css", completed: 4 },
  { courseSlug: "javascript", completed: 3 },
];

const SAVED = [
  { course: "javascript", lesson: "massivlar" },
  { course: "css", lesson: "flexbox" },
  { course: "html", lesson: "formalar" },
];

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");

  const inProgress = PROGRESS.map((p) => {
    const course = getCourse(p.courseSlug);
    if (!course) return null;
    const total = lessonCount(course);
    return {
      course,
      completed: p.completed,
      total,
      percent: Math.round((p.completed / total) * 100),
    };
  }).filter((x) => x !== null);

  const totalCompleted = PROGRESS.reduce((n, p) => n + p.completed, 0);
  const path = getLearningPath("frontend-dasturchi");

  const saved = SAVED.map(({ course: courseSlug, lesson: lessonSlug }) => {
    const course = getCourse(courseSlug);
    const lesson = course
      ? courseLessons(course).find((l) => l.slug === lessonSlug)
      : undefined;
    return course && lesson ? { course, lesson } : null;
  }).filter((x) => x !== null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Xush kelibsiz, {profile.display_name ?? profile.username}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="primary">{profile.role}</Badge>
            <span className="text-sm text-muted-foreground">
              @{profile.username}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasRole(profile.role, "CONTRIBUTOR") && (
            <>
              <ButtonLink
                href="/contributor/courses/new"
                size="sm"
                variant="outline"
              >
                Yangi kurs
              </ButtonLink>
              <ButtonLink href="/contributor/lessons/new" size="sm">
                Yangi dars
              </ButtonLink>
            </>
          )}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Chiqish
            </Button>
          </form>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat value={totalCompleted} label="Tugallangan dars" />
        <Stat value={inProgress.length} label="Boshlangan kurs" />
        <Stat value={12} label="Bajarilgan mashq" />
        <Stat value={5} label="Kunlik seriya" />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Davom etayotgan kurslar</h2>
        <div className="flex flex-col gap-3">
          {inProgress.map(({ course, completed, total, percent }) => (
            <Card key={course.slug}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {course.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {total} ta darsdan {completed} tasi tugallandi
                    </p>
                  </div>
                  <ButtonLink
                    href={`/courses/${course.slug}`}
                    size="sm"
                    variant="outline"
                  >
                    Davom etish
                  </ButtonLink>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${course.title} bo'yicha natija`}
                >
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {path && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              Yo&apos;nalishingiz
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>{path.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {path.description}
                </p>
                <ol className="flex flex-col gap-2">
                  {path.courseSlugs.map((slug, i) => {
                    const course = courses.find((c) => c.slug === slug);
                    const done = PROGRESS.find((p) => p.courseSlug === slug);
                    if (!course) return null;

                    return (
                      <li
                        key={slug}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span
                          className={
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                            (done
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground")
                          }
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        <Link
                          href={`/courses/${slug}`}
                          className="hover:text-primary"
                        >
                          {course.title}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-semibold">Saqlangan darslar</h2>
          <Card>
            <ul className="divide-y divide-border">
              {saved.map(({ course, lesson }) => (
                <li key={`${course.slug}-${lesson.slug}`}>
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    className="flex flex-col gap-0.5 px-5 py-3 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-medium">{lesson.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {course.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-0.5 p-4">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}
