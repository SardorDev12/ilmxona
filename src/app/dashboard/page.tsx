import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signOut } from "../(auth)/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Boshqaruv paneli" };

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Xush kelibsiz, {profile.display_name ?? profile.username}
          </h1>
          <Badge variant="primary" className="mt-2">
            {profile.role}
          </Badge>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Chiqish
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>O&apos;quv statistikasi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hali hech qanday faoliyat yo&apos;q. Kurslarni ko&apos;rib chiqing
          va o&apos;rganishni boshlang.
        </CardContent>
      </Card>
    </div>
  );
}
