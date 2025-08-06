import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_POOL_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or DATABASE_URL_MIGRATION not set. Ensure the database is provisioned.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
