#!/usr/bin/env tsx

/**
 * Schema Verification Script
 * 
 * This script verifies that the database schema has been correctly updated
 * with all the required fields for MDX content management.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { posts, projects, media, projectTags } from '../lib/schema';

async function verifySchema() {
  console.log('🔍 Verifying database schema...');
  
  try {
    const sqlite = new Database('./sqlite.db');
    const db = drizzle(sqlite);
    
    // Test posts table with new MDX fields
    console.log('✅ Checking posts table...');
    const postsInfo = sqlite.prepare("PRAGMA table_info(posts)").all();
    const postsColumns = postsInfo.map((col: any) => col.name);
    
    const requiredPostsColumns = [
      'content_storage_type', 'mdx_content', 's3_bucket', 's3_key', 's3_url',
      'reading_time', 'word_count'
    ];
    
    for (const column of requiredPostsColumns) {
      if (postsColumns.includes(column)) {
        console.log(`  ✓ ${column} field exists`);
      } else {
        throw new Error(`Missing column: ${column} in posts table`);
      }
    }
    
    // Test projects table
    console.log('✅ Checking projects table...');
    const projectsInfo = sqlite.prepare("PRAGMA table_info(projects)").all();
    if (projectsInfo.length === 0) {
      throw new Error('Projects table does not exist');
    }
    console.log(`  ✓ Projects table exists with ${projectsInfo.length} columns`);
    
    // Test project_tags table
    console.log('✅ Checking project_tags table...');
    const projectTagsInfo = sqlite.prepare("PRAGMA table_info(project_tags)").all();
    if (projectTagsInfo.length === 0) {
      throw new Error('Project_tags table does not exist');
    }
    console.log(`  ✓ Project_tags table exists with ${projectTagsInfo.length} columns`);
    
    // Test media table with new fields
    console.log('✅ Checking media table...');
    const mediaInfo = sqlite.prepare("PRAGMA table_info(media)").all();
    const mediaColumns = mediaInfo.map((col: any) => col.name);
    
    const requiredMediaColumns = [
      'storage_type', 'base64_data', 'thumbnail_base64', 's3_bucket', 's3_key', 's3_url',
      'width', 'height', 'blurhash', 'compression_ratio', 'optimized_size'
    ];
    
    for (const column of requiredMediaColumns) {
      if (mediaColumns.includes(column)) {
        console.log(`  ✓ ${column} field exists`);
      } else {
        throw new Error(`Missing column: ${column} in media table`);
      }
    }
    
    console.log('');
    console.log('🎉 Schema verification completed successfully!');
    console.log('All required tables and columns are present.');
    
    sqlite.close();
  } catch (error) {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifySchema();
}

export { verifySchema };