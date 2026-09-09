import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { myContent } from "@/lib/content/queries";
import { ContentList, type ContentRow } from "@/components/studio/content-list";
import { EmptyState } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Boshqaruv paneli" };

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");
  const { courses, lessons } = await myContent(profile.id);

  const rows: ContentRow[] = [
    ...courses.map((course) => ({
      id: course.id,
      title: course.title,
      href: `/courses/${course.slug}`,
      meta: `Kurs · /${course.slug}`,
      status: course.status,
      reviewNote: course.review_note,
      table: "courses" as const,
    })),
    ...lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      href: `/courses/${lesson.courses.slug}/lessons/${lesson.slug}`,
      meta: `Dars · ${lesson.courses.title}`,
      status: lesson.status,
      reviewNote: lesson.review_note,
      table: "lessons" as const,
    })),
  ];

  const published = rows.filter((r) => r.status === "PUBLISHED").length;
  const inReview = rows.filter((r) => r.status === "SUBMITTED").length;
  const needsWork = rows.filter(
    (r) => r.status === "CHANGES_REQUESTED",
  ).length;

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

        {rows.length === 0 ? (
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
          <ContentList rows={rows} />
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
