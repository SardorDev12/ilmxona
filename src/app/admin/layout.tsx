import Link from "next/link";
import { requireRole } from "@/lib/auth/session";

const NAV_SECTIONS = [
  {
    heading: "Umumiy",
    links: [{ href: "/admin", label: "Boshqaruv paneli" }],
  },
  {
    heading: "Kontent",
    links: [
      { href: "/admin/categories", label: "Kategoriyalar" },
      { href: "/admin/courses", label: "Kurslar" },
      { href: "/admin/glossary", label: "Lug'at" },
    ],
  },
  {
    heading: "Moderatsiya",
    links: [
      { href: "/admin/applications", label: "Muallif arizalari" },
      { href: "/admin/submissions", label: "Yuborilgan kontent" },
      { href: "/admin/reports", label: "Shikoyatlar" },
    ],
  },
  {
    heading: "Foydalanuvchilar",
    links: [{ href: "/admin/users", label: "Foydalanuvchilar" }],
  },
];

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const profile = await requireRole("MODERATOR", "/admin");

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="mb-6">
          <p className="text-sm font-semibold">Admin panel</p>
          <p className="text-xs text-muted-foreground">
            {profile.display_name ?? profile.username} · {profile.role}
          </p>
        </div>
        <nav className="flex flex-col gap-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.heading}>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {section.heading}
              </p>
              <ul className="flex flex-col gap-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
