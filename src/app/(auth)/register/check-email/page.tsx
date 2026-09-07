import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Emailingizni tasdiqlang" };

export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Emailingizni tekshiring</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hisobingizni faollashtirish uchun sizga yuborilgan havolani bosing.
        </CardContent>
      </Card>
    </div>
  );
}
