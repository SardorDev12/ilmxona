# Ilmxona

O'zbek tilida bepul bilim o'rganing. Full product spec: [`docs/PRD.md`](docs/PRD.md).

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS · Supabase (Postgres + Auth) · Cloudflare Workers (via OpenNext).

This repo currently implements **Phase 1 — Foundation** only (project setup, database, authentication, design system, user roles, admin foundation). See `docs/PRD.md` §42 for the full phase breakdown.

## Content

**There is no seed content.** Courses, lessons, glossary terms and learning paths all live in Postgres and are created through the site itself: any signed-in user writes a course or lesson, submits it for review, and a moderator publishes it. A fresh database therefore renders an empty platform — every listing shows an empty state with a "create the first course" call to action, which is the intended starting point.

```bash
npm install
npm run dev
```

When `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent, the app runs in demo mode: a fixed demo profile stands in for a signed-in user so the dashboard and admin panel stay reviewable, the auth forms report that the backend isn't connected, and every content query returns empty instead of throwing. As soon as those variables are set, real Supabase auth and real content take over — no code change needed.

## Authoring flow

| Step | Who | Where |
| --- | --- | --- |
| Write a course (title, modules, objectives) | any signed-in user | `/contributor/courses/new` |
| Write a lesson (blocks, exercise, quiz) | any signed-in user | `/contributor/lessons/new` |
| Submit for review | the author | `/dashboard` |
| Publish or request changes | MODERATOR, ADMIN | `/admin/review` |

Publishing is reachable only through the moderator policies in `006_content.sql` — an author's own `update` policy refuses any status but `DRAFT` or `SUBMITTED`, so the review step cannot be skipped from the client. Publishing someone's first piece of content promotes them from `USER` to `CREATOR`.

## Connecting the backend

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
3. Enable the **Google** provider under Supabase Auth → Providers (Telegram is not a native Supabase provider — see "Known gaps").
4. Apply the schema: open the Supabase SQL editor and run every file in [`supabase/sql/`](supabase/sql) **in filename order** (`001` … `006`). Together they create the `role` and `content_status` enums, the `profiles` / `audit_logs` / content tables, the trigger that auto-creates a profile for every new auth user, and the grants and RLS policies. Grants matter as much as policies: Postgres checks table privileges *before* RLS, so a table with policies but no `grant` returns `permission denied` (42501).

## Data access

The app talks to Postgres through **PostgREST via `@supabase/supabase-js`**, not a direct database connection. That keeps every query on `fetch`, which works unchanged on Node.js and on the Cloudflare Workers runtime — no TCP driver, no connection pooling, no Hyperdrive binding needed.

The tradeoff: **Row Level Security is the real authorization boundary.** Queries run with the signed-in user's own JWT, so an RLS policy gap is a data leak — the `requireRole` checks in `src/lib/auth/session.ts` are for redirects and UI, not security. Any new table needs RLS policies in the same SQL migration that creates it.

SQL files in `supabase/sql/` are the source of truth for schema; apply them in filename order.

## Project layout

```
src/lib/content/          Content types, queries (server-only) and server actions
src/components/content/   Lesson renderer, code playground, quiz, exercise, cards
src/components/studio/    Course/lesson editors, the author's content list, review queue
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

No environment variables are required while the site is in demo mode. Once you connect Supabase, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` as Worker variables (Settings → Variables) — `NEXT_PUBLIC_*` values are inlined at build time, so they must be present for the build, not just at runtime.

## Known gaps (intentionally out of Phase 1 scope)

- **Telegram login** (PRD §8): Supabase Auth has no native Telegram provider. It needs a custom Telegram Login Widget + server-side hash verification flow — planned for a later phase.
- **Learner progress**: completed lessons, streaks and saved lessons have no tables yet, so the dashboard reports what you have authored rather than what you have studied.
- **Editing published content**: the editors create new courses and lessons; changing one after the fact still means going through the database.
- **Learning paths and glossary terms** have tables, queries and pages but no authoring UI — they are created directly in SQL for now.
