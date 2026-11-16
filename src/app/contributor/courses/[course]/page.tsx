import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { authorCourse } from "@/lib/content/queries";
import { STATUS_LABELS } from "@/lib/content/types";
import { LessonRows, type LessonRow } from "@/components/studio/lesson-rows";
import { SubmitCourse } from "@/components/studio/submit-course";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kurs ustida ishlash",
  robots: { index: false },
};

export default async function CourseWorkspacePage({
  params,
}: PageProps<"/contributor/courses/[course]">) {
  await requireProfile("/dashboard");
  const { course: slug } = await params;

  const found = await authorCourse(slug);
  if (!found) notFound();

  const { course, modules, lessons } = found;

  const rows: LessonRow[] = lessons.map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    status: lesson.status,
    moduleTitle: modules.find((m) => m.id === lesson.module_id)?.title ?? null,
    durationMin: lesson.duration_min,
    reviewNote: lesson.review_note,
    // Submitted and published work is out of the author's hands until a
    // moderator acts on it.
    editable: lesson.status === "DRAFT" || lesson.status === "CHANGES_REQUESTED",
  }));

  const unsent = lessons.filter(
    (l) => l.status === "DRAFT" || l.status === "CHANGES_REQUESTED",
  ).length;
  const courseUnsent =
    course.status === "DRAFT" || course.status === "CHANGES_REQUESTED";

  // Three steps, and the one still outstanding is the one highlighted.
  const step = lessons.length === 0 ? 2 : courseUnsent || unsent > 0 ? 3 : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="mb-5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Boshqaruv paneli
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{course.title}</span>
      </nav>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {course.title}
            </h1>
            <Badge
              variant={course.status === "PUBLISHED" ? "primary" : "outline"}
            >
              {STATUS_LABELS[course.status]}
            </Badge>
          </div>
          {course.subtitle && (
            <p className="mt-1 text-muted-foreground">{course.subtitle}</p>
          )}
          {course.review_note && (
            <p className="mt-2 max-w-xl rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
              Moderator izohi: {course.review_note}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {courseUnsent && (
            <ButtonLink
              href={`/contributor/courses/${course.slug}/edit`}
              size="sm"
              variant="outline"
            >
              Kursni tahrirlash
            </ButtonLink>
          )}
          <ButtonLink
            href={`/courses/${course.slug}`}
            size="sm"
            variant="ghost"
          >
            Saytda ko&apos;rish
          </ButtonLink>
        </div>
      </header>

      <ol className="mb-8 grid gap-3 sm:grid-cols-3">
        <Step done index={1} label="Kurs yaratildi" />
        <Step
          done={lessons.length > 0}
          active={step === 2}
          index={2}
          label={
            lessons.length > 0
              ? `${lessons.length} ta dars yozildi`
              : "Birinchi darsni yozing"
          }
        />
        <Step
          done={course.status === "PUBLISHED" && unsent === 0}
          active={step === 3}
          index={3}
          label={
            course.status === "PUBLISHED" && unsent === 0
              ? "Nashr etilgan"
              : "Ko'rib chiqishga yuboring"
          }
        />
      </ol>

      <section className="mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Darslar</h2>
          <ButtonLink
            href={`/contributor/courses/${course.slug}/lessons/new`}
            size="sm"
          >
            + Dars qo&apos;shish
          </ButtonLink>
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="font-medium">Kurs hali bo&apos;sh</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Birinchi darsni yozing. Sarlavha va matn yetarli —
                qolganini keyin qo&apos;shasiz.
              </p>
              <ButtonLink
                href={`/contributor/courses/${course.slug}/lessons/new`}
              >
                Birinchi darsni yozish
              </ButtonLink>
            </CardContent>
          </Card>
        ) : (
          <LessonRows courseSlug={course.slug} lessons={rows} />
        )}
      </section>

      {rows.length > 0 && (
        <SubmitCourse
          courseId={course.id}
          isLive={course.status === "PUBLISHED"}
          unsent={unsent}
          courseUnsent={courseUnsent}
        />
      )}
    </div>
  );
}

function Step({
  index,
  label,
  done,
  active,
}: {
  index: number;
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <li
      className={
        "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm " +
        (active
          ? "border-primary bg-primary/5"
          : "border-border text-muted-foreground")
      }
    >
      <span
        className={
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
          (done
            ? "bg-accent text-accent-foreground"
            : active
              ? "bg-primary text-primary-foreground"
              : "bg-muted")
        }
      >
        {done ? "✓" : index}
      </span>
      <span className={active ? "font-medium text-foreground" : undefined}>
        {label}
      </span>
    </li>
  );
}
