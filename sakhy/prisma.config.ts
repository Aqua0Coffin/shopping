// Prisma 7+ config — connection URL lives here, not in schema.prisma
// See https://pris.ly/d/config-datasource

// Load .env first (base defaults), then overlay .env.local (Supabase secrets).
// Prisma CLI does NOT auto-load .env.local the way Next.js does, so we do it
// explicitly here. The override:true ensures .env.local wins over .env.
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI (migrate, db pull, etc.) reads datasource.url from this config in Prisma 7.
    // Production: DIRECT_URL = Supabase session-mode pooler (port 5432) — never the pgbouncer port.
    // Local dev: DIRECT_URL is absent; fall back to DATABASE_URL (plain Postgres, no pooler).
    url: (process.env["DIRECT_URL"] || process.env["DATABASE_URL"])!,
  },
});
