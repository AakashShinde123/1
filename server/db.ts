import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// PostgreSQL database connection
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log("Database connection configured:", connectionString ? "✓" : "✗");

// Configure postgres connection with minimal settings
const sql = postgres(connectionString, {
  max: 1,
  prepare: false,
});

export const db = drizzle(sql, { schema });

// Test database connection
export async function testDatabaseConnection() {
  try {
    await sql`SELECT 1`;
    console.log("Database connection successful ✓");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
