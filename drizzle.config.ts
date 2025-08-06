import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL  not set. Ensure the database is provisioned.");
}

// Read SSL Certificate
const sslCert = fs.readFileSync(path.resolve(__dirname, './cert/prod-ca-2021 (3).crt')).toString();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ssl: {
      ca: sslCert,                // <-- Use CA Cert Here
      rejectUnauthorized: true,   // <-- SSL Validation Enabled
    },
  },
});

