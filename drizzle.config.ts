import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL not set. Ensure the database is provisioned.");
}

const certPath = path.join(__dirname, "cert", "supabase-root-ca.pem");

const sslCert = fs.readFileSync(certPath, "utf8");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: {
      ca: sslCert,
      rejectUnauthorized: true,
    },
  },
});
