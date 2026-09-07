/**
 * NEXT_PUBLIC_* values are inlined at build time, so a missing one produces
 * a confusing "Invalid URL" deep inside supabase-js rather than something
 * that points at the actual problem (unset variable in the build
 * environment). Fail with the variable name instead.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in .env.local for local development, or as a ` +
        `Worker build variable in the Cloudflare dashboard for deploys.`,
    );
  }
  return value;
}

export function supabaseEnv() {
  return {
    url: required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    anonKey: required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}
