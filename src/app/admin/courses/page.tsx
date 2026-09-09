import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { allCourses } from "@/lib/content/queries";
import { STATUS_LABELS } from "@/lib/content/types";
import { EmptyState } from "@/components/content/cards";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Kurslar",
  robots: { index: false },
};

export default async function AdminCoursesPage() {
  await requireRole("MODERATOR", "/admin/courses");

  const courses = await allCourses();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Kurslar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platformadagi barcha kurslar. Kursni ochib darslarini ko&apos;rib
          chiqasiz yoki (administrator bo&apos;lsangiz) o&apos;chirasiz.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="Hozircha kurs yo'q"
          description="Foydalanuvchilar kurs yaratgach ular shu yerda ko'rinadi."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/review/${course.slug}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {course.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    @{course.profiles?.username ?? "noma'lum"} ·{" "}
                    {course.lessonCount} ta dars ·{" "}
                    {new Date(course.updated_at).toLocaleDateString("uz")}
                  </p>
                </div>
                <Badge
                  variant={
                    course.status === "PUBLISHED" ? "primary" : "outline"
                  }
                >
                  {STATUS_LABELS[course.status]}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
