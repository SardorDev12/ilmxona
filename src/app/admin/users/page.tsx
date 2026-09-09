import Link from "next/link";
import type { Metadata } from "next";
import { isDemoMode, requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ROLE_DESCRIPTIONS, ROLE_HIERARCHY, ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { RoleForm } from "@/components/admin/role-form";
import { Avatar } from "@/components/content/cards";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Foydalanuvchilar",
  robots: { index: false },
};

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  role: Role;
  created_at: string;
};

export default async function AdminUsersPage() {
  // Admin-only: the layout admits moderators, so this page gates itself.
  const actor = await requireRole("ADMIN", "/admin/users");

  // No user table to read without Supabase; querying anyway throws and
  // takes the page down rather than showing an empty list.
  let users: Row[] = [];
  let error: { message: string } | null = null;

  if (!isDemoMode()) {
    const supabase = await createClient();
    const result = await supabase
      .from("profiles")
      .select("id, username, display_name, role, created_at")
      .order("created_at", { ascending: false })
      .returns<Row[]>();

    users = result.data ?? [];
    error = result.error;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rolni o&apos;zgartirish darhol kuchga kiradi va audit jurnaliga
          yoziladi.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <dl className="grid gap-2 sm:grid-cols-2">
            {ROLE_HIERARCHY.map((role) => (
              <div key={role} className="text-sm">
                <dt className="font-medium">{ROLE_LABELS[role]}</dt>
                <dd className="text-muted-foreground">
                  {ROLE_DESCRIPTIONS[role]}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm">
          Ro&apos;yxatni yuklab bo&apos;lmadi: {error.message}
        </p>
      )}

      <Card>
        <ul className="divide-y divide-border">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={user.display_name ?? user.username} size={36} />
                <div className="min-w-0">
                  <Link
                    href={`/u/${user.username}`}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {user.display_name ?? user.username}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    @{user.username} ·{" "}
                    {new Date(user.created_at).toLocaleDateString("uz")}
                  </span>
                </div>
              </div>

              <RoleForm
                userId={user.id}
                currentRole={user.role}
                isSelf={user.id === actor.id}
              />
            </li>
          ))}

          {users.length === 0 && !error && (
            <li className="px-5 py-8 text-center text-sm text-muted-foreground">
              Hozircha foydalanuvchilar yo&apos;q.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
