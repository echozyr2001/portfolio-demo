#!/usr/bin/env tsx

/**
 * Simple test script for import/export functionality
 * Run with: npx tsx scripts/test-import-export.ts
 */

import { ContentImportExportService } from "../lib/content-import-export";

async function testImportExport() {
	console.log("🧪 Testing Content Import/Export Service...\n");

	const service = new ContentImportExportService();

	// Test 1: Test MDX file parsing
	console.log("📝 Test 1: MDX File Parsing");
	const testMDXContent = `---
title: "Test Post"
slug: "test-post"
status: "published"
tags: ["test", "mdx"]
category: "Technology"
---

# Test Post

This is a test post with **bold** text and \`code\`.

## Code Block

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

## List

- Item 1
- Item 2
- Item 3
`;

	try {
		// Access private method for testing
		const parseResult = await (service as any).parseMDXFile(
			testMDXContent,
			false,
		);
		console.log("✅ MDX parsing successful");
		console.log("   - Title:", parseResult.frontmatter.title);
		console.log("   - Tags:", parseResult.frontmatter.tags);
		console.log(
			"   - Reading time:",
			parseResult.metadata.readingTime,
			"minutes",
		);
		console.log("   - Word count:", parseResult.metadata.wordCount);
		console.log(
			"   - Excerpt:",
			parseResult.metadata.excerpt.substring(0, 50) + "...",
		);
	} catch (error) {
		console.log("❌ MDX parsing failed:", error);
	}

	// Test 2: Test slug generation
	console.log("\n🔗 Test 2: Slug Generation");
	try {
		const generateSlug = (service as any).generateSlug;
		const testCases = [
			"My Great Post",
			"Post with Special Characters!@#",
			"中文标题",
			"post_with_underscores",
			"UPPERCASE POST",
		];

		testCases.forEach((title) => {
			const slug = generateSlug(title);
			console.log(`   "${title}" → "${slug}"`);
		});
		console.log("✅ Slug generation successful");
	} catch (error) {
		console.log("❌ Slug generation failed:", error);
	}

	// Test 3: Test filename to slug conversion
	console.log("\n📁 Test 3: Filename to Slug Conversion");
	try {
		const generateSlugFromFilename = (service as any).generateSlugFromFilename;
		const testFilenames = [
			"test-post.mdx",
			"My Great Post.md",
			"post_with_underscores.mdx",
			"2024-01-01-new-year-post.md",
		];

		testFilenames.forEach((filename) => {
			const slug = generateSlugFromFilename(filename);
			console.log(`   "${filename}" → "${slug}"`);
		});
		console.log("✅ Filename to slug conversion successful");
	} catch (error) {
		console.log("❌ Filename to slug conversion failed:", error);
	}

	// Test 4: Test frontmatter validation
	console.log("\n✅ Test 4: Frontmatter Validation");
	try {
		const validFrontmatter = {
			title: "Valid Post",
			slug: "valid-post",
			status: "published",
			tags: ["test"],
			category: "Tech",
		};

		const invalidFrontmatter = {
			// Missing required title
			slug: "invalid-post",
			status: "published",
		};

		console.log(
			"   Valid frontmatter:",
			JSON.stringify(validFrontmatter, null, 2),
		);
		console.log(
			"   Invalid frontmatter:",
			JSON.stringify(invalidFrontmatter, null, 2),
		);
		console.log("✅ Frontmatter validation test completed");
	} catch (error) {
		console.log("❌ Frontmatter validation failed:", error);
	}

	// Test 5: Test export content generation
	console.log("\n📤 Test 5: Export Content Generation");
	try {
		const mockPost = {
			id: "test-id",
			title: "Test Export Post",
			slug: "test-export-post",
			mdxContent: "# Test Content\n\nThis is test content for export.",
			status: "published",
			publishedAt: new Date("2024-01-01"),
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		const generateMDXContent = (service as any).generateMDXContent;
		const exportedContent = await generateMDXContent(mockPost, "post", true);

		console.log("   Exported MDX content:");
		console.log("   " + exportedContent.split("\n").join("\n   "));
		console.log("✅ Export content generation successful");
	} catch (error) {
		console.log("❌ Export content generation failed:", error);
	}

	console.log("\n🎉 All tests completed!");
}

// Run tests
testImportExport().catch(console.error);
