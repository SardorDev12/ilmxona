import type { Metadata } from "next";
import { publishedPaths } from "@/lib/content/queries";
import { EmptyState, PathCard } from "@/components/content/cards";

export const metadata: Metadata = {
  title: "O'quv yo'nalishlari",
  description:
    "Kasb egallash uchun tuzilgan ketma-ket kurslar to'plami.",
};

export default async function LearningPathsPage() {
  const paths = await publishedPaths();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          O&apos;quv yo&apos;nalishlari
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Yo&apos;nalish — ma&apos;lum bir kasbga olib boradigan kurslar
          ketma-ketligi.
        </p>
      </header>

      {paths.length === 0 ? (
        <EmptyState
          title="Hozircha yo'nalish yo'q"
          description="Yo'nalishlar bir nechta kurs to'plangach tuziladi."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      )}
    </div>
  );
}
