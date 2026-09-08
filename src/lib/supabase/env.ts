/**
 * Supabase is optional while the content is hard-coded. When the env vars
 * aren't set the app runs in demo mode: a fixed demo profile stands in for
 * a signed-in user so every page (dashboard, admin) stays reviewable.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so these must be present
 * during the build — not just at runtime — for a real deployment.
 */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return supabaseEnv() !== null;
}

/** For call sites that can't proceed without a client. */
export function requireSupabaseEnv() {
  const env = supabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, or as Worker build " +
        "variables in the Cloudflare dashboard.",
    );
  }
  return env;
}
