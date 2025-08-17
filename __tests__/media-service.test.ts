import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MediaService } from "@/lib/media-service";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Mock the database
vi.mock("@/lib/db", () => ({
	db: {
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockResolvedValue(undefined),
		}),
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([]),
				}),
				limit: vi.fn().mockReturnValue({
					offset: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue([]),
					}),
				}),
			}),
		}),
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		}),
		delete: vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue(undefined),
		}),
	},
}));

describe("MediaService", () => {
	let mediaService: MediaService;
	let testImageBuffer: Buffer;
	let testFile: File;

	beforeEach(async () => {
		mediaService = new MediaService();

		// Create a test image buffer (100x100 red square)
		testImageBuffer = await sharp({
			create: {
				width: 100,
				height: 100,
				channels: 3,
				background: { r: 255, g: 0, b: 0 },
			},
		})
			.jpeg()
			.toBuffer();

		// Create a mock File object
		testFile = new File([testImageBuffer], "test-image.jpg", {
			type: "image/jpeg",
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("File Validation", () => {
		it("should accept valid image files", async () => {
			const validFile = new File([testImageBuffer], "test.jpg", {
				type: "image/jpeg",
			});

			expect(() => {
				// Access private method for testing
				(mediaService as any).validateFile(validFile);
			}).not.toThrow();
		});

		it("should reject files that are too large", () => {
			const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
			const largeFile = new File([largeBuffer], "large.jpg", {
				type: "image/jpeg",
			});

			expect(() => {
				(mediaService as any).validateFile(largeFile);
			}).toThrow("File too large");
		});

		it("should reject invalid file types", () => {
			const invalidFile = new File([testImageBuffer], "test.txt", {
				type: "text/plain",
			});

			expect(() => {
				(mediaService as any).validateFile(invalidFile);
			}).toThrow("File type not allowed");
		});

		it("should reject empty files", () => {
			const emptyFile = new File([], "empty.jpg", {
				type: "image/jpeg",
			});

			expect(() => {
				(mediaService as any).validateFile(emptyFile);
			}).toThrow("File is empty");
		});
	});

	describe("Image Optimization", () => {
		it("should optimize JPEG images", async () => {
			const result = await (mediaService as any).optimizeImage(
				testImageBuffer,
				"image/jpeg",
			);

			expect(result).toHaveProperty("originalBase64");
			expect(result).toHaveProperty("thumbnailBase64");
			expect(result).toHaveProperty("width");
			expect(result).toHaveProperty("height");
			expect(result).toHaveProperty("blurhash");
			expect(result).toHaveProperty("compressionRatio");
			expect(typeof result.originalBase64).toBe("string");
			expect(typeof result.thumbnailBase64).toBe("string");
			expect(typeof result.blurhash).toBe("string");
		});

		it("should handle SVG files without processing", async () => {
			const svgContent =
				'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';
			const svgBuffer = Buffer.from(svgContent);

			const result = await (mediaService as any).optimizeImage(
				svgBuffer,
				"image/svg+xml",
			);

			expect(result.width).toBe(0);
			expect(result.height).toBe(0);
			expect(result.compressionRatio).toBe(1.0);
			expect(result.originalBase64).toBe(result.thumbnailBase64);
		});

		it("should resize large images", async () => {
			// Create a large test image
			const largeImageBuffer = await sharp({
				create: {
					width: 3000,
					height: 2000,
					channels: 3,
					background: { r: 0, g: 255, b: 0 },
				},
			})
				.jpeg()
				.toBuffer();

			const result = await (mediaService as any).optimizeImage(
				largeImageBuffer,
				"image/jpeg",
			);

			// Should be resized to fit within max dimensions (1920x1080)
			expect(result.width).toBeLessThanOrEqual(1920);
			expect(result.height).toBeLessThanOrEqual(1080);
		});
	});

	describe("Dimension Calculations", () => {
		it("should maintain aspect ratio when resizing", () => {
			const result = (mediaService as any).calculateDimensions(
				1600,
				900,
				800,
				600,
			);

			// Should maintain 16:9 aspect ratio
			expect(result.width / result.height).toBeCloseTo(1600 / 900, 2);
			expect(result.width).toBeLessThanOrEqual(800);
			expect(result.height).toBeLessThanOrEqual(600);
		});

		it("should not upscale small images", () => {
			const result = (mediaService as any).calculateDimensions(
				400,
				300,
				1920,
				1080,
			);

			expect(result.width).toBe(400);
			expect(result.height).toBe(300);
		});

		it("should handle portrait images correctly", () => {
			const result = (mediaService as any).calculateDimensions(
				900,
				1600,
				800,
				600,
			);

			// Should be constrained by height
			expect(result.height).toBe(600);
			expect(result.width).toBeLessThan(600);
		});
	});

	describe("File Extension Handling", () => {
		it("should extract correct file extensions", () => {
			expect((mediaService as any).getFileExtension("image.jpg")).toBe("jpg");
			expect((mediaService as any).getFileExtension("photo.JPEG")).toBe("jpeg");
			expect((mediaService as any).getFileExtension("icon.png")).toBe("png");
			expect((mediaService as any).getFileExtension("animation.gif")).toBe(
				"gif",
			);
			expect((mediaService as any).getFileExtension("vector.svg")).toBe("svg");
		});

		it("should handle files without extensions", () => {
			expect((mediaService as any).getFileExtension("image")).toBe("jpg");
		});

		it("should handle multiple dots in filename", () => {
			expect((mediaService as any).getFileExtension("my.image.file.png")).toBe(
				"png",
			);
		});
	});

	describe("Blurhash Generation", () => {
		it("should generate valid blurhash", async () => {
			const blurhash = await (mediaService as any).generateBlurhash(
				testImageBuffer,
			);

			expect(typeof blurhash).toBe("string");
			expect(blurhash.length).toBeGreaterThan(0);
			// Blurhash should be a valid format (starts with a character and contains base83 characters)
			expect(blurhash).toMatch(/^[A-Za-z0-9#$%*+,-.:;=?@\[\]^_{|}~]+$/);
		});

		it("should return default blurhash on error", async () => {
			const invalidBuffer = Buffer.from("invalid image data");

			const blurhash = await (mediaService as any).generateBlurhash(
				invalidBuffer,
			);

			expect(blurhash).toBe("LEHV6nWB2yk8pyo0adR*.7kCMdnj");
		});
	});

	describe("Configuration", () => {
		it("should use default configuration", () => {
			const service = new MediaService();
			expect((service as any).config.maxFileSize).toBe(5 * 1024 * 1024);
			expect((service as any).config.compressionQuality).toBe(0.8);
		});

		it("should accept custom configuration", () => {
			const customConfig = {
				maxFileSize: 10 * 1024 * 1024,
				compressionQuality: 0.9,
			};

			const service = new MediaService(customConfig);
			expect((service as any).config.maxFileSize).toBe(10 * 1024 * 1024);
			expect((service as any).config.compressionQuality).toBe(0.9);
		});

		it("should merge custom config with defaults", () => {
			const customConfig = {
				maxFileSize: 10 * 1024 * 1024,
			};

			const service = new MediaService(customConfig);
			expect((service as any).config.maxFileSize).toBe(10 * 1024 * 1024);
			expect((service as any).config.compressionQuality).toBe(0.8); // Should keep default
		});
	});
});

describe("MediaService Integration", () => {
	let mediaService: MediaService;

	beforeEach(() => {
		mediaService = new MediaService();
	});

	it("should handle the complete process flow", async () => {
		// Create a test image
		const imageBuffer = await sharp({
			create: {
				width: 800,
				height: 600,
				channels: 3,
				background: { r: 100, g: 150, b: 200 },
			},
		})
			.jpeg({ quality: 90 })
			.toBuffer();

		const testFile = new File([imageBuffer], "test-photo.jpg", {
			type: "image/jpeg",
		});

		// Mock the database insert to return success
		const mockDb = await import("@/lib/db");
		vi.mocked(mockDb.db.insert).mockReturnValue({
			values: vi.fn().mockResolvedValue(undefined),
		} as any);

		// Process the file
		const result = await mediaService.processAndStore(testFile);

		expect(result).toHaveProperty("id");
		expect(result).toHaveProperty("filename");
		expect(result).toHaveProperty("originalName", "test-photo.jpg");
		expect(result).toHaveProperty("mimeType", "image/jpeg");
		expect(result).toHaveProperty("storageType", "base64");
		expect(result).toHaveProperty("base64Data");
		expect(result).toHaveProperty("thumbnailBase64");
		expect(result).toHaveProperty("blurhash");
		expect(result.width).toBeGreaterThan(0);
		expect(result.height).toBeGreaterThan(0);
	});
});
