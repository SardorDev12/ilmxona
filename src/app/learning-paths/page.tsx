import type { Metadata } from "next";
import { learningPaths } from "@/content/paths";
import { PathCard } from "@/components/content/cards";

export const metadata: Metadata = {
  title: "O'quv yo'nalishlari",
  description:
    "Kasb egallash uchun tuzilgan ketma-ket kurslar to'plami — frontend, backend va veb asoslari.",
};

export default function LearningPathsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          O&apos;quv yo&apos;nalishlari
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Yo&apos;nalish — ma&apos;lum bir kasbga olib boradigan kurslar
          ketma-ketligi. Har birini boshidan oxirigacha bosqichma-bosqich
          o&apos;tasiz.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {learningPaths.map((path) => (
          <PathCard key={path.slug} path={path} />
        ))}
      </div>
    </div>
  );
}
