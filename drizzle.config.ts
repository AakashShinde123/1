import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

// Use DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL not set. Ensure the database is provisioned.");
}

// Path to your Supabase root certificate
const sslCertPath = path.resolve(__dirname, "./cert/supabase-root-ca.pem");

// Read the certificate file as a string (PEM format)
const sslCert = fs.readFileSync(sslCertPath, "utf-8");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: {
      ca: sslCert,
      rejectUnauthorized: true, // 🔒 Enforce valid SSL
    },
  },
});
