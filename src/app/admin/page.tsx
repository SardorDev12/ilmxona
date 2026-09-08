import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { totals } from "@/content";
import { contributors } from "@/content/contributors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin" };

/** Hard-coded moderation queue until the backend is wired up. */
const PENDING = [
  {
    kind: "Muallif arizasi",
    title: "Jasur Toshmatov — Python",
    submitted: "2026-09-05",
  },
  {
    kind: "Kontent",
    title: "TypeScript asoslari — 1-modul",
    submitted: "2026-09-04",
  },
  {
    kind: "Shikoyat",
    title: "SQL / JOIN turlari darsida xato",
    submitted: "2026-09-03",
  },
];

export default async function AdminOverviewPage() {
  // The layout already gates /admin/*, but Next.js can start rendering a
  // page's data fetching before a parent layout's redirect() takes effect
  // (they're not strictly sequential). Re-checking here keeps the page from
  // doing work for a request that's about to be redirected.
  await requireRole("MODERATOR", "/admin");

  const cards = [
    { label: "Jami foydalanuvchilar", value: 1284 },
    { label: "Faol foydalanuvchilar", value: 412 },
    { label: "Kurslar", value: totals.courses },
    { label: "Darslar", value: totals.lessons },
    { label: "Mualliflar", value: totals.contributors },
    { label: "Ko'rib chiqish kutilmoqda", value: PENDING.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Boshqaruv paneli</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
        <h2 className="mb-3 text-lg font-semibold">Navbatdagi ishlar</h2>
        <Card>
          <ul className="divide-y divide-border">
            {PENDING.map((item) => (
              <li
                key={item.title}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{item.title}</span>
                  <Badge variant="outline">{item.kind}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.submitted}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Eng faol mualliflar</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              O&apos;quvchilar soni bo&apos;yicha
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {contributors.map((person) => (
                <li
                  key={person.username}
                  className="flex items-center justify-between gap-3 px-6 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{person.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {person.title}
                    </span>
                  </div>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {person.learners.toLocaleString("uz")}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <p className="text-sm text-muted-foreground">
        Demo rejim: raqamlar qat&apos;iy kiritilgan. Backend ulangach, bu
        sahifa haqiqiy ma&apos;lumotni ko&apos;rsatadi.
      </p>
    </div>
  );
}
