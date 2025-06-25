import { db } from "./db";
import { users, products, stockTransactions, sessions } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function runMigrations() {
  try {
    // Create users table
    await db.execute(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(30) NOT NULL DEFAULT 'stock_in_manager',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create products table
    await db.execute(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      opening_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
      current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create stock_transactions table
    await db.execute(`CREATE TABLE IF NOT EXISTS stock_transactions (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      type VARCHAR(10) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      previous_stock DECIMAL(10,2) NOT NULL,
      new_stock DECIMAL(10,2) NOT NULL,
      remarks TEXT,
      transaction_date TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create sessions table
    await db.execute(`CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR(128) PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP NOT NULL
    )`);

    // Create index for sessions
    await db.execute(`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)`);

    // Insert super admin user if doesn't exist
    const existingUser = await db.select().from(users).where(eq(users.username, "Sudhamrit"));
    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash("Sudhamrit@1234", 10);
      
      await db.insert(users).values({
        username: "Sudhamrit",
        password: hashedPassword,
        email: "admin@inventory.com",
        firstName: "Super",
        lastName: "Admin",
        role: "super_admin"
      });
      console.log("Super admin user created: username=Sudhamrit, password=Sudhamrit@1234");
    }

    // Alter stock_transactions table to add so_number and po_number columns
    await db.execute(`ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS so_number VARCHAR(100)`);
    await db.execute(`ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS po_number VARCHAR(100)`);

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}