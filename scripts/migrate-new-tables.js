#!/usr/bin/env node

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Auto-migration script for new database modules
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

console.log("🔗 Connecting to database for auto-migration...");

// Configure SSL for Supabase
const isSupabase = DATABASE_URL.includes('supabase.co');
const sql = postgres(DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: isSupabase ? { 
    rejectUnauthorized: false,
  } : 'require',
  connect_timeout: 30,
  idle_timeout: 30,
});

async function autoMigrate() {
  try {
    console.log("📝 Running auto-migration for new tables...");
    
    // Add new tables here as you create new modules
    // Example: Attendance module
    await sql`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out TIMESTAMP,
        date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Example: Suppliers module
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Example: Purchase orders module
    await sql`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id),
        order_number VARCHAR(100) UNIQUE NOT NULL,
        total_amount DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        ordered_by INTEGER REFERENCES users(id),
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expected_delivery TIMESTAMP,
        notes TEXT
      )
    `;
    
    console.log("✅ Auto-migration completed successfully!");
    console.log("📋 New tables available:");
    console.log("   - attendance (for attendance tracking)");
    console.log("   - suppliers (for supplier management)");
    console.log("   - purchase_orders (for purchase order management)");
    
  } catch (error) {
    console.error("❌ Auto-migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

autoMigrate();