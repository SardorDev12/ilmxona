import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/roles";
import { getCourseForReview } from "@/lib/content/queries";
import { STATUS_LABELS } from "@/lib/content/types";
import {
  CourseDecision,
  DeleteCourse,
  LessonDecision,
} from "@/components/studio/review-actions";
import { LessonBody } from "@/components/content/lesson-body";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Kursni ko'rib chiqish",
  robots: { index: false },
};

export default async function CourseReviewPage({
  params,
}: PageProps<"/admin/review/[course]">) {
  const profile = await requireRole("MODERATOR", "/admin/review");
  const { course: slug } = await params;

  const found = await getCourseForReview(slug);
  if (!found) notFound();

  const { course, author, modules, lessons, pending } = found;
  const isLive = course.status === "PUBLISHED";

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/review" className="hover:text-foreground">
          Ko&apos;rib chiqish
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{course.title}</span>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <Badge variant={isLive ? "primary" : "outline"}>
            {STATUS_LABELS[course.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {author ? (
            <Link href={`/u/${author.username}`} className="hover:text-primary">
              @{author.username}
            </Link>
          ) : (
            "Muallif noma'lum"
          )}
          {" · "}
          {lessons.length} ta dars
          {pending.length > 0 && ` · ${pending.length} tasi ko'rib chiqilmagan`}
          {" · "}
          <Link
            href={`/courses/${course.slug}`}
            target="_blank"
            className="hover:text-primary"
          >
            Saytda ochish
          </Link>
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Kurs haqida
            </h2>
            <p className="text-sm">
              {course.subtitle || course.description || "Tavsif kiritilmagan."}
            </p>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Kategoriya</dt>
              <dd>{course.category}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Daraja</dt>
              <dd>{course.difficulty}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Davomiyligi</dt>
              <dd>{course.duration_hours} soat</dd>
            </div>
          </dl>

          {modules.length > 0 && (
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Modullar
              </h2>
              <ol className="ml-5 list-decimal text-sm">
                {modules.map((m) => (
                  <li key={m.id}>{m.title}</li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          Darslar
          {pending.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              — ko&apos;rib chiqilmaganlari birinchi
            </span>
          )}
        </h2>

        {lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Bu kursda hali dars yo&apos;q.
          </p>
        ) : (
          [...lessons]
            // A moderator opens this page because of the new lessons, so
            // those come first; the published ones are context.
            .sort((a, b) => {
              const rank = (s: string) => (s === "SUBMITTED" ? 0 : 1);
              return rank(a.status) - rank(b.status) || a.position - b.position;
            })
            .map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{lesson.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {modules.find((m) => m.id === lesson.module_id)
                          ?.title ?? "Modulsiz"}{" "}
                        · {lesson.duration_min} daqiqa
                      </p>
                    </div>
                    <Badge
                      variant={
                        lesson.status === "PUBLISHED" ? "primary" : "outline"
                      }
                    >
                      {STATUS_LABELS[lesson.status]}
                    </Badge>
                  </div>

                  {lesson.status === "SUBMITTED" && (
                    <>
                      <details className="rounded-lg border border-border">
                        <summary className="cursor-pointer px-4 py-2 text-sm font-medium">
                          Dars matnini o&apos;qish
                        </summary>
                        <div className="border-t border-border px-4 py-4">
                          {lesson.intro && (
                            <p className="mb-4 text-sm text-muted-foreground">
                              {lesson.intro}
                            </p>
                          )}
                          <LessonBody blocks={lesson.body} />
                          {lesson.quiz.length > 0 && (
                            <p className="mt-4 text-xs text-muted-foreground">
                              {lesson.quiz.length} ta test savoli
                              {lesson.exercise && " · mashq bor"}
                            </p>
                          )}
                        </div>
                      </details>

                      <LessonDecision lessonId={lesson.id} />
                    </>
                  )}

                  {lesson.review_note && (
                    <p className="text-xs text-destructive">
                      Izoh: {lesson.review_note}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </section>

      {(pending.length > 0 || course.status === "SUBMITTED") && (
        <CourseDecision
          courseId={course.id}
          isLive={isLive}
          pendingLessons={pending.length}
        />
      )}

      {hasRole(profile.role, "ADMIN") && (
        <DeleteCourse
          courseId={course.id}
          title={course.title}
          lessonCount={lessons.length}
        />
      )}
    </div>
  );
}
