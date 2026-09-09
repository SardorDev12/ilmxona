import Link from "next/link";
import type { Metadata } from "next";
import { isDemoMode, requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { hasRole, ROLE_LABELS } from "@/lib/auth/roles";
import { platformTotals, reviewQueue } from "@/lib/content/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminOverviewPage() {
  const profile = await requireRole("MODERATOR", "/admin");
  const isAdmin = hasRole(profile.role, "ADMIN");

  // Without Supabase there is nothing to count, and querying anyway
  // would take the page down.
  let userCount: number | null = null;
  let creatorCount: number | null = null;

  if (!isDemoMode()) {
    const supabase = await createClient();
    const [all, creators] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "CREATOR"),
    ]);
    userCount = all.count ?? 0;
    creatorCount = creators.count ?? 0;
  }

  const [totals, queue] = await Promise.all([platformTotals(), reviewQueue()]);
  const pending = queue.length;

  const cards = [
    { label: "Foydalanuvchilar", value: userCount ?? "—" },
    { label: "Mualliflar", value: creatorCount ?? "—" },
    { label: "Kurslar", value: totals.courses },
    { label: "Darslar", value: totals.lessons },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">Boshqaruv paneli</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Sizning rolingiz: <Badge>{ROLE_LABELS[profile.role]}</Badge>
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardContent className="flex flex-col gap-0.5 p-4">
                <span className="text-2xl font-bold">{card.value}</span>
                <span className="text-xs text-muted-foreground">
                  {card.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Sizning vazifalaringiz</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <TaskCard
            href="/admin/review"
            title="Ko'rib chiqish"
            description={
              pending > 0
                ? `${pending} ta kurs navbatda turibdi.`
                : "Yuborilgan kurs va darslarni tasdiqlang yoki o'zgartirish so'rang."
            }
          />
          <TaskCard
            href="/admin/courses"
            title="Kurslar"
            description="Barcha kurslar ro'yxati — ochib ko'rish va o'chirish."
          />
          <TaskCard
            href="/admin/reports"
            title="Shikoyatlar"
            description="Foydalanuvchilar bildirgan xato va shikoyatlarni hal qiling."
          />
          {isAdmin && (
            <TaskCard
              href="/admin/users"
              title="Foydalanuvchilar"
              description="Rollarni tayinlang va hisoblarni boshqaring."
            />
          )}
        </div>

        {!isAdmin && (
          <p className="mt-4 text-sm text-muted-foreground">
            Foydalanuvchilarni boshqarish va rol tayinlash faqat
            administratorlarga ochiq.
          </p>
        )}
      </section>
    </div>
  );
}

function TaskCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-1 p-4">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
