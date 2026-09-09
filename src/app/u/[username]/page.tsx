import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfileByUsername, publishedByAuthor } from "@/lib/content/queries";
import { Avatar, CourseCard } from "@/components/content/cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/auth/roles";
import type { Role } from "@/lib/auth/roles";

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const person = await getProfileByUsername(username);
  if (!person) return {};

  const name = person.display_name ?? person.username;

  return {
    title: name,
    description: person.bio ?? `${name} — Ilmxona muallifi.`,
    alternates: { canonical: `/u/${person.username}` },
  };
}

export default async function ProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;
  const person = await getProfileByUsername(username);
  if (!person) notFound();

  const { courses, lessons } = await publishedByAuthor(person.id);
  const name = person.display_name ?? person.username;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={name} size={80} />
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <p className="text-muted-foreground">@{person.username}</p>
          </div>
          {person.bio && (
            <p className="max-w-2xl leading-relaxed text-foreground/90">
              {person.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="outline">
              {ROLE_LABELS[person.role as Role] ?? person.role}
            </Badge>
          </div>
        </div>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard value={courses.length} label="Kurs" />
        <StatCard value={lessons.length} label="Dars" />
        <StatCard
          value={new Date(person.created_at).getFullYear()}
          label="Qo'shilgan yil"
        />
      </div>

      {courses.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Kurslari</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {lessons.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">So&apos;nggi darslari</h2>
          <ul className="flex flex-col gap-2">
            {lessons.slice(0, 8).map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${lesson.courses.slug}/lessons/${lesson.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{lesson.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {lesson.courses.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {courses.length === 0 && lessons.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Bu foydalanuvchining hali nashr etilgan materiali yo&apos;q.
        </p>
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
