import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma. This config is only
// used by the Prisma CLI (generate/migrate/studio) — the app itself never
// reads DATABASE_URL directly, it builds a `pg` Pool driver adapter in
// src/lib/prisma.ts instead (required for the Cloudflare Workers runtime).
//
// DIRECT_URL is Supabase's non-pooled connection (port 5432): migrations
// need a direct connection, not the pgbouncer pooler.
//
// We deliberately don't use the strict `env()` helper here: it throws at
// config-load time if the variable is unset, which breaks `prisma generate`
// (run via postinstall on every `npm install`) even though `generate` never
// touches the database — only `migrate`/`studio` need a real DIRECT_URL.
// A placeholder keeps installs working before the real env vars exist (a
// fresh clone, a CI step that only needs the client).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DIRECT_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
