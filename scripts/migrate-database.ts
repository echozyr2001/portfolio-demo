#!/usr/bin/env tsx

/**
 * Database Migration Script for MDX Content Management System
 * 
 * This script applies the database schema changes required for MDX content management:
 * - Extends posts table with MDX content storage fields
 * - Creates projects table for project showcase
 * - Extends media table with Base64 and S3 storage support
 * - Creates project-tags junction table
 * 
 * Usage:
 *   npm run migrate
 *   or
 *   npx tsx scripts/migrate-database.ts
 */

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';

async function runMigration() {
  console.log('🚀 Starting database migration for MDX Content Management System...');
  
  try {
    // Initialize database connection
    const sqlite = new Database('./sqlite.db');
    const db = drizzle(sqlite);
    
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Database migration completed successfully!');
    console.log('');
    console.log('Schema changes applied:');
    console.log('  📝 Extended posts table with MDX content storage');
    console.log('  🚀 Created projects table for project showcase');
    console.log('  🖼️  Extended media table with Base64 and S3 storage');
    console.log('  🏷️  Created project-tags junction table');
    console.log('');
    console.log('Your database is now ready for MDX content management!');
    
    sqlite.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

export { runMigration };