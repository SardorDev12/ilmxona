import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { hasRole, ROLE_LABELS } from "@/lib/auth/roles";
import { reviewQueueCount } from "@/lib/content/queries";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  // Moderators and admins share this area; the sections each can reach
  // differ, and every page re-checks its own requirement.
  const profile = await requireRole("MODERATOR", "/admin");
  const isAdmin = hasRole(profile.role, "ADMIN");

  // The badge is the notification: a course an author has just added a
  // lesson to shows up here without anyone being emailed.
  const pending = await reviewQueueCount();

  const sections: {
    heading: string;
    links: { href: string; label: string; count?: number }[];
  }[] = [
    {
      heading: "Umumiy",
      links: [{ href: "/admin", label: "Boshqaruv paneli" }],
    },
    {
      heading: "Moderatsiya",
      links: [
        { href: "/admin/review", label: "Ko'rib chiqish", count: pending },
        { href: "/admin/courses", label: "Kurslar" },
        { href: "/admin/reports", label: "Shikoyatlar" },
      ],
    },
    // User management and role assignment are admin-only.
    ...(isAdmin
      ? [
          {
            heading: "Administrator",
            links: [{ href: "/admin/users", label: "Foydalanuvchilar" }],
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="mb-6">
          <p className="text-sm font-semibold">Admin panel</p>
          <p className="truncate text-xs text-muted-foreground">
            {profile.display_name ?? profile.username}
          </p>
          <Badge variant="primary" className="mt-2">
            {ROLE_LABELS[profile.role]}
          </Badge>
        </div>

        <nav className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.heading}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.heading}
              </p>
              <ul className="flex flex-col gap-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {link.label}
                      {link.count ? (
                        <Badge variant="primary">{link.count}</Badge>
                      ) : null}
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
