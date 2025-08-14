/**
 * Example usage of the Content Storage Service
 * This file demonstrates how to use the unified content storage system
 */

import { 
  ContentStorageFactory, 
  ContentStorageUtils,
  type ContentStorageService 
} from './content-storage';

/**
 * Example: Basic content operations
 */
export async function basicContentOperations() {
  // Create a storage service (defaults to database)
  const storage = ContentStorageFactory.create();
  
  const postId = 'example-post-1';
  const mdxContent = `---
title: "My First Post"
description: "This is my first blog post"
tags: ["javascript", "react"]
---

# My First Post

Welcome to my blog! This is written in **MDX** format.

\`\`\`javascript
console.log('Hello, world!');
\`\`\`
`;

  try {
    // Save content
    await storage.saveContent(postId, mdxContent, 'post');
    console.log('✅ Content saved successfully');
    
    // Retrieve content
    const retrievedContent = await storage.getContent(postId, 'post');
    console.log('✅ Content retrieved:', retrievedContent.substring(0, 100) + '...');
    
    // Validate content
    const validation = await storage.validateContent(mdxContent);
    console.log('✅ Content validation:', validation.isValid);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example: Using factory for different storage types
 */
export async function storageFactoryExample() {
  // Create database storage
  const dbStorage = ContentStorageFactory.create('database');
  console.log('Database storage created:', dbStorage.constructor.name);
  
  // Create S3 storage (not yet implemented)
  const s3Storage = ContentStorageFactory.create('s3');
  console.log('S3 storage created:', s3Storage.constructor.name);
  
  // Create storage based on existing record
  const recordBasedStorage = ContentStorageFactory.createForRecord({
    contentStorageType: 'database'
  });
  console.log('Record-based storage:', recordBasedStorage.constructor.name);
  
  // Check configuration
  const isS3Configured = ContentStorageFactory.isS3Configured();
  console.log('S3 configured:', isS3Configured);
  
  const defaultType = ContentStorageFactory.getDefaultStorageType();
  console.log('Default storage type:', defaultType);
}

/**
 * Example: Content validation
 */
export async function contentValidationExample() {
  const storage = ContentStorageFactory.create();
  
  // Valid content
  const validContent = `---
title: "Valid Post"
---

# Valid Content

This is valid MDX content.
`;
  
  const validResult = await storage.validateContent(validContent);
  console.log('Valid content result:', validResult);
  
  // Invalid content (empty)
  const invalidResult = await storage.validateContent('');
  console.log('Invalid content result:', invalidResult);
  
  // Content with warnings
  const warningContent = `---
title: test

# Content with unclosed code block

\`\`\`javascript
console.log('unclosed');
`;
  
  const warningResult = await storage.validateContent(warningContent);
  console.log('Content with warnings:', warningResult);
}

/**
 * Example: Storage statistics
 */
export async function storageStatsExample() {
  try {
    const stats = await ContentStorageUtils.getStorageStats();
    console.log('Storage Statistics:');
    console.log('- Database posts:', stats.database.posts);
    console.log('- Database projects:', stats.database.projects);
    console.log('- S3 posts:', stats.s3.posts);
    console.log('- S3 projects:', stats.s3.projects);
    console.log('- Total posts:', stats.total.posts);
    console.log('- Total projects:', stats.total.projects);
  } catch (error) {
    console.error('Error getting stats:', error.message);
  }
}

/**
 * Example: Error handling
 */
export async function errorHandlingExample() {
  const storage = ContentStorageFactory.create();
  
  try {
    // Try to get non-existent content
    await storage.getContent('non-existent-id', 'post');
  } catch (error) {
    console.log('Expected error for non-existent content:', error.message);
    console.log('Error code:', error.code);
  }
  
  try {
    // Try to save invalid content
    await storage.saveContent('test-id', '', 'post');
  } catch (error) {
    console.log('Expected validation error:', error.message);
    console.log('Error code:', error.code);
  }
}

/**
 * Example: Future S3 migration
 */
export async function migrationExample() {
  // This would be used when S3 is implemented
  try {
    const items = [
      { id: 'post-1', type: 'post' as const },
      { id: 'project-1', type: 'project' as const },
    ];
    
    // Batch migrate to S3 (would work when S3 is implemented)
    const results = await ContentStorageUtils.batchMigrate(items, 'database', 5);
    console.log('Migration results:', results);
  } catch (error) {
    console.log('Migration not available yet:', error.message);
  }
}

// Export all examples for easy testing
export const examples = {
  basicContentOperations,
  storageFactoryExample,
  contentValidationExample,
  storageStatsExample,
  errorHandlingExample,
  migrationExample,
};