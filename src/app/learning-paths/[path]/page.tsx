import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPath, pathCourses } from "@/lib/content/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: PageProps<"/learning-paths/[path]">): Promise<Metadata> {
  const { path: slug } = await params;
  const path = await getPath(slug);
  if (!path) return {};

  return {
    title: path.title,
    description: path.description,
    alternates: { canonical: `/learning-paths/${path.slug}` },
  };
}

export default async function LearningPathPage({
  params,
}: PageProps<"/learning-paths/[path]">) {
  const { path: slug } = await params;
  const path = await getPath(slug);
  if (!path) notFound();

  const courses = await pathCourses(path.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-5 text-sm text-muted-foreground">
        <Link href="/learning-paths" className="hover:text-foreground">
          Yo&apos;nalishlar
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{path.title}</span>
      </nav>

      <header className="mb-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {path.title}
          </h1>
          <Badge variant="outline">{path.difficulty}</Badge>
        </div>
        <p className="text-lg text-muted-foreground">{path.description}</p>
        <p className="text-sm text-muted-foreground">
          {courses.length} ta kurs · taxminan {path.duration_months} oy
        </p>
      </header>

      {courses.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Yo&apos;nalish tarkibi</h2>
          <ol className="flex flex-col gap-3">
            {courses.map((course, i) => (
              <li key={course.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  {i < courses.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  )}
                </div>

                <Link href={`/courses/${course.slug}`} className="flex-1 pb-3">
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col gap-1 p-4">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.subtitle}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {course.duration_hours} soat
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        {path.outcomes.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Natijalar</h2>
            <ul className="flex flex-col gap-2">
              {path.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-2 text-sm">
                  <span className="text-accent" aria-hidden>
                    ✓
                  </span>
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        )}

        {path.skills.length > 0 && (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Ko&apos;nikmalar</h2>
            <div className="flex flex-wrap gap-2">
              {path.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
