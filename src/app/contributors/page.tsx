import Link from "next/link";
import type { Metadata } from "next";
import { contributors } from "@/content/contributors";
import { courses, lessonCount } from "@/content";
import { Avatar } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mualliflar",
  description:
    "Ilmxona uchun o'zbek tilida o'quv materiallari yozayotgan mutaxassislar.",
};

export default function ContributorsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mualliflar</h1>
        <p className="max-w-2xl text-muted-foreground">
          Ilmxona kontenti amaliyotchi mutaxassislar tomonidan yoziladi va
          boshqa mutaxassislar tomonidan ko&apos;rib chiqiladi.
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {contributors.map((person) => {
          const authored = courses.filter(
            (c) => c.authorUsername === person.username,
          );
          const lessons = authored.reduce((n, c) => n + lessonCount(c), 0);

          return (
            <Link
              key={person.username}
              href={`/u/${person.username}`}
              className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex gap-4 p-5">
                  <Avatar name={person.name} size={56} />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h2 className="font-semibold">{person.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {person.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {person.expertise.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="pt-1 text-xs text-muted-foreground">
                      {authored.length} kurs · {lessons} dars ·{" "}
                      {person.learners.toLocaleString("uz")} o&apos;quvchi
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <h2 className="text-xl font-semibold">Siz ham yozishingiz mumkin</h2>
          <p className="max-w-lg text-sm text-muted-foreground">
            Har bir foydalanuvchi kurs va dars yarata oladi. Yozganingiz
            moderator ko&apos;rigidan o&apos;tgach nashr etiladi va siz
            muallif sifatida shu ro&apos;yxatga qo&apos;shilasiz.
          </p>
          <ButtonLink href="/contributor/courses/new">
            Kurs yaratish
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
