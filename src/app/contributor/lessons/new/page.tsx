import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { authorableCourses } from "@/lib/content/queries";
import { EmptyState } from "@/components/content/cards";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Yangi dars",
  robots: { index: false },
};

/**
 * A lesson belongs to a course, so writing one starts from that course's
 * workspace. This route only exists to pick the course for anyone who
 * arrives here from an old link or the site header.
 */
export default async function PickCoursePage({
  searchParams,
}: PageProps<"/contributor/lessons/new">) {
  const profile = await requireProfile("/contributor/lessons/new");

  const { course } = await searchParams;
  const requested = Array.isArray(course) ? course[0] : course;
  if (requested) redirect(`/contributor/courses/${requested}/lessons/new`);

  const courses = await authorableCourses(profile.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Yangi dars</h1>
      <p className="mb-8 text-muted-foreground">
        Dars qaysi kursga tegishli?
      </p>

      {courses.length === 0 ? (
        <EmptyState
          title="Avval kurs kerak"
          description="Dars kursning ichida turadi. Kurs yarating — keyin unga dars yozasiz."
          action={
            <ButtonLink href="/contributor/courses/new">
              Kurs yaratish
            </ButtonLink>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {courses.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contributor/courses/${c.slug}/lessons/new`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted"
                >
                  <span className="text-sm font-medium">{c.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.modules.length > 0
                      ? `${c.modules.length} modul`
                      : "Modulsiz"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
