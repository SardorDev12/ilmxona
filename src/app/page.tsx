import Link from "next/link";
import { courses, latestLessons, totals } from "@/content";
import { learningPaths } from "@/content/paths";
import { contributors } from "@/content/contributors";
import { subjects } from "@/content/subjects";
import { cn } from "@/lib/utils";
import { CourseCard, PathCard, Avatar } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  const latest = latestLessons(4);

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

        <dl className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm">
          <Stat value={totals.courses} label="kurs" />
          <Stat value={totals.lessons} label="dars" />
          <Stat value={totals.terms} label="lug'at atamasi" />
          <Stat value={totals.contributors} label="muallif" />
        </dl>
      </section>

      <Section title="Bilim sohalari">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {subjects.map((subject) => {
            const live = subject.courseCount > 0;

            const body = (
              <Card
                className={cn(
                  "h-full transition-shadow",
                  live ? "group-hover:shadow-md" : "opacity-60",
                )}
              >
                <CardContent className="flex flex-col gap-1 p-4">
                  <h3 className="font-semibold">{subject.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {subject.description}
                  </p>
                  <span className="mt-1 text-xs font-medium text-muted-foreground">
                    {live
                      ? `${subject.courseCount} ta kurs`
                      : "Tez orada"}
                  </span>
                </CardContent>
              </Card>
            );

            return live ? (
              <Link
                key={subject.name}
                href="/courses"
                className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {body}
              </Link>
            ) : (
              <div key={subject.name}>{body}</div>
            );
          })}
        </div>
      </Section>

      <Section
        title="Mashhur kurslar"
        action={{ href: "/courses", label: "Barcha kurslar" }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </Section>

      <Section
        title="O'quv yo'nalishlari"
        action={{ href: "/learning-paths", label: "Barchasi" }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {learningPaths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </Section>

      <Section title="So'nggi darslar">
        <div className="grid gap-3 sm:grid-cols-2">
          {latest.map(({ course, lesson }) => (
            <Link
              key={`${course.slug}-${lesson.slug}`}
              href={`/courses/${course.slug}/lessons/${lesson.slug}`}
              className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="flex flex-col gap-1.5 p-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    {course.title}
                  </span>
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {lesson.intro}
                  </p>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {lesson.durationMin} daqiqa · yangilandi{" "}
                    {lesson.updatedAt}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Mualliflar"
        action={{ href: "/contributors", label: "Barchasi" }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contributors.map((person) => (
            <Link
              key={person.username}
              href={`/u/${person.username}`}
              className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                  <Avatar name={person.name} size={56} />
                  <h3 className="font-semibold">{person.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {person.title}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <section className="my-12">
        <Card className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Bilimingiz bilan bo&apos;lishing
            </h2>
            <p className="max-w-lg opacity-90">
              O&apos;zbek tilida sifatli o&apos;quv materiali yozishga
              qiziqasizmi? Muallif bo&apos;lish uchun ariza qoldiring.
            </p>
            <ButtonLink
              href="/contributor/apply"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              Muallif bo&apos;lish
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
