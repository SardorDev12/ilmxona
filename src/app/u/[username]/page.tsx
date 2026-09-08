import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { contributors, getContributor } from "@/content/contributors";
import { courses, courseLessons, lessonCount } from "@/content";
import { Avatar, CourseCard } from "@/components/content/cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function generateStaticParams() {
  return contributors.map((c) => ({ username: c.username }));
}

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const person = getContributor(username);
  if (!person) return {};

  return {
    title: person.name,
    description: `${person.title}. ${person.bio}`,
    alternates: { canonical: `/u/${person.username}` },
  };
}

export default async function ProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;
  const person = getContributor(username);
  if (!person) notFound();

  const authored = courses.filter((c) => c.authorUsername === person.username);
  const reviewed = courses.filter(
    (c) => c.reviewerUsername === person.username,
  );
  const lessons = authored.reduce((n, c) => n + lessonCount(c), 0);
  const authoredLessons = courses.flatMap((course) =>
    courseLessons(course)
      .filter((l) => l.authorUsername === person.username)
      .map((lesson) => ({ course, lesson })),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={person.name} size={80} />
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {person.name}
            </h1>
            <p className="text-muted-foreground">
              {person.title} · @{person.username}
            </p>
          </div>
          <p className="max-w-2xl leading-relaxed text-foreground/90">
            {person.bio}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {person.expertise.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard value={authored.length} label="Kurs" />
        <StatCard value={lessons} label="Dars" />
        <StatCard value={reviewed.length} label="Ko'rib chiqilgan kurs" />
        <StatCard
          value={person.learners.toLocaleString("uz")}
          label="O'quvchi"
        />
      </div>

      {authored.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Kurslari</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {authored.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>
      )}

      {authoredLessons.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">So&apos;nggi darslari</h2>
          <ul className="flex flex-col gap-2">
            {authoredLessons.slice(0, 8).map(({ course, lesson }) => (
              <li key={`${course.slug}-${lesson.slug}`}>
                <Link
                  href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{lesson.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {course.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-0.5 p-4">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}
