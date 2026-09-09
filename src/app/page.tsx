import Link from "next/link";
import {
  latestLessons,
  platformTotals,
  publishedCourses,
  publishedPaths,
  creators,
} from "@/lib/content/queries";
import {
  Avatar,
  CourseCard,
  EmptyState,
  PathCard,
} from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";

export default async function HomePage() {
  const [courses, paths, latest, people, totals] = await Promise.all([
    publishedCourses(),
    publishedPaths(),
    latestLessons(4),
    creators(),
    platformTotals(),
  ]);

  const isEmpty = totals.courses === 0 && totals.lessons === 0;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          O&apos;zbek tilida bepul bilim o&apos;rganing.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Amaliy va akademik fanlarni darslar, misollar, mashqlar va testlar
          orqali o&apos;rganing.
        </p>

        <form
          action="/search"
          className="flex w-full max-w-md items-center gap-2"
        >
          <Input
            type="search"
            name="q"
            placeholder="Nimani o'rganmoqchisiz?"
            aria-label="Qidirish"
          />
          <Button type="submit">Qidirish</Button>
        </form>

        {!isEmpty && (
          <dl className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm">
            <Stat value={totals.courses} label="kurs" />
            <Stat value={totals.lessons} label="dars" />
            <Stat value={totals.terms} label="lug'at atamasi" />
            <Stat value={totals.creators} label="muallif" />
          </dl>
        )}
      </section>

      {isEmpty ? (
        <section className="pb-16">
          <EmptyState
            title="Platforma hozircha bo'sh"
            description="Birinchi kursni siz yaratishingiz mumkin. Kurs yozib, ko'rib chiqishga yuboring — tasdiqlangach u shu yerda paydo bo'ladi."
            action={
              <ButtonLink href="/contributor/courses/new">
                Birinchi kursni yaratish
              </ButtonLink>
            }
          />
        </section>
      ) : (
        <>
          <Section
            title="Kurslar"
            action={{ href: "/courses", label: "Barcha kurslar" }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </Section>

          {paths.length > 0 && (
            <Section
              title="O'quv yo'nalishlari"
              action={{ href: "/learning-paths", label: "Barchasi" }}
            >
              <div className="grid gap-4 md:grid-cols-3">
                {paths.map((path) => (
                  <PathCard key={path.id} path={path} />
                ))}
              </div>
            </Section>
          )}

          {latest.length > 0 && (
            <Section title="So'nggi darslar">
              <div className="grid gap-3 sm:grid-cols-2">
                {latest.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/courses/${lesson.courses.slug}/lessons/${lesson.slug}`}
                    className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="h-full transition-shadow group-hover:shadow-md">
                      <CardContent className="flex flex-col gap-1.5 p-4">
                        <span className="text-xs font-medium uppercase tracking-wide text-primary">
                          {lesson.courses.title}
                        </span>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {lesson.intro}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {people.length > 0 && (
            <Section
              title="Mualliflar"
              action={{ href: "/contributors", label: "Barchasi" }}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {people.slice(0, 4).map((person) => (
                  <Link
                    key={person.id}
                    href={`/u/${person.username}`}
                    className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="h-full transition-shadow group-hover:shadow-md">
                      <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                        <Avatar
                          name={person.display_name ?? person.username}
                          size={56}
                        />
                        <h3 className="font-semibold">
                          {person.display_name ?? person.username}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{person.username}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      <section className="my-12">
        <Card className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Bilimingiz bilan bo&apos;lishing
            </h2>
            <p className="max-w-lg opacity-90">
              Kurs yoki dars yozing va ko&apos;rib chiqishga yuboring. Ariza
              kutish shart emas — hisobingiz bo&apos;lsa, bugunoq
              boshlashingiz mumkin.
            </p>
            <ButtonLink
              href="/contributor/courses/new"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              Kurs yaratish
            </ButtonLink>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-bold">{value}</dd>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="py-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {action && (
          <ButtonLink href={action.href} variant="ghost" size="sm">
            {action.label}
          </ButtonLink>
        )}
      </div>
      {children}
    </section>
  );
}
