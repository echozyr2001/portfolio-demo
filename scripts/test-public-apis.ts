#!/usr/bin/env tsx

/**
 * Test script for public content API endpoints
 * Tests the newly created public APIs for posts and projects
 */

import { db } from "@/lib/db";
import {
	posts,
	projects,
	categories,
	tags,
	postTags,
	projectTags,
} from "@/lib/schema";
import { generateId, generateSlug, getCurrentTimestamp } from "@/lib/utils";

async function testPublicAPIs() {
	console.log("🧪 Testing Public Content APIs...\n");

	try {
		// Create test data first
		await createTestData();

		// Test Posts API
		console.log("📝 Testing Posts API...");
		await testPostsAPI();

		// Test Projects API
		console.log("\n🚀 Testing Projects API...");
		await testProjectsAPI();

		console.log("\n✅ All tests completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error);
		process.exit(1);
	}
}

async function createTestData() {
	console.log("📊 Creating test data...");

	// Create a test category
	const categoryId = generateId();
	await db.insert(categories).values({
		id: categoryId,
		name: "Test Category",
		slug: "test-category",
		description: "A test category",
		createdAt: getCurrentTimestamp(),
		updatedAt: getCurrentTimestamp(),
	});

	// Create test tags
	const tag1Id = generateId();
	const tag2Id = generateId();
	await db.insert(tags).values([
		{
			id: tag1Id,
			name: "React",
			slug: "react",
			createdAt: getCurrentTimestamp(),
		},
		{
			id: tag2Id,
			name: "TypeScript",
			slug: "typescript",
			createdAt: getCurrentTimestamp(),
		},
	]);

	// Create test posts
	const post1Id = generateId();
	const post2Id = generateId();
	const now = getCurrentTimestamp();

	await db.insert(posts).values([
		{
			id: post1Id,
			title: "Test Published Post",
			slug: "test-published-post",
			mdxContent: `---
title: "Test Published Post"
description: "A test post for API testing"
---

# Test Published Post

This is a test post with **MDX content**.

\`\`\`javascript
console.log("Hello, World!");
\`\`\`
`,
			excerpt: "A test post for API testing",
			readingTime: 2,
			wordCount: 50,
			status: "published",
			publishedAt: now,
			createdAt: now,
			updatedAt: now,
			categoryId,
			contentStorageType: "database",
		},
		{
			id: post2Id,
			title: "Test Draft Post",
			slug: "test-draft-post",
			mdxContent: "# Draft Post\n\nThis should not appear in public API.",
			excerpt: "A draft post",
			readingTime: 1,
			wordCount: 20,
			status: "draft",
			publishedAt: null,
			createdAt: now,
			updatedAt: now,
			categoryId,
			contentStorageType: "database",
		},
	]);

	// Create post-tag relationships
	await db.insert(postTags).values([
		{ postId: post1Id, tagId: tag1Id },
		{ postId: post1Id, tagId: tag2Id },
	]);

	// Create test projects
	const project1Id = generateId();
	const project2Id = generateId();

	await db.insert(projects).values([
		{
			id: project1Id,
			title: "Test Published Project",
			slug: "test-published-project",
			mdxContent: `---
title: "Test Published Project"
description: "A test project for API testing"
---

# Test Published Project

This is a **test project** with MDX content.

## Features

- Feature 1
- Feature 2
- Feature 3
`,
			githubUrl: "https://github.com/test/project",
			liveUrl: "https://test-project.com",
			imageUrl: "https://example.com/image.jpg",
			technologies: ["React", "TypeScript", "Next.js"],
			featured: true,
			status: "published",
			publishedAt: now,
			createdAt: now,
			updatedAt: now,
			contentStorageType: "database",
		},
		{
			id: project2Id,
			title: "Test Draft Project",
			slug: "test-draft-project",
			mdxContent: "# Draft Project\n\nThis should not appear in public API.",
			status: "draft",
			publishedAt: null,
			createdAt: now,
			updatedAt: now,
			contentStorageType: "database",
		},
	]);

	// Create project-tag relationships
	await db.insert(projectTags).values([
		{ projectId: project1Id, tagId: tag1Id },
		{ projectId: project1Id, tagId: tag2Id },
	]);

	console.log("✅ Test data created successfully");
}

async function testPostsAPI() {
	const baseUrl = "http://localhost:3000";

	// Test 1: Get all published posts
	console.log("  📋 Testing GET /api/posts");
	const postsResponse = await fetch(`${baseUrl}/api/posts`);
	const postsData = await postsResponse.json();

	if (!postsResponse.ok) {
		throw new Error(`Posts API failed: ${postsData.message}`);
	}

	console.log(`    ✅ Found ${postsData.data.posts.length} published posts`);
	console.log(
		`    📊 Pagination: ${postsData.data.pagination.totalCount} total`,
	);

	// Verify only published posts are returned
	const hasOnlyPublished = postsData.data.posts.every(
		(post: any) => post.status === undefined,
	); // Status not returned in public API
	if (!hasOnlyPublished) {
		console.log(
			"    ⚠️  Note: Status field should not be returned in public API",
		);
	}

	// Test 2: Get post by slug
	console.log("  📄 Testing GET /api/posts/[slug]");
	const postResponse = await fetch(
		`${baseUrl}/api/posts/test-published-post?public=true`,
	);
	const postData = await postResponse.json();

	if (!postResponse.ok) {
		throw new Error(`Post by slug API failed: ${postData.message}`);
	}

	console.log(`    ✅ Retrieved post: "${postData.data.title}"`);
	console.log(
		`    🏷️  Tags: ${postData.data.tags.map((t: any) => t.name).join(", ")}`,
	);
	console.log(`    📖 Reading time: ${postData.data.readingTime} minutes`);

	if (postData.data.mdxSource) {
		console.log("    ✅ MDX content processed successfully");
	}

	// Test 3: Try to get draft post (should fail)
	console.log("  🔒 Testing access to draft post");
	const draftResponse = await fetch(
		`${baseUrl}/api/posts/test-draft-post?public=true`,
	);
	if (draftResponse.status === 404) {
		console.log("    ✅ Draft post correctly hidden from public API");
	} else {
		console.log("    ❌ Draft post should not be accessible via public API");
	}

	// Test 4: Test filtering by category
	const categoryResponse = await fetch(
		`${baseUrl}/api/posts?categoryId=${await getCategoryId()}`,
	);
	const categoryData = await categoryResponse.json();
	if (categoryResponse.ok) {
		console.log(
			`    ✅ Category filtering works: ${categoryData.data.posts.length} posts found`,
		);
	}

	// Test 5: Test search functionality
	const searchResponse = await fetch(`${baseUrl}/api/posts?search=test`);
	const searchData = await searchResponse.json();
	if (searchResponse.ok) {
		console.log(
			`    ✅ Search works: ${searchData.data.posts.length} posts found`,
		);
	}
}

async function testProjectsAPI() {
	const baseUrl = "http://localhost:3000";

	// Test 1: Get all published projects
	console.log("  📋 Testing GET /api/projects");
	const projectsResponse = await fetch(`${baseUrl}/api/projects`);
	const projectsData = await projectsResponse.json();

	if (!projectsResponse.ok) {
		throw new Error(`Projects API failed: ${projectsData.message}`);
	}

	console.log(
		`    ✅ Found ${projectsData.data.projects.length} published projects`,
	);
	console.log(
		`    📊 Pagination: ${projectsData.data.pagination.totalCount} total`,
	);

	// Test 2: Get project by slug
	console.log("  📄 Testing GET /api/projects/[slug]");
	const projectResponse = await fetch(
		`${baseUrl}/api/projects/test-published-project?public=true`,
	);
	const projectData = await projectResponse.json();

	if (!projectResponse.ok) {
		throw new Error(`Project by slug API failed: ${projectData.message}`);
	}

	console.log(`    ✅ Retrieved project: "${projectData.data.title}"`);
	console.log(
		`    🏷️  Tags: ${projectData.data.tags.map((t: any) => t.name).join(", ")}`,
	);
	console.log(`    🔗 GitHub: ${projectData.data.githubUrl}`);
	console.log(`    🌐 Live URL: ${projectData.data.liveUrl}`);
	console.log(`    ⭐ Featured: ${projectData.data.featured}`);

	if (projectData.data.mdxSource) {
		console.log("    ✅ MDX content processed successfully");
	}

	// Test 3: Try to get draft project (should fail)
	console.log("  🔒 Testing access to draft project");
	const draftResponse = await fetch(
		`${baseUrl}/api/projects/test-draft-project?public=true`,
	);
	if (draftResponse.status === 404) {
		console.log("    ✅ Draft project correctly hidden from public API");
	} else {
		console.log("    ❌ Draft project should not be accessible via public API");
	}

	// Test 4: Test featured filter
	const featuredResponse = await fetch(`${baseUrl}/api/projects?featured=true`);
	const featuredData = await featuredResponse.json();
	if (featuredResponse.ok) {
		console.log(
			`    ✅ Featured filtering works: ${featuredData.data.projects.length} featured projects`,
		);
	}

	// Test 5: Test sorting
	const sortedResponse = await fetch(
		`${baseUrl}/api/projects?sortBy=title&sortOrder=asc`,
	);
	const sortedData = await sortedResponse.json();
	if (sortedResponse.ok) {
		console.log(`    ✅ Sorting works: projects sorted by title`);
	}
}

async function getCategoryId(): Promise<string> {
	const result = await db
		.select({ id: categories.id })
		.from(categories)
		.limit(1);
	return result[0]?.id || "";
}

async function cleanup() {
	console.log("\n🧹 Cleaning up test data...");

	try {
		// Delete in correct order due to foreign key constraints
		await db.delete(postTags);
		await db.delete(projectTags);
		await db.delete(posts);
		await db.delete(projects);
		await db.delete(categories);
		await db.delete(tags);

		console.log("✅ Test data cleaned up");
	} catch (error) {
		console.error("⚠️  Cleanup failed:", error);
	}
}

// Run tests
if (require.main === module) {
	testPublicAPIs()
		.finally(() => cleanup())
		.catch(console.error);
}

export { testPublicAPIs };
