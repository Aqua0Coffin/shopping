// Prisma 7+ config — connection URL lives here, not in schema.prisma
// See https://pris.ly/d/config-datasource

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Local dev: Docker Postgres
    // Staging/prod: Supabase connection pooler (Transaction mode, port 6543)
    //   for prisma generate + runtime queries
    url: process.env["DATABASE_URL"]!,

    // Supabase only: Direct connection for migrations (bypasses PgBouncer)
    // Uncomment when deploying to Supabase:
    // directUrl: process.env["DIRECT_URL"],
  },
});
