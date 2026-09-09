import Link from "next/link";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { myContent } from "@/lib/content/queries";
import { STATUS_LABELS } from "@/lib/content/types";
import {
  ContentList,
  type CourseGroup,
} from "@/components/studio/content-list";
import { EmptyState } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Boshqaruv paneli" };

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");
  const { courses, lessons } = await myContent(profile.id);

  // Lessons hang off their course: review happens per course, so the
  // dashboard groups them the same way.
  const groups: CourseGroup[] = courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    status: course.status,
    reviewNote: course.review_note,
    lessons: lessons
      .filter((lesson) => lesson.course_id === course.id)
      .map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        status: lesson.status,
        reviewNote: lesson.review_note,
      })),
  }));

  // A lesson written for someone else's course still belongs to its
  // author, and would otherwise be invisible here.
  const foreign = lessons.filter(
    (lesson) => !courses.some((c) => c.id === lesson.course_id),
  );

  const published =
    courses.filter((c) => c.status === "PUBLISHED").length +
    lessons.filter((l) => l.status === "PUBLISHED").length;
  const inReview =
    courses.filter((c) => c.status === "SUBMITTED").length +
    lessons.filter((l) => l.status === "SUBMITTED").length;
  const needsWork =
    courses.filter((c) => c.status === "CHANGES_REQUESTED").length +
    lessons.filter((l) => l.status === "CHANGES_REQUESTED").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Xush kelibsiz, {profile.display_name ?? profile.username}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="primary">{ROLE_LABELS[profile.role]}</Badge>
            <span className="text-sm text-muted-foreground">
              @{profile.username}
            </span>
          </div>
        </div>
        {/* Creating is open to every signed-in user; sign-out and
            settings live in the header profile menu. */}
        <div className="flex items-center gap-2">
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
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat value={courses.length} label="Kurs" />
        <Stat value={lessons.length} label="Dars" />
        <Stat value={published} label="Nashr etilgan" />
        <Stat value={inReview} label="Ko'rib chiqilmoqda" />
      </div>

      {needsWork > 0 && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
          {needsWork} ta material moderator izohi bilan qaytarilgan —
          tuzatib qayta yuboring.
        </p>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Mening materiallarim</h2>

        {groups.length === 0 ? (
          <EmptyState
            title="Hozircha materialingiz yo'q"
            description="Kurs yarating, unga dars qo'shing va ko'rib chiqishga yuboring. Tasdiqlangach materialingiz saytda paydo bo'ladi."
            action={
              <ButtonLink href="/contributor/courses/new">
                Kurs yaratish
              </ButtonLink>
            }
          />
        ) : (
          <ContentList courses={groups} />
        )}

        {foreign.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Boshqa kurslarga yozgan darslaringiz
            </h3>
            <Card>
              <ul className="divide-y divide-border">
                {foreign.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                  >
                    <Link
                      href={`/courses/${lesson.courses.slug}/lessons/${lesson.slug}`}
                      className="text-sm hover:text-primary"
                    >
                      {lesson.courses.title} — {lesson.title}
                    </Link>
                    <Badge
                      variant={
                        lesson.status === "PUBLISHED" ? "primary" : "outline"
                      }
                    >
                      {STATUS_LABELS[lesson.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </section>
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
