import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Muallif bo'lish",
  description:
    "Ilmxonaga o'quv materiali yozish uchun ariza qoldiring.",
};

export default function ContributorApplyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Muallif bo&apos;lish
        </h1>
        <p className="text-muted-foreground">
          Arizangizni ko&apos;rib chiqamiz va bir hafta ichida javob beramiz.
          Tasdiqlangan mualliflar qoralama yozadi, tayyor material esa boshqa
          mutaxassis ko&apos;rigidan o&apos;tgach nashr etiladi.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ariza</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expertise">Mutaxassislik sohangiz</Label>
              <Input
                id="expertise"
                name="expertise"
                placeholder="Masalan: JavaScript, React"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="experience">Tajribangiz</Label>
              <textarea
                id="experience"
                name="experience"
                rows={4}
                placeholder="Qanchadan beri ishlaysiz, qanday loyihalarda qatnashgansiz?"
                className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="portfolio">Portfolio yoki profil havolasi</Label>
              <Input
                id="portfolio"
                name="portfolio"
                type="url"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivation">Nima uchun yozmoqchisiz?</Label>
              <textarea
                id="motivation"
                name="motivation"
                rows={4}
                className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sample">Namuna material</Label>
              <textarea
                id="sample"
                name="sample"
                rows={6}
                placeholder="Qisqa dars yoki tushuntirish yozib ko'ring."
                className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled>
                Ariza yuborish
              </Button>
              <p className="text-xs text-muted-foreground">
                Demo rejim: ariza hozircha saqlanmaydi.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
