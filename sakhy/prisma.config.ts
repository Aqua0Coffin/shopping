// Prisma 7+ config — connection URL lives here, not in schema.prisma
// See https://pris.ly/d/config-datasource

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma CLI (migrate, db pull, etc.) reads datasource.url from this config in Prisma 7.
    // Use the direct connection here; runtime Prisma client continues using DATABASE_URL in lib/prisma.ts.
    url: process.env["DIRECT_URL"]!,
  },
});
