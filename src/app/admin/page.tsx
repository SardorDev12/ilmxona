import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin" };

async function getOverviewStats() {
  const [totalUsers, contributors, pendingApplications] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({
      where: { role: { in: ["CONTRIBUTOR", "REVIEWER"] } },
    }),
    // ContributorApplication is added in Phase 5 (Community) — placeholder.
    Promise.resolve(0),
  ]);

  return { totalUsers, contributors, pendingApplications };
}

export default async function AdminOverviewPage() {
  // The layout already gates /admin/*, but Next.js can start rendering a
  // page's data fetching before a parent layout's redirect() takes effect
  // (they're not strictly sequential). Re-checking here avoids firing DB
  // queries for a request that's about to be redirected anyway.
  await requireRole("MODERATOR", "/admin");

  const stats = await getOverviewStats();

  const cards = [
    { label: "Jami foydalanuvchilar", value: stats.totalUsers },
    { label: "Mualliflar", value: stats.contributors },
    { label: "Kurslar", value: "—" },
    { label: "Darslar", value: "—" },
    { label: "Ko'rib chiqilishi kutilmoqda", value: stats.pendingApplications },
    { label: "Shikoyatlar", value: "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Boshqaruv paneli</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-3xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {card.label}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Kurslar, darslar va shikoyatlar bo&apos;yicha statistika keyingi
        fazalarda (Phase 2+) qo&apos;shiladi.
      </p>
    </div>
  );
}
