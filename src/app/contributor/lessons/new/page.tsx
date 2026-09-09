import Link from "next/link";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { authorableCourses } from "@/lib/content/queries";
import { LessonEditor } from "@/components/studio/lesson-editor";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/content/cards";

export const metadata: Metadata = {
  title: "Yangi dars",
  robots: { index: false },
};

export default async function NewLessonPage({
  searchParams,
}: PageProps<"/contributor/lessons/new">) {
  // Any signed-in user may draft and submit. Publishing stays with
  // moderators — review is what filters quality, not a role gate on who
  // is allowed to write.
  const profile = await requireProfile("/contributor/lessons/new");
  const courses = await authorableCourses(profile.id);

  const { course } = await searchParams;
  const initialCourseSlug = Array.isArray(course) ? course[0] : (course ?? "");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Boshqaruv paneli
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">Yangi dars</span>
      </nav>

      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Yangi dars</h1>
        <p className="max-w-2xl text-muted-foreground">
          Darsni yozib, ko&apos;rib chiqishga yuboring. Tasdiqlangandan
          keyin u nashr etiladi — mualliflar darsni
          to&apos;g&apos;ridan-to&apos;g&apos;ri nashr eta olmaydi.
        </p>
        <p className="text-sm text-muted-foreground">
          Muallif: {profile.display_name ?? profile.username}
        </p>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="Avval kurs kerak"
          description="Dars kursga tegishli bo'ladi. Kurs yarating — keyin unga dars qo'shasiz."
          action={
            <ButtonLink href="/contributor/courses/new">
              Kurs yaratish
            </ButtonLink>
          }
        />
      ) : (
        <LessonEditor
          courses={courses}
          initialCourseSlug={initialCourseSlug}
        />
      )}
    </div>
  );
}
