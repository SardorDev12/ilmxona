import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, ButtonLink } from "@/components/ui/button";

const INITIAL_CATEGORIES = [
  { name: "HTML", description: "Veb-sahifalar tuzilishi" },
  { name: "CSS", description: "Uslublash va joylashuv" },
  { name: "JavaScript", description: "Interaktiv dasturlash" },
  { name: "Git", description: "Versiyalarni boshqarish" },
  { name: "SQL", description: "Ma'lumotlar bazalari" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          O&apos;zbek tilida bepul bilim o&apos;rganing.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Dasturlash va boshqa amaliy fanlarni darslar, misollar, mashqlar va
          testlar orqali o&apos;zbek tilida o&apos;rganing.
        </p>

        <form
          action="/search"
          className="flex w-full max-w-md items-center gap-2"
        >
          <Input
            type="search"
            name="q"
            placeholder="Nimani o'rganmoqchisiz?"
            aria-label="Qidirish"
          />
          <Button type="submit">Qidirish</Button>
        </form>
      </section>

      <section className="py-12">
        <h2 className="mb-6 text-2xl font-semibold">Mashhur kategoriyalar</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {INITIAL_CATEGORIES.map((category) => (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {category.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Mashhur kurslar</h2>
          <ButtonLink href="/courses" variant="ghost" size="sm">
            Barchasini ko&apos;rish
          </ButtonLink>
        </div>
        <EmptyState message="Kurslar hali qo'shilmagan. Tez orada bu yerda paydo bo'ladi." />
      </section>

      <section className="py-12">
        <h2 className="mb-6 text-2xl font-semibold">O&apos;quv yo&apos;nalishlari</h2>
        <EmptyState message="Yo'nalishlar hali qo'shilmagan." />
      </section>

      <section className="py-12">
        <h2 className="mb-6 text-2xl font-semibold">So&apos;nggi darslar</h2>
        <EmptyState message="Darslar hali nashr etilmagan." />
      </section>

      <section className="py-12">
        <h2 className="mb-6 text-2xl font-semibold">Mualliflar</h2>
        <EmptyState message="Mualliflar hali qo'shilmagan." />
      </section>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
