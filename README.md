# Ilmxona

O'zbek tilida bepul bilim o'rganing. Full product spec: [`docs/PRD.md`](docs/PRD.md).

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS · Supabase (Postgres + Auth) · Prisma · Cloudflare Pages/Workers (via OpenNext).

This repo currently implements **Phase 1 — Foundation** only (project setup, database, authentication, design system, user roles, admin foundation). See `docs/PRD.md` §42 for the full phase breakdown.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API.
   - `DATABASE_URL` / `DIRECT_URL` — Project Settings → Database → Connection string (pooled port 6543 / direct port 5432).
3. Enable the **Google** provider under Supabase Auth → Providers (Telegram is not a native Supabase provider — see "Known gaps" below).
4. Install dependencies and generate the Prisma client:
   ```bash
   npm install
   ```
5. Apply the schema to your Supabase database:
   ```bash
   npm run prisma:migrate
   ```
6. Run the trigger + RLS setup in the Supabase SQL editor: paste in [`supabase/sql/001_profiles.sql`](supabase/sql/001_profiles.sql). This auto-creates a `profiles` row for every new `auth.users` row and sets up row-level security. Prisma doesn't manage the `auth` schema or RLS, so this step is separate from `prisma migrate`.
7. Start the dev server:
   ```bash
   npm run dev
   ```

## Project layout

```
prisma/schema.prisma      Phase 1 schema: Profile, Role, AuditLog
prisma.config.ts          Prisma 7 CLI config (connection URLs live here, not in schema.prisma)
supabase/sql/             Raw SQL for auth triggers + RLS (outside Prisma's control)
src/lib/supabase/         Browser/server Supabase clients + session-refresh middleware
src/lib/auth/             Role hierarchy (roles.ts) + requireProfile/requireRole (session.ts)
src/lib/prisma.ts         Prisma client using the `pg` driver adapter (see "Database access" below)
src/components/ui/        Design-system primitives (Button, Input, Card, Badge)
src/components/layout/    Site header/footer
src/app/(auth)/           Login, register, email-confirmation pages + server actions
src/app/admin/            Role-gated admin shell (MODERATOR+) with an overview page
src/proxy.ts              Next 16's `proxy` convention (formerly `middleware`) — refreshes the Supabase session cookie
```

## Database access

Prisma 7 requires a driver adapter (`DATABASE_URL` is no longer read from `schema.prisma`). We use [`@prisma/adapter-pg`](https://www.prisma.io/docs/orm/overview/databases/postgresql#using-the-node-postgres-driver) everywhere so the same code runs locally and (eventually) on Cloudflare Workers. `prisma.config.ts` reads `DIRECT_URL` for CLI operations (`migrate`, `studio`); the app itself reads `DATABASE_URL` (the pooled connection) via `src/lib/prisma.ts`.

## Cloudflare deployment

The app is wired for Cloudflare Pages via [OpenNext](https://opennext.js.org/cloudflare):

```bash
npm run cf:typegen   # generates worker-configuration.d.ts from wrangler.jsonc
npm run cf:build     # builds + adapts the app for Cloudflare
npm run cf:preview   # build + run locally under workerd via wrangler
npm run cf:deploy    # build + deploy
```

**Known gap:** `npm run cf:build` currently fails while bundling the server function, with:

```
✘ [ERROR] Could not resolve "pg-cloudflare"
.open-next/server-functions/default/node_modules/pg/lib/stream.js:41:41
```

Root cause: `pg` lazily `require()`s `pg-cloudflare` only when running inside a Workers runtime, and `pg-cloudflare`'s `package.json` resolves that import differently depending on which `exports` condition is active (`workerd` vs. default). Next's own build-time file tracer (used to produce `.next/standalone`, which OpenNext copies from) doesn't apply the `workerd` condition and copies `dist/empty.js`; OpenNext's own esbuild pass *does* apply it and expects `dist/index.js`, which was never copied. This is an upstream mismatch between Next.js's file tracer and `pg-cloudflare`'s conditional exports, not something fixable from application code.

This does **not** affect local development or a standard Node.js deployment (`next build && next start`) — only the Cloudflare Workers bundle. Before deploying to Cloudflare for real, either:

- track upstream fixes in `@opennextjs/cloudflare` / `pg`, or
- swap the Workers-target database access to an HTTP-based driver (e.g. Prisma Accelerate, or calling Supabase's PostgREST API via `@supabase/supabase-js` instead of Prisma+`pg` for that deployment target).

Once a fix path is chosen, also create the [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) binding Cloudflare recommends for pooling Postgres connections from Workers.

## Known gaps (intentionally out of Phase 1 scope)

- **Telegram login** (PRD §8): Supabase Auth has no native Telegram provider. Implementing it requires a custom Telegram Login Widget + server-side hash verification flow — planned for a later phase.
- **Cloudflare Workers deploy**: see above.
- Course/lesson/exercise/quiz data models, content workflow, search, glossary, etc. are Phase 2+ (`docs/PRD.md` §42).
