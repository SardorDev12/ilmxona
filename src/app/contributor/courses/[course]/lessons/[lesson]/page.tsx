import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { authorLesson } from "@/lib/content/queries";
import { LessonEditor } from "@/components/studio/lesson-editor";

export const metadata: Metadata = {
  title: "Darsni tahrirlash",
  robots: { index: false },
};

export default async function EditLessonPage({
  params,
}: PageProps<"/contributor/courses/[course]/lessons/[lesson]">) {
  await requireProfile("/dashboard");
  const { course: courseSlug, lesson: lessonSlug } = await params;

  const found = await authorLesson(courseSlug, lessonSlug);
  if (!found) notFound();

  // Once submitted, the lesson belongs to the review — editing it under
  // a moderator would change what they are reading.
  if (
    found.lesson.status !== "DRAFT" &&
    found.lesson.status !== "CHANGES_REQUESTED"
  ) {
    redirect(`/courses/${courseSlug}/lessons/${lessonSlug}`);
  }

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
        <span className="text-foreground">{found.lesson.title}</span>
      </nav>

      {found.lesson.review_note && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
          Moderator izohi: {found.lesson.review_note}
        </p>
      )}

      <LessonEditor
        course={found.course}
        modules={found.modules}
        lesson={found.lesson}
      />
    </div>
  );
}
