# Ilmxona

O'zbek tilida bepul bilim o'rganing. Full product spec: [`docs/PRD.md`](docs/PRD.md).

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS · Supabase (Postgres + Auth) · Cloudflare Workers (via OpenNext).

This repo currently implements **Phase 1 — Foundation** only (project setup, database, authentication, design system, user roles, admin foundation). See `docs/PRD.md` §42 for the full phase breakdown.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
3. Enable the **Google** provider under Supabase Auth → Providers (Telegram is not a native Supabase provider — see "Known gaps").
4. Apply the schema: open the Supabase SQL editor and run [`supabase/sql/001_profiles.sql`](supabase/sql/001_profiles.sql). It creates the `role` enum, `profiles` and `audit_logs` tables, the trigger that auto-creates a profile for every new auth user, and the RLS policies.
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Data access

The app talks to Postgres through **PostgREST via `@supabase/supabase-js`**, not a direct database connection. That keeps every query on `fetch`, which works unchanged on Node.js and on the Cloudflare Workers runtime — no TCP driver, no connection pooling, no Hyperdrive binding needed.

The tradeoff: **Row Level Security is the real authorization boundary.** Queries run with the signed-in user's own JWT, so an RLS policy gap is a data leak — the `requireRole` checks in `src/lib/auth/session.ts` are for redirects and UI, not security. Any new table needs RLS policies in the same SQL migration that creates it.

SQL files in `supabase/sql/` are the source of truth for schema; apply them in filename order.

## Project layout

```
supabase/sql/             Schema, triggers and RLS policies (source of truth)
src/lib/supabase/         Browser/server Supabase clients + session-refresh helper
src/lib/auth/             Role hierarchy (roles.ts) + requireProfile/requireRole (session.ts)
src/components/ui/        Design-system primitives (Button, Input, Card, Badge)
src/components/layout/    Site header/footer
src/app/(auth)/           Login, register, email-confirmation pages + server actions
src/app/admin/            Role-gated admin shell (MODERATOR+) with an overview page
src/proxy.ts              Next 16's `proxy` convention (formerly `middleware`) — refreshes the Supabase session cookie
```

## Cloudflare deployment

Deployed as a Cloudflare Worker via [OpenNext](https://opennext.js.org/cloudflare):

```bash
npm run cf:typegen   # regenerate worker-configuration.d.ts from wrangler.jsonc
npm run cf:build     # build + adapt the app for Cloudflare
npm run cf:preview   # build + run locally under workerd
npm run cf:deploy    # build + deploy
```

**Workers Builds (CI) settings** — in the Cloudflare dashboard for this Worker:

| Setting | Value |
| --- | --- |
| Build command | `npm run cf:build` |
| Deploy command | `npx wrangler deploy` |
| Production branch | `dev` |

The build command is required: `wrangler deploy` publishes `.open-next/worker.js` (per `wrangler.jsonc`), which only exists after `cf:build` runs.

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` as environment variables on the Worker (Settings → Variables) — `NEXT_PUBLIC_*` values are inlined at build time, so they must be present for the build, not just at runtime.

## Known gaps (intentionally out of Phase 1 scope)

- **Telegram login** (PRD §8): Supabase Auth has no native Telegram provider. It needs a custom Telegram Login Widget + server-side hash verification flow — planned for a later phase.
- Course/lesson/exercise/quiz data models, content workflow, search, glossary, etc. are Phase 2+ (`docs/PRD.md` §42).
