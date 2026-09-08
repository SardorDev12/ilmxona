import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { courses } from "@/content";
import { LessonEditor } from "@/components/studio/lesson-editor";

export const metadata: Metadata = {
  title: "Yangi dars",
  robots: { index: false },
};

export default async function NewLessonPage() {
  // Contributors and above may draft; publishing stays with reviewers
  // (docs/PRD.md §22, §28).
  const profile = await requireRole("CONTRIBUTOR", "/contributor/lessons/new");

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
          keyin u nashr etiladi — mualliflar darsni to&apos;g&apos;ridan-to&apos;g&apos;ri
          nashr eta olmaydi.
        </p>
        <p className="text-sm text-muted-foreground">
          Muallif: {profile.display_name ?? profile.username}
        </p>
      </header>

      <LessonEditor courses={courses} />
    </div>
  );
}
