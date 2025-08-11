#!/usr/bin/env node

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// SSL Connection verification script
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

console.log("🔍 Verifying SSL secure database connection...");

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
  debug: false, // Enable for detailed logs
});

async function verifyConnection() {
  try {
    console.log("📡 Testing database connection...");
    
    // Test basic connection
    const result = await sql`SELECT version(), current_database(), current_user, inet_server_addr(), inet_server_port()`;
    console.log("✅ Connection successful!");
    
    // Display connection info
    const info = result[0];
    console.log("\n📊 Connection Details:");
    console.log(`   Database: ${info.current_database}`);
    console.log(`   User: ${info.current_user}`);
    console.log(`   Server: ${info.inet_server_addr}:${info.inet_server_port}`);
    console.log(`   PostgreSQL: ${info.version.split(',')[0]}`);
    
    // Test SSL status
    const sslResult = await sql`SELECT ssl_is_used() as ssl_enabled`;
    const sslEnabled = sslResult[0]?.ssl_enabled;
    console.log(`   SSL Enabled: ${sslEnabled ? '✅ YES (Secure)' : '❌ NO'}`);
    
    // Test table access
    console.log("\n📋 Testing table access...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Test session table specifically
    try {
      const sessionCount = await sql`SELECT COUNT(*) as count FROM sessions`;
      console.log(`   Sessions table: ✅ (${sessionCount[0].count} sessions)`);
    } catch (error) {
      console.log(`   Sessions table: ❌ (${error.message})`);
    }
    
    console.log("\n🎉 Database connection verification complete!");
    
  } catch (error) {
    console.error("❌ Connection verification failed:");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'Unknown'}`);
    
    if (error.message.includes('no pg_hba.conf entry')) {
      console.error("\n💡 SSL Configuration Issue:");
      console.error("   - Check DATABASE_URL includes SSL parameters");
      console.error("   - Ensure NODE_TLS_REJECT_UNAUTHORIZED=0 is set");
      console.error("   - Verify PGSSLMODE=require is configured");
    }
    
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifyConnection();