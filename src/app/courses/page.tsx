import type { Metadata } from "next";
import { courses } from "@/content";
import { CourseCard } from "@/components/content/cards";

export const metadata: Metadata = {
  title: "Kurslar",
  description:
    "Ilmxonadagi barcha kurslar — turli sohalar bo'yicha o'zbek tilidagi bepul darslar, mashqlar va testlar.",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kurslar</h1>
        <p className="text-muted-foreground">
          Har bir kurs modullarga bo&apos;lingan: nazariya, misollar, mashqlar
          va testlar.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </div>
  );
}
