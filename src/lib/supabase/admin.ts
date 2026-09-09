import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS entirely, so it must never be reached
 * from the browser — hence `server-only`, and a key deliberately not
 * prefixed NEXT_PUBLIC_ (that prefix inlines values into the client
 * bundle).
 *
 * Only for operations the public API cannot express, such as deleting an
 * auth user. Everything else should go through the request-scoped client
 * so RLS still applies.
 *
 * Returns null when unconfigured, so callers can report that rather than
 * crash — the key is optional until account deletion is needed.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
