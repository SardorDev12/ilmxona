import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Ko'rib chiqish",
  robots: { index: false },
};

/** Placeholder queue — submissions still live in the browser (see
 *  src/lib/studio/), so there is nothing server-side to list yet. */
const PENDING = [
  { kind: "Kurs", title: "Python asoslari", author: "aziz", at: "2026-09-08" },
  {
    kind: "Dars",
    title: "TypeScript: turlar",
    author: "malika",
    at: "2026-09-07",
  },
];

export default async function AdminReviewPage() {
  await requireRole("MODERATOR", "/admin/review");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ko&apos;rib chiqish</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Foydalanuvchilar yuborgan kurs va darslar. Tasdiqlangach nashr
          etiladi va muallif Muallif rolini oladi.
        </p>
      </div>

      <Card>
        <ul className="divide-y divide-border">
          {PENDING.map((item) => (
            <li
              key={item.title}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  @{item.author} · {item.at}
                </p>
              </div>
              <Badge variant="outline">{item.kind}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-sm text-muted-foreground">
        Demo ma&apos;lumot: yuborilgan kontent hozircha brauzerda saqlanadi,
        shuning uchun bu ro&apos;yxat qat&apos;iy kiritilgan. Kontent
        bazaga ko&apos;chirilgach haqiqiy navbat ko&apos;rinadi.
      </p>
    </div>
  );
}
