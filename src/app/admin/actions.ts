"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_HIERARCHY, type Role } from "@/lib/auth/roles";

export type AdminFormState = { error?: string; ok?: string };

/**
 * Role assignment (ADMIN only).
 *
 * Goes through the service role rather than the request-scoped client on
 * purpose: `role` is deliberately excluded from the column grant in
 * 003_grants.sql, so no signed-in user can write it through the REST API
 * even if they forge a request. That makes this action the single path
 * for changing a role, and the ADMIN check below the only gate on it.
 */
export async function setUserRole(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const actor = await requireRole("ADMIN", "/admin/users");

  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!ROLE_HIERARCHY.includes(role)) {
    return { error: "Noma'lum rol." };
  }

  // An admin removing their own admin rights locks everyone out if they
  // are the last one, and is almost always a misclick.
  if (userId === actor.id && role !== "ADMIN") {
    return { error: "O'z rolingizni pasaytira olmaysiz." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Rolni o'zgartirish sozlanmagan: SUPABASE_SERVICE_ROLE_KEY kiritilmagan.",
    };
  }

  const { data: target } = await admin
    .from("profiles")
    .select("username, role")
    .eq("id", userId)
    .single<{ username: string; role: Role }>();

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: `Saqlab bo'lmadi: ${error.message}` };

  // Role changes are exactly what the audit log exists for (PRD §35).
  await admin.from("audit_logs").insert({
    actor_id: actor.id,
    action: "role.change",
    target_type: "profile",
    target_id: userId,
    metadata: { from: target?.role ?? null, to: role },
  });

  revalidatePath("/admin/users");
  return {
    ok: `${target?.username ?? "Foydalanuvchi"} roli ${role} ga o'zgartirildi.`,
  };
}
