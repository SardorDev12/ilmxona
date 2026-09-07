import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Ruxsat yo'q" };

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Ruxsat yo&apos;q</h1>
      <p className="text-muted-foreground">
        Ushbu sahifani ko&apos;rish uchun sizda yetarli huquq yo&apos;q.
      </p>
      <ButtonLink href="/">Bosh sahifaga qaytish</ButtonLink>
    </div>
  );
}
