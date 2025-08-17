#!/usr/bin/env npx tsx

/**
 * Test script for Media API endpoints
 * This script tests the media upload, retrieval, and deletion APIs
 */

import { readFileSync } from "fs";
import { join } from "path";

// Test configuration
const BASE_URL = "http://localhost:3000";
const TEST_IMAGE_PATH = join(process.cwd(), "public", "placeholder.svg");

interface TestResult {
	name: string;
	success: boolean;
	error?: string;
	data?: any;
}

class MediaAPITester {
	private results: TestResult[] = [];

	async runAllTests(): Promise<void> {
		console.log("🧪 Starting Media API Tests...\n");

		try {
			// Test 1: Upload a file
			const uploadResult = await this.testFileUpload();
			if (!uploadResult.success) {
				console.log("❌ Upload test failed, skipping dependent tests");
				return;
			}

			const mediaId = uploadResult.data?.id;
			if (!mediaId) {
				console.log("❌ No media ID returned from upload");
				return;
			}

			// Test 2: Get media info
			await this.testGetMediaInfo(mediaId);

			// Test 3: Get media file
			await this.testGetMediaFile(mediaId);

			// Test 4: Update media alt text
			await this.testUpdateMediaAlt(mediaId);

			// Test 5: Delete media
			await this.testDeleteMedia(mediaId);

			// Test 6: Verify deletion
			await this.testGetDeletedMedia(mediaId);
		} catch (error) {
			console.error("❌ Test suite failed:", error);
		}

		this.printResults();
	}

	private async testFileUpload(): Promise<TestResult> {
		const testName = "File Upload (POST /api/admin/media/upload)";
		console.log(`🔄 Testing: ${testName}`);

		try {
			// Read test image file
			const fileBuffer = readFileSync(TEST_IMAGE_PATH);
			const formData = new FormData();

			// Create a File object from buffer
			const file = new File([fileBuffer], "test-image.svg", {
				type: "image/svg+xml",
			});
			formData.append("file", file);
			formData.append("alt", "Test image for API testing");

			const response = await fetch(`${BASE_URL}/api/admin/media/upload`, {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${data.error || "Unknown error"}`,
				);
			}

			if (!data.success || !data.data?.id) {
				throw new Error("Invalid response format");
			}

			const result: TestResult = {
				name: testName,
				success: true,
				data: data.data,
			};

			this.results.push(result);
			console.log(`✅ ${testName} - Media ID: ${data.data.id}`);
			return result;
		} catch (error) {
			const result: TestResult = {
				name: testName,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};

			this.results.push(result);
			console.log(`❌ ${testName} - Error: ${result.error}`);
			return result;
		}
	}

	private async testGetMediaInfo(mediaId: string): Promise<TestResult> {
		const testName = "Get Media Info (GET /api/media/[id]?info=true)";
		console.log(`🔄 Testing: ${testName}`);

		try {
			const response = await fetch(
				`${BASE_URL}/api/media/${mediaId}?info=true`,
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${data.error || "Unknown error"}`,
				);
			}

			if (!data.success || !data.data) {
				throw new Error("Invalid response format");
			}

			const result: TestResult = {
				name: testName,
				success: true,
				data: data.data,
			};

			this.results.push(result);
			console.log(`✅ ${testName} - Got media info`);
			return result;
		} catch (error) {
			const result: TestResult = {
				name: testName,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};

			this.results.push(result);
			console.log(`❌ ${testName} - Error: ${result.error}`);
			return result;
		}
	}

	private async testGetMediaFile(mediaId: string): Promise<TestResult> {
		const testName = "Get Media File (GET /api/media/[id])";
		console.log(`🔄 Testing: ${testName}`);

		try {
			const response = await fetch(`${BASE_URL}/api/media/${mediaId}`);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(
					`HTTP ${response.status}: ${data.error || "Unknown error"}`,
				);
			}

			const contentType = response.headers.get("content-type");
			if (!contentType?.startsWith("image/")) {
				throw new Error(`Expected image content type, got: ${contentType}`);
			}

			const buffer = await response.arrayBuffer();
			if (buffer.byteLength === 0) {
				throw new Error("Empty response body");
			}

			const result: TestResult = {
				name: testName,
				success: true,
				data: { contentType, size: buffer.byteLength },
			};

			this.results.push(result);
			console.log(
				`✅ ${testName} - Got ${buffer.byteLength} bytes of ${contentType}`,
			);
			return result;
		} catch (error) {
			const result: TestResult = {
				name: testName,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};

			this.results.push(result);
			console.log(`❌ ${testName} - Error: ${result.error}`);
			return result;
		}
	}

	private async testUpdateMediaAlt(mediaId: string): Promise<TestResult> {
		const testName = "Update Media Alt (PATCH /api/admin/media/[id])";
		console.log(`🔄 Testing: ${testName}`);

		try {
			const response = await fetch(`${BASE_URL}/api/admin/media/${mediaId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					alt: "Updated alt text for testing",
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${data.error || "Unknown error"}`,
				);
			}

			if (!data.success) {
				throw new Error("Update failed");
			}

			const result: TestResult = {
				name: testName,
				success: true,
				data: data.data,
			};

			this.results.push(result);
			console.log(`✅ ${testName} - Alt text updated`);
			return result;
		} catch (error) {
			const result: TestResult = {
				name: testName,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};

			this.results.push(result);
			console.log(`❌ ${testName} - Error: ${result.error}`);
			return result;
		}
	}

	private async testDeleteMedia(mediaId: string): Promise<TestResult> {
		const testName = "Delete Media (DELETE /api/admin/media/[id])";
		console.log(`🔄 Testing: ${testName}`);

		try {
			const response = await fetch(`${BASE_URL}/api/admin/media/${mediaId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${data.error || "Unknown error"}`,
				);
			}

			if (!data.success) {
				throw new Error("Deletion failed");
			}

			const result: TestResult = {
				name: testName,
				success: true,
				data: data.data,
			};

			this.results.push(result);
			console.log(`✅ ${testName} - Media deleted`);
			return result;
		} catch (error) {
			const result: TestResult = {
				name: testName,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};

			this.results.push(result);
			console.log(`❌ ${testName} - Error: ${result.error}`);
			return result;
		}
	}

	private async testGetDeletedMedia(mediaId: string): Promise<TestResult> {
		const testName = "Verify Deletion (GET /api/media/[id] should return 404)";
		console.log(`🔄 Testing: ${testName}`);

		try {
			const response = await fetch(
				`${BASE_URL}/api/media/${mediaId}?info=true`,
			);

			if (response.status === 404) {
				const result: TestResult = {
					name: testName,
					success: true,
				};

				this.results.push(result);
				console.log(`✅ ${testName} - Correctly returns 404`);
				return result;
			} else {
				throw new Error(`Expected 404, got ${response.status}`);
			}
		} catch (error) {
			const result: TestResult = {
				name: testName,
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};

			this.results.push(result);
			console.log(`❌ ${testName} - Error: ${result.error}`);
			return result;
		}
	}

	private printResults(): void {
		console.log("\n📊 Test Results Summary:");
		console.log("========================");

		const passed = this.results.filter((r) => r.success).length;
		const total = this.results.length;

		this.results.forEach((result, index) => {
			const status = result.success ? "✅" : "❌";
			console.log(`${index + 1}. ${status} ${result.name}`);
			if (!result.success && result.error) {
				console.log(`   Error: ${result.error}`);
			}
		});

		console.log(`\n📈 Overall: ${passed}/${total} tests passed`);

		if (passed === total) {
			console.log("🎉 All tests passed! Media API is working correctly.");
		} else {
			console.log("⚠️  Some tests failed. Please check the implementation.");
		}
	}
}

// Run tests if this script is executed directly
if (require.main === module) {
	const tester = new MediaAPITester();
	tester.runAllTests().catch(console.error);
}

export { MediaAPITester };
