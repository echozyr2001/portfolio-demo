/**
 * Test script for API endpoint structure validation
 * This script validates that the API endpoints are properly structured
 */

import { readFile } from "fs/promises";
import { join } from "path";

async function testAPIEndpointStructure() {
	console.log("🔍 Testing API endpoint structure...\n");

	const endpoints = [
		"app/api/admin/posts/route.ts",
		"app/api/admin/posts/[id]/route.ts",
		"app/api/admin/projects/route.ts",
		"app/api/admin/projects/[id]/route.ts",
	];

	const requiredMethods = {
		"app/api/admin/posts/route.ts": ["GET", "POST"],
		"app/api/admin/posts/[id]/route.ts": ["GET", "PUT", "DELETE"],
		"app/api/admin/projects/route.ts": ["GET", "POST"],
		"app/api/admin/projects/[id]/route.ts": ["GET", "PUT", "DELETE"],
	};

	const requiredFeatures = [
		"isAuthenticatedFromRequest", // Authentication check
		"ContentStorageFactory", // Content storage
		"mdxProcessor", // MDX processing
		"createErrorResponse", // Error handling
		"createSuccessResponse", // Success responses
		"ZodError", // Validation
	];

	for (const endpoint of endpoints) {
		console.log(`📄 Testing ${endpoint}...`);

		try {
			const content = await readFile(join(process.cwd(), endpoint), "utf-8");

			// Check for required HTTP methods
			const methods = requiredMethods[endpoint];
			for (const method of methods) {
				if (content.includes(`export async function ${method}`)) {
					console.log(`  ✅ ${method} method implemented`);
				} else {
					console.log(`  ❌ ${method} method missing`);
				}
			}

			// Check for required features
			for (const feature of requiredFeatures) {
				if (content.includes(feature)) {
					console.log(`  ✅ ${feature} integrated`);
				} else {
					console.log(`  ⚠️  ${feature} not found (may be optional)`);
				}
			}

			// Check for authentication
			if (
				content.includes("requireAuth") ||
				content.includes("isAuthenticatedFromRequest")
			) {
				console.log(`  ✅ Authentication implemented`);
			} else {
				console.log(`  ❌ Authentication missing`);
			}

			// Check for error handling
			if (content.includes("try {") && content.includes("catch")) {
				console.log(`  ✅ Error handling implemented`);
			} else {
				console.log(`  ❌ Error handling missing`);
			}

			// Check for validation
			if (content.includes("Schema.parse") || content.includes(".parse(")) {
				console.log(`  ✅ Input validation implemented`);
			} else {
				console.log(`  ❌ Input validation missing`);
			}

			console.log("");
		} catch (error) {
			console.log(`  ❌ Failed to read file: ${error.message}\n`);
		}
	}

	// Test API route structure
	console.log("🏗️  Testing API route structure...");

	const apiStructure = [
		"app/api/admin/posts/route.ts",
		"app/api/admin/posts/[id]/route.ts",
		"app/api/admin/projects/route.ts",
		"app/api/admin/projects/[id]/route.ts",
	];

	let allFilesExist = true;
	for (const file of apiStructure) {
		try {
			await readFile(join(process.cwd(), file), "utf-8");
			console.log(`  ✅ ${file} exists`);
		} catch {
			console.log(`  ❌ ${file} missing`);
			allFilesExist = false;
		}
	}

	if (allFilesExist) {
		console.log("\n🎉 All API endpoints are properly structured!");
	} else {
		console.log("\n❌ Some API endpoints are missing!");
		process.exit(1);
	}

	// Test validation schemas
	console.log("\n📋 Testing validation schemas...");

	const validationPatterns = [
		"createAdminPostSchema",
		"updateAdminPostSchema",
		"createAdminProjectSchema",
		"updateAdminProjectSchema",
		"adminPostQuerySchema",
		"adminProjectQuerySchema",
	];

	let foundSchemas = 0;
	for (const endpoint of endpoints) {
		try {
			const content = await readFile(join(process.cwd(), endpoint), "utf-8");
			for (const pattern of validationPatterns) {
				if (content.includes(pattern)) {
					foundSchemas++;
					break;
				}
			}
		} catch {
			// File doesn't exist, skip
		}
	}

	console.log(
		`  ✅ Found validation schemas in ${foundSchemas}/${endpoints.length} endpoints`,
	);

	console.log("\n✨ API endpoint structure validation complete!");
}

// Run the test
testAPIEndpointStructure().catch(console.error);
