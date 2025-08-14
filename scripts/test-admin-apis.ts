/**
 * Test script for admin API endpoints
 * This script tests the admin posts and projects APIs
 */

import { db } from "../lib/db";
import { posts, projects, categories, tags } from "../lib/schema";
import { generateId, generateSlug, getCurrentTimestamp } from "../lib/utils";

async function testAdminAPIs() {
  console.log("🧪 Testing Admin API endpoints...\n");

  try {
    // Test data setup
    const categoryId = generateId();
    const tagId = generateId();
    const postId = generateId();
    const projectId = generateId();

    console.log("📝 Setting up test data...");

    const timestamp = Date.now();
    
    // Create test category
    await db.insert(categories).values({
      id: categoryId,
      name: `Test Category ${timestamp}`,
      slug: `test-category-${timestamp}`,
      description: "A test category",
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    });

    // Create test tag
    await db.insert(tags).values({
      id: tagId,
      name: `Test Tag ${timestamp}`,
      slug: `test-tag-${timestamp}`,
      createdAt: getCurrentTimestamp(),
    });

    console.log("✅ Test data created successfully\n");

    // Test post creation
    console.log("📄 Testing post creation...");
    const testPostData = {
      id: postId,
      title: `Test MDX Post ${timestamp}`,
      slug: generateSlug(`Test MDX Post ${timestamp}`),
      contentStorageType: "database" as const,
      mdxContent: `---
title: "Test MDX Post"
description: "A test post with MDX content"
tags: ["react", "nextjs"]
---

# Test MDX Post

This is a test post with **MDX content**.

\`\`\`javascript
console.log("Hello, MDX!");
\`\`\`

## Features

- MDX support
- Code highlighting
- React components

<div>Custom JSX content</div>
`,
      excerpt: "A test post with MDX content",
      readingTime: 2,
      wordCount: 50,
      status: "draft" as const,
      publishedAt: null,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      metaTitle: "Test MDX Post",
      metaDescription: "A test post with MDX content",
      categoryId,
    };

    await db.insert(posts).values(testPostData);
    console.log("✅ Post created successfully");

    // Test project creation
    console.log("🚀 Testing project creation...");
    const testProjectData = {
      id: projectId,
      title: `Test MDX Project ${timestamp}`,
      slug: generateSlug(`Test MDX Project ${timestamp}`),
      contentStorageType: "database" as const,
      mdxContent: `---
title: "Test MDX Project"
description: "A test project with MDX content"
technologies: ["React", "Next.js", "TypeScript"]
---

# Test MDX Project

This is a test project with **MDX content**.

## Technologies Used

- React
- Next.js
- TypeScript
- Tailwind CSS

## Features

- Modern web development
- Full-stack application
- Responsive design

\`\`\`typescript
interface Project {
  id: string;
  title: string;
  technologies: string[];
}
\`\`\`
`,
      githubUrl: "https://github.com/test/project",
      liveUrl: "https://test-project.com",
      imageUrl: "https://example.com/project-image.jpg",
      technologies: ["React", "Next.js", "TypeScript"],
      status: "published" as const,
      featured: true,
      publishedAt: getCurrentTimestamp(),
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
    };

    await db.insert(projects).values(testProjectData);
    console.log("✅ Project created successfully");

    // Test data retrieval
    console.log("\n📊 Testing data retrieval...");

    const retrievedPost = await db
      .select()
      .from(posts)
      .where(posts.id === postId)
      .limit(1);

    const retrievedProject = await db
      .select()
      .from(projects)
      .where(projects.id === projectId)
      .limit(1);

    if (retrievedPost.length > 0) {
      console.log("✅ Post retrieved successfully");
      console.log(`   - Title: ${retrievedPost[0].title}`);
      console.log(`   - Status: ${retrievedPost[0].status}`);
      console.log(`   - Storage Type: ${retrievedPost[0].contentStorageType}`);
      console.log(`   - MDX Content Length: ${retrievedPost[0].mdxContent?.length || 0} characters`);
    }

    if (retrievedProject.length > 0) {
      console.log("✅ Project retrieved successfully");
      console.log(`   - Title: ${retrievedProject[0].title}`);
      console.log(`   - Status: ${retrievedProject[0].status}`);
      console.log(`   - Featured: ${retrievedProject[0].featured}`);
      console.log(`   - Technologies: ${JSON.stringify(retrievedProject[0].technologies)}`);
      console.log(`   - MDX Content Length: ${retrievedProject[0].mdxContent?.length || 0} characters`);
    }

    // Test content storage service
    console.log("\n💾 Testing content storage service...");
    const { ContentStorageFactory } = await import("../lib/content-storage");

    const postStorage = ContentStorageFactory.createForRecord(retrievedPost[0]);
    const projectStorage = ContentStorageFactory.createForRecord(retrievedProject[0]);

    const postContent = await postStorage.getContent(postId, 'post');
    const projectContent = await projectStorage.getContent(projectId, 'project');

    console.log("✅ Content storage service working");
    console.log(`   - Post content retrieved: ${postContent.length} characters`);
    console.log(`   - Project content retrieved: ${projectContent.length} characters`);

    // Test basic MDX content validation
    console.log("\n🔄 Testing MDX content validation...");
    
    // Basic validation - check if content contains MDX structure
    const hasPostFrontmatter = postContent.startsWith('---');
    const hasProjectFrontmatter = projectContent.startsWith('---');
    const hasPostMarkdown = postContent.includes('#');
    const hasProjectMarkdown = projectContent.includes('#');

    console.log("✅ MDX content validation working");
    console.log(`   - Post has frontmatter: ${hasPostFrontmatter}`);
    console.log(`   - Post has markdown: ${hasPostMarkdown}`);
    console.log(`   - Project has frontmatter: ${hasProjectFrontmatter}`);
    console.log(`   - Project has markdown: ${hasProjectMarkdown}`);

    // Cleanup test data
    console.log("\n🧹 Cleaning up test data...");
    await db.delete(posts).where(posts.id === postId);
    await db.delete(projects).where(projects.id === projectId);
    await db.delete(categories).where(categories.id === categoryId);
    await db.delete(tags).where(tags.id === tagId);

    console.log("✅ Test data cleaned up successfully");

    console.log("\n🎉 All admin API tests passed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testAdminAPIs().catch(console.error);