"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { hasRole, ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { Avatar } from "@/components/content/cards";
import { signOut } from "@/app/(auth)/actions";

type Props = {
  name: string;
  username: string;
  role: Role;
};

export function UserMenu({ name, username, role }: Props) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape — expected of any menu, and the
  // only way out for keyboard users once it is open.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const links = [
    { href: "/dashboard", label: "Boshqaruv paneli" },
    { href: `/u/${username}`, label: "Umumiy sahifam" },
    { href: "/settings", label: "Sozlamalar" },
  ];

  if (hasRole(role, "MODERATOR")) {
    links.push({ href: "/admin", label: "Admin panel" });
  }

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar name={name} size={28} />
        <span className="hidden sm:inline">{name}</span>
        <span aria-hidden className="text-xs text-muted-foreground">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{username} · {ROLE_LABELS[role]}
            </p>
          </div>

          <ul className="py-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <form action={signOut} className="border-t border-border">
            <button
              type="submit"
              role="menuitem"
              className="w-full cursor-pointer px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
            >
              Chiqish
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
