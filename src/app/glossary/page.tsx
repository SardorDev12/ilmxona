import type { Metadata } from "next";
import { glossary } from "@/content/glossary";
import { TermCard } from "@/components/content/cards";

export const metadata: Metadata = {
  title: "Lug'at",
  description:
    "Dasturlash atamalarining o'zbek tilidagi izohli lug'ati: API, DOM, JSON, HTTP va boshqalar.",
};

export default function GlossaryPage() {
  const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Lug&apos;at</h1>
        <p className="max-w-2xl text-muted-foreground">
          Texnik atamalarning o&apos;zbekcha izohi, inglizcha va ruscha
          muqobili bilan.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((term) => (
          <TermCard key={term.slug} term={term} />
        ))}
      </div>
    </div>
  );
}
