import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { requestOrigin } from "@/lib/site-url";

/**
 * Handles the redirect back from Supabase after an OAuth flow or an
 * email confirmation link (see emailRedirectTo / redirectTo in
 * src/app/(auth)/actions.ts).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Not `new URL(request.url).origin`: behind Cloudflare that can be the
  // internal host rather than the one the visitor used, which would set
  // the session cookie on one origin and then redirect to another —
  // losing the session and bouncing the user back to /login.
  const origin = await requestOrigin();

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Supabase reports a refused sign-in via the query string rather than a
  // code. Pass the reason through instead of showing a bare failure.
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(providerError)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Kirish kodi qaytmadi. Qaytadan urinib ko'ring.",
    )}`,
  );
}
