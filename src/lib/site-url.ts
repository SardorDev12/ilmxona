import "server-only";

import { headers } from "next/headers";

/**
 * Origin of the current request, e.g. https://test.ilmxona.uz.
 *
 * Auth redirects are built from this rather than from a build-time env
 * var, because the app answers on several hostnames (the workers.dev URL,
 * the test subdomain, the production domain) and an OAuth round trip has
 * to return to whichever one the visitor actually used. A build-time
 * value would send everyone to a single host — and if it were unset, to
 * the literal string "undefined".
 *
 * Supabase only honours redirects that appear on its allow list, so every
 * hostname still has to be listed under Authentication → URL Configuration.
 */
export async function requestOrigin(): Promise<string> {
  const headerList = await headers();

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (host) {
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://ilmxona.uz";
}
