import type { Metadata } from "next";
import { publishedCourses } from "@/lib/content/queries";
import { CourseCard, EmptyState } from "@/components/content/cards";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kurslar",
  description:
    "Ilmxonadagi barcha kurslar — turli sohalar bo'yicha o'zbek tilidagi bepul darslar, mashqlar va testlar.",
};

export default async function CoursesPage() {
  const courses = await publishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kurslar</h1>
        <p className="text-muted-foreground">
          Har bir kurs modullarga bo&apos;lingan: nazariya, misollar, mashqlar
          va testlar.
        </p>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="Hozircha kurs yo'q"
          description="Birinchi kursni yaratib, ko'rib chiqishga yuboring. Tasdiqlangach u shu ro'yxatda ko'rinadi."
          action={
            <ButtonLink href="/contributor/courses/new">
              Kurs yaratish
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
