import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { reviewQueue } from "@/lib/content/queries";
import { ReviewQueue, type ReviewItem } from "@/components/studio/review-queue";
import { EmptyState } from "@/components/content/cards";

export const metadata: Metadata = {
  title: "Ko'rib chiqish",
  robots: { index: false },
};

export default async function AdminReviewPage() {
  await requireRole("MODERATOR", "/admin/review");

  const { courses, lessons } = await reviewQueue();

  const items: ReviewItem[] = [
    ...courses.map((course) => ({
      id: course.id,
      table: "courses" as const,
      kind: "Kurs",
      title: course.title,
      href: `/courses/${course.slug}`,
      author: course.profiles.username,
      submittedAt: course.updated_at,
    })),
    ...lessons.map((lesson) => ({
      id: lesson.id,
      table: "lessons" as const,
      kind: "Dars",
      title: `${lesson.courses.title} — ${lesson.title}`,
      href: `/courses/${lesson.courses.slug}/lessons/${lesson.slug}`,
      author: lesson.profiles.username,
      submittedAt: lesson.updated_at,
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ko&apos;rib chiqish</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Foydalanuvchilar yuborgan kurs va darslar. Tasdiqlangach nashr
          etiladi va muallif Muallif rolini oladi.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Navbat bo'sh"
          description="Ko'rib chiqishga yuborilgan material yo'q."
        />
      ) : (
        <ReviewQueue items={items} />
      )}
    </div>
  );
}
