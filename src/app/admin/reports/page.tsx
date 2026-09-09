import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Shikoyatlar",
  robots: { index: false },
};

export default async function AdminReportsPage() {
  await requireRole("MODERATOR", "/admin/reports");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Shikoyatlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Noto&apos;g&apos;ri yoki eskirgan ma&apos;lumot, mualliflik huquqi
          va spam haqidagi xabarlar (docs/PRD.md §24).
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Hozircha shikoyatlar yo&apos;q. Shikoyat yuborish imkoniyati
          darslarga izohlar bilan birga qo&apos;shiladi.
        </CardContent>
      </Card>
    </div>
  );
}
