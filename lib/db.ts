import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Create SQLite database connection
const sqlite = new Database('sqlite.db');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create Drizzle database instance with schema
export const db = drizzle(sqlite, { schema });

// Export the raw sqlite instance for direct queries if needed
export { sqlite };

// Database utility functions
export const closeDb = () => {
  sqlite.close();
};

// Health check function
export const checkDbConnection = () => {
  try {
    const result = sqlite.prepare('SELECT 1').get();
    return !!result;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};