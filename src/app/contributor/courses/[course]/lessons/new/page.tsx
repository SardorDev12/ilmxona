import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { authorCourse } from "@/lib/content/queries";
import { LessonEditor } from "@/components/studio/lesson-editor";

export const metadata: Metadata = {
  title: "Yangi dars",
  robots: { index: false },
};

export default async function NewLessonPage({
  params,
}: PageProps<"/contributor/courses/[course]/lessons/new">) {
  // Any signed-in user may write. Publishing stays with moderators —
  // review is what filters quality, not a role gate on who may write.
  await requireProfile("/dashboard");
  const { course: slug } = await params;

  const found = await authorCourse(slug);
  if (!found) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link
          href={`/contributor/courses/${found.course.slug}`}
          className="hover:text-foreground"
        >
          {found.course.title}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">Yangi dars</span>
      </nav>

      <LessonEditor course={found.course} modules={found.modules} />
    </div>
  );
}
