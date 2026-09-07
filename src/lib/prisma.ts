import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma 7 requires a driver adapter (no more schema-level `url`). We use
// the `pg` adapter everywhere — it runs on Node.js locally and on Cloudflare
// Workers via `nodejs_compat` + Hyperdrive in production (see README).
// DATABASE_URL is Supabase's pooled (pgbouncer) connection string.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Avoid exhausting the connection pool by reusing a single PrismaClient
// across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
