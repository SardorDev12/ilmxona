import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/content/cards";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/courses", label: "Kurslar" },
  { href: "/learning-paths", label: "Yo'nalishlar" },
  { href: "/glossary", label: "Lug'at" },
  { href: "/contributors", label: "Mualliflar" },
];

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0" aria-label="Ilmxona bosh sahifasi">
          <Logo size={32} />
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
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Avatar
                name={profile.display_name ?? profile.username}
                size={28}
              />
              <span className="hidden sm:inline">
                {profile.display_name ?? profile.username}
              </span>
            </Link>
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

      <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm font-medium text-muted-foreground md:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
