import Link from "next/link";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/session";
import { CourseEditor } from "@/components/studio/course-editor";

export const metadata: Metadata = {
  title: "Yangi kurs",
  robots: { index: false },
};

export default async function NewCoursePage() {
  await requireProfile("/contributor/courses/new");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Boshqaruv paneli
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">Yangi kurs</span>
      </nav>

      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Yangi kurs</h1>
        <p className="max-w-2xl text-muted-foreground">
          Avval kursning tuzilishini belgilang — modullar, o&apos;quv
          natijalari va talablar. Keyin har bir modulga dars
          qo&apos;shasiz.
        </p>
      </header>

      <CourseEditor />
    </div>
  );
}
