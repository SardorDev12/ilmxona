import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma. This config is only
// used by the Prisma CLI (generate/migrate/studio) — the app itself never
// reads DATABASE_URL directly, it builds a `pg` Pool driver adapter in
// src/lib/prisma.ts instead (required for the Cloudflare Workers runtime).
//
// DIRECT_URL is Supabase's non-pooled connection (port 5432): migrations
// need a direct connection, not the pgbouncer pooler.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
