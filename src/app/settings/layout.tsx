import Link from "next/link";
import { requireProfile } from "@/lib/auth/session";

const NAV = [
  { href: "/settings", label: "Profil" },
  { href: "/settings/account", label: "Hisob" },
];

export default async function SettingsLayout({
  children,
}: LayoutProps<"/settings">) {
  await requireProfile("/settings");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>
      </header>

      <div className="grid gap-8 md:grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label="Sozlamalar bo'limlari">
          <ul className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
