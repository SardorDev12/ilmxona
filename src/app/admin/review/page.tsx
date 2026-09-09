import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { reviewQueue } from "@/lib/content/queries";
import { EmptyState } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Ko'rib chiqish",
  robots: { index: false },
};

export default async function AdminReviewPage() {
  await requireRole("MODERATOR", "/admin/review");

  const queue = await reviewQueue();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ko&apos;rib chiqish</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ko&apos;rib chiqish birligi — kurs. Muallif yangi dars
          qo&apos;shsa, kurs shu ro&apos;yxatda yangilanish bilan
          ko&apos;rinadi; kursni ochib, yangi darsni o&apos;qiysiz.
        </p>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          title="Navbat bo'sh"
          description="Ko'rib chiqishga yuborilgan kurs yoki yangilanish yo'q."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((entry) => (
            <Card key={entry.course.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/review/${entry.course.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {entry.course.title}
                    </Link>
                    <Badge variant={entry.isNew ? "primary" : "outline"}>
                      {entry.isNew ? "Yangi kurs" : "Yangilangan"}
                    </Badge>
                    {entry.pendingLessons > 0 && (
                      <Badge variant="outline">
                        {entry.pendingLessons} ta yangi dars
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    @{entry.author?.username ?? "noma'lum"} ·{" "}
                    {new Date(entry.updatedAt).toLocaleDateString("uz")}
                  </p>
                </div>

                <ButtonLink
                  href={`/admin/review/${entry.course.slug}`}
                  size="sm"
                >
                  Ko&apos;rib chiqish
                </ButtonLink>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
