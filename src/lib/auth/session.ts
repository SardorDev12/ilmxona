import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasRole, type Role } from "./roles";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: Role;
  created_at: string;
};

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
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, role, created_at")
    .eq("id", user.id)
    .single<Profile>();

  return data;
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
