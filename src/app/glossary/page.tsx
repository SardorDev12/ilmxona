import type { Metadata } from "next";
import { publishedGlossary } from "@/lib/content/queries";
import { EmptyState, TermCard } from "@/components/content/cards";

export const metadata: Metadata = {
  title: "Lug'at",
  description:
    "Atamalarning o'zbek tilidagi izohli lug'ati — ta'rifi, inglizcha va ruscha muqobili bilan.",
};

export default async function GlossaryPage() {
  const terms = await publishedGlossary();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Lug&apos;at</h1>
        <p className="max-w-2xl text-muted-foreground">
          Atamalarning o&apos;zbekcha izohi, inglizcha va ruscha muqobili
          bilan.
        </p>
      </header>

      {terms.length === 0 ? (
        <EmptyState
          title="Lug'at hozircha bo'sh"
          description="Atamalar darslar bilan birga qo'shiladi."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((term) => (
            <TermCard key={term.id} term={term} />
          ))}
        </div>
      )}
    </div>
  );
}
