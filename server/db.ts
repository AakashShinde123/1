import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import 'dotenv/config';

// PostgreSQL database connection
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure postgres connection with better error handling
const sql = postgres(connectionString, {
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Seconds before closing idle connections
  connect_timeout: 10, // Connection timeout in seconds
  onnotice: () => {}, // Suppress notices in production
});

export const db = drizzle(sql, { schema });