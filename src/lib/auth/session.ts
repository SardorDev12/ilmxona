import "server-only";

import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { hasRole } from "./roles";

/** The current Supabase auth user, or null if signed out. Server-only. */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * The current user's app-level profile (role, username, ...), joined from
 * Supabase auth + our own `profiles` table. Null if signed out.
 */
export async function getCurrentProfile() {
  const user = await getAuthUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  return profile;
}

/** Redirects to /login if signed out; otherwise returns the profile. */
export async function requireProfile(nextPath?: string) {
  const profile = await getCurrentProfile();
  if (!profile) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${next}`);
  }
  return profile;
}

/** Redirects to /login (signed out) or /403 (signed in, insufficient role). */
export async function requireRole(required: Role, nextPath?: string) {
  const profile = await requireProfile(nextPath);
  if (!hasRole(profile.role, required)) {
    redirect("/403");
  }
  return profile;
}
