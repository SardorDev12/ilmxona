import Link from "next/link";
import { Logo } from "./logo";

const FOOTER_LINKS = [
  {
    heading: "Platforma",
    links: [
      { href: "/courses", label: "Kurslar" },
      { href: "/learning-paths", label: "Yo'nalishlar" },
      { href: "/glossary", label: "Lug'at" },
      { href: "/search", label: "Qidirish" },
    ],
  },
  {
    heading: "Jamiyat",
    links: [
      { href: "/contributors", label: "Mualliflar" },
      { href: "/contributor/apply", label: "Muallif bo'lish" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <Logo size={28} />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            O&apos;zbek tilida bepul bilim o&apos;rganing.
          </p>
        </div>

        {FOOTER_LINKS.map((section) => (
          <div key={section.heading}>
            <h3 className="text-sm font-semibold">{section.heading}</h3>
            <ul className="mt-3 space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ilmxona.
      </div>
    </footer>
  );
}
