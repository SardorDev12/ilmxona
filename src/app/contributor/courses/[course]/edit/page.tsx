import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { authorCourse } from "@/lib/content/queries";
import { CourseEditor } from "@/components/studio/course-editor";

export const metadata: Metadata = {
  title: "Kursni tahrirlash",
  robots: { index: false },
};

export default async function EditCoursePage({
  params,
}: PageProps<"/contributor/courses/[course]/edit">) {
  await requireProfile("/dashboard");
  const { course: slug } = await params;

  const found = await authorCourse(slug);
  if (!found) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-5 text-sm text-muted-foreground">
        <Link
          href={`/contributor/courses/${found.course.slug}`}
          className="hover:text-foreground"
        >
          {found.course.title}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">Tahrirlash</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Kursni tahrirlash
      </h1>

      <CourseEditor
        course={found.course}
        moduleTitles={found.modules.map((m) => m.title)}
      />
    </div>
  );
}
