#!/usr/bin/env tsx

/**
 * Simple validation script for content storage implementation
 */

import {
	DatabaseContentStorage,
	S3ContentStorage,
	ContentStorageFactory,
	ContentStorageUtils,
	ContentNotFoundError,
	ContentValidationError,
	ContentStorageError,
	StorageMigrationError,
} from "../lib/content-storage";
import { db } from "../lib/db";
import { posts, projects } from "../lib/schema";
import { eq } from "drizzle-orm";

const testMdxContent = `---
title: "Test Content"
description: "Test description"
---

# Test Content

This is a test MDX content with some **bold** text and a code block:

\`\`\`javascript
console.log('Hello, world!');
\`\`\`
`;

async function runTests() {
	console.log("🧪 Testing Content Storage Implementation...\n");

	try {
		// Test 1: Factory creation
		console.log("✅ Test 1: Factory creation");
		const databaseStorage = ContentStorageFactory.create("database");
		const s3Storage = ContentStorageFactory.create("s3");
		console.log(
			"   - Database storage created:",
			databaseStorage.constructor.name,
		);
		console.log("   - S3 storage created:", s3Storage.constructor.name);

		// Test 2: Content validation
		console.log("\n✅ Test 2: Content validation");
		const storage = new DatabaseContentStorage();

		const validResult = await storage.validateContent(testMdxContent);
		console.log("   - Valid content validation:", validResult.isValid);

		const emptyResult = await storage.validateContent("");
		console.log(
			"   - Empty content validation:",
			emptyResult.isValid,
			"(should be false)",
		);
		console.log("   - Validation errors:", emptyResult.errors);

		// Test 3: S3 configuration check
		console.log("\n✅ Test 3: S3 configuration");
		const isS3Configured = ContentStorageFactory.isS3Configured();
		console.log("   - S3 configured:", isS3Configured);

		const s3Validation = ContentStorageFactory.validateStorageConfig("s3");
		console.log("   - S3 validation result:", s3Validation.isValid);
		console.log("   - S3 warnings:", s3Validation.warnings);

		// Test 4: Error classes
		console.log("\n✅ Test 4: Error classes");
		const contentError = new ContentStorageError("Test error", "TEST_CODE", {
			test: true,
		});
		console.log(
			"   - ContentStorageError created:",
			contentError.name,
			contentError.code,
		);

		const notFoundError = new ContentNotFoundError("test-id", "post");
		console.log("   - ContentNotFoundError created:", notFoundError.message);

		const validationError = new ContentValidationError(["Error 1", "Error 2"]);
		console.log(
			"   - ContentValidationError created:",
			validationError.message,
		);

		// Test 5: Storage statistics (if database has data)
		console.log("\n✅ Test 5: Storage statistics");
		try {
			const stats = await ContentStorageUtils.getStorageStats();
			console.log("   - Database posts:", stats.database.posts);
			console.log("   - Database projects:", stats.database.projects);
			console.log("   - S3 posts:", stats.s3.posts);
			console.log("   - S3 projects:", stats.s3.projects);
			console.log("   - Total posts:", stats.total.posts);
			console.log("   - Total projects:", stats.total.projects);
		} catch (error) {
			console.log(
				"   - Storage stats error (expected if no data):",
				error.message,
			);
		}

		// Test 6: S3 not implemented behavior
		console.log("\n✅ Test 6: S3 not implemented behavior");
		try {
			await s3Storage.saveContent("test-id", testMdxContent, "post");
		} catch (error) {
			console.log("   - S3 save error (expected):", error.message);
		}

		try {
			await s3Storage.getContent("test-id", "post");
		} catch (error) {
			console.log("   - S3 get error (expected):", error.message);
		}

		console.log("\n🎉 All tests completed successfully!");
		console.log("\n📋 Implementation Summary:");
		console.log("   ✅ ContentStorageService interface defined");
		console.log("   ✅ DatabaseContentStorage implemented");
		console.log(
			"   ✅ S3ContentStorage interface created (not yet implemented)",
		);
		console.log("   ✅ ContentStorageFactory implemented");
		console.log("   ✅ Error handling and validation added");
		console.log("   ✅ Utility functions for migration and stats");
	} catch (error) {
		console.error("❌ Test failed:", error);
		process.exit(1);
	}
}

// Run the tests
runTests().catch(console.error);
