import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { glossary, getGlossaryTerm } from "@/content/glossary";
import { courses, courseLessons } from "@/content";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function generateStaticParams() {
  return glossary.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/glossary/[term]">): Promise<Metadata> {
  const { term: slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};

  return {
    title: `${term.term} nima?`,
    description: term.definition,
    alternates: { canonical: `/glossary/${term.slug}` },
  };
}

export default async function GlossaryTermPage({
  params,
}: PageProps<"/glossary/[term]">) {
  const { term: slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const related = term.related
    .map(getGlossaryTerm)
    .filter((t) => t !== undefined);

  // Lessons that list this term as related.
  const lessons = courses.flatMap((course) =>
    courseLessons(course)
      .filter((lesson) => lesson.relatedTerms.includes(term.slug))
      .map((lesson) => ({ course, lesson })),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-5 text-sm text-muted-foreground">
        <Link href="/glossary" className="hover:text-foreground">
          Lug&apos;at
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{term.term}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{term.term}</h1>
        <dl className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <dt className="font-medium">Inglizcha:</dt>
            <dd>{term.en}</dd>
          </div>
          {term.ru && (
            <div className="flex gap-2">
              <dt className="font-medium">Ruscha:</dt>
              <dd>{term.ru}</dd>
            </div>
          )}
        </dl>
      </header>

      <p className="mb-6 text-lg leading-relaxed">{term.definition}</p>

      {term.example && (
        <Card className="mb-8">
          <CardContent className="p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Misol
            </h2>
            <p className="leading-relaxed">{term.example}</p>
          </CardContent>
        </Card>
      )}

      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Bog&apos;liq atamalar</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/glossary/${r.slug}`}>
                <Badge variant="outline" className="hover:border-primary">
                  {r.term}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lessons.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Tegishli darslar</h2>
          <ul className="flex flex-col gap-2">
            {lessons.map(({ course, lesson }) => (
              <li key={`${course.slug}-${lesson.slug}`}>
                <Link
                  href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{lesson.title}</span>
                  <span className="text-xs text-muted-foreground">
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
