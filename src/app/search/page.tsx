import Link from "next/link";
import type { Metadata } from "next";
import { search } from "@/content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Qidiruv",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;
  const raw = params.q;
  const query = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  const results = search(query);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-5 text-3xl font-bold tracking-tight">Qidiruv</h1>

      <form action="/search" className="mb-8 flex items-center gap-2">
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Nimani o'rganmoqchisiz?"
          aria-label="Qidirish"
        />
        <Button type="submit">Qidirish</Button>
      </form>

      {query && (
        <p className="mb-4 text-sm text-muted-foreground">
          <strong>{query}</strong> bo&apos;yicha {results.length} ta natija
        </p>
      )}

      {query && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col gap-2 p-8 text-center">
            <p className="font-medium">Hech narsa topilmadi</p>
            <p className="text-sm text-muted-foreground">
              Boshqa so&apos;z bilan urinib ko&apos;ring yoki{" "}
              <Link href="/courses" className="text-primary hover:underline">
                kurslar ro&apos;yxatini
              </Link>{" "}
              ko&apos;rib chiqing.
            </p>
          </CardContent>
        </Card>
      )}

      <ul className="flex flex-col gap-3">
        {results.map((result) => (
          <li key={result.href}>
            <Link
              href={result.href}
              className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-1.5 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.kind}</Badge>
                    <h2 className="font-semibold">{result.title}</h2>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {result.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {!query && (
        <p className="text-sm text-muted-foreground">
          Kurs, dars, atama yoki muallif nomini kiriting. Qidiruv{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            o&apos;zbek
          </code>{" "}
          va{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">ozbek</code>{" "}
          kabi yozilish farqlarini hisobga oladi.
        </p>
      )}
    </div>
  );
}
