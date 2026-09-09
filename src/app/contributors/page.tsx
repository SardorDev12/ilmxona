import Link from "next/link";
import type { Metadata } from "next";
import { authorStats, creators } from "@/lib/content/queries";
import { Avatar, EmptyState } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Mualliflar",
  description:
    "Ilmxona uchun o'zbek tilida o'quv materiallari yozayotgan mutaxassislar.",
};

export default async function ContributorsPage() {
  const [people, stats] = await Promise.all([creators(), authorStats()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mualliflar</h1>
        <p className="max-w-2xl text-muted-foreground">
          Ilmxona kontenti foydalanuvchilar tomonidan yoziladi va moderatorlar
          tomonidan ko&apos;rib chiqiladi.
        </p>
      </header>

      {people.length === 0 ? (
        <EmptyState
          title="Hozircha muallif yo'q"
          description="Birinchi kursi nashr etilgan foydalanuvchi shu ro'yxatda paydo bo'ladi."
          action={
            <ButtonLink href="/contributor/courses/new">
              Kurs yaratish
            </ButtonLink>
          }
        />
      ) : (
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {people.map((person) => {
            const count = stats.get(person.id) ?? { courses: 0, lessons: 0 };
            const name = person.display_name ?? person.username;

            return (
              <Link
                key={person.id}
                href={`/u/${person.username}`}
                className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex gap-4 p-5">
                    <Avatar name={name} size={56} />
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <h2 className="font-semibold">{name}</h2>
                      <p className="text-sm text-muted-foreground">
                        @{person.username}
                      </p>
                      {person.bio && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {person.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="outline">
                          {ROLE_LABELS[person.role as Role] ?? person.role}
                        </Badge>
                      </div>
                      <p className="pt-1 text-xs text-muted-foreground">
                        {count.courses} kurs · {count.lessons} dars
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

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
