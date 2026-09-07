import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/courses", label: "Kurslar" },
  { href: "/learning-paths", label: "Yo'nalishlar" },
  { href: "/glossary", label: "Lug'at" },
];

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            I
          </span>
          <span>Ilmxona</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/search" variant="ghost" size="sm">
            Qidirish
          </ButtonLink>
          {profile ? (
            <ButtonLink href="/dashboard" variant="outline" size="sm">
              {profile.displayName ?? profile.username}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Kirish
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="sm">
                Ro&apos;yxatdan o&apos;tish
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
