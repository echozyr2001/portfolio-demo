import { describe, it, expect, vi } from "vitest";
import {
	formatFileSize,
	isValidImageType,
	getExtensionFromMimeType,
	calculateAspectRatio,
	calculateDimensionsForAspectRatio,
	needsOptimization,
	generateResponsiveSizes,
	createMediaUrl,
	validateImageDimensions,
	extractDominantColor,
	isAnimatedImage,
	generateAltTextSuggestion,
} from "@/lib/media-utils";

describe("Media Utils", () => {
	describe("formatFileSize", () => {
		it("should format bytes correctly", () => {
			expect(formatFileSize(0)).toBe("0 Bytes");
			expect(formatFileSize(1024)).toBe("1 KB");
			expect(formatFileSize(1048576)).toBe("1 MB");
			expect(formatFileSize(1073741824)).toBe("1 GB");
			expect(formatFileSize(1536)).toBe("1.5 KB");
			expect(formatFileSize(2621440)).toBe("2.5 MB");
		});

		it("should handle decimal places correctly", () => {
			expect(formatFileSize(1536)).toBe("1.5 KB");
			expect(formatFileSize(1587)).toBe("1.55 KB");
		});
	});

	describe("isValidImageType", () => {
		it("should validate image MIME types", () => {
			expect(isValidImageType("image/jpeg")).toBe(true);
			expect(isValidImageType("image/jpg")).toBe(true);
			expect(isValidImageType("image/png")).toBe(true);
			expect(isValidImageType("image/webp")).toBe(true);
			expect(isValidImageType("image/gif")).toBe(true);
			expect(isValidImageType("image/svg+xml")).toBe(true);
		});

		it("should reject invalid MIME types", () => {
			expect(isValidImageType("text/plain")).toBe(false);
			expect(isValidImageType("application/pdf")).toBe(false);
			expect(isValidImageType("video/mp4")).toBe(false);
			expect(isValidImageType("image/bmp")).toBe(false);
		});
	});

	describe("getExtensionFromMimeType", () => {
		it("should return correct extensions", () => {
			expect(getExtensionFromMimeType("image/jpeg")).toBe("jpg");
			expect(getExtensionFromMimeType("image/jpg")).toBe("jpg");
			expect(getExtensionFromMimeType("image/png")).toBe("png");
			expect(getExtensionFromMimeType("image/webp")).toBe("webp");
			expect(getExtensionFromMimeType("image/gif")).toBe("gif");
			expect(getExtensionFromMimeType("image/svg+xml")).toBe("svg");
		});

		it("should return default extension for unknown types", () => {
			expect(getExtensionFromMimeType("image/unknown")).toBe("jpg");
			expect(getExtensionFromMimeType("text/plain")).toBe("jpg");
		});
	});

	describe("calculateAspectRatio", () => {
		it("should calculate aspect ratios correctly", () => {
			expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(1.778, 3);
			expect(calculateAspectRatio(1080, 1920)).toBeCloseTo(0.5625, 4);
			expect(calculateAspectRatio(1000, 1000)).toBe(1);
			expect(calculateAspectRatio(800, 600)).toBeCloseTo(1.333, 3);
		});
	});

	describe("calculateDimensionsForAspectRatio", () => {
		it("should calculate dimensions for landscape images", () => {
			const result = calculateDimensionsForAspectRatio(16 / 9, 1920, 1080);
			expect(result.width).toBe(1920);
			expect(result.height).toBe(1080);
		});

		it("should calculate dimensions for portrait images", () => {
			const result = calculateDimensionsForAspectRatio(9 / 16, 1920, 1080);
			expect(result.width).toBe(608); // 1080 * (9/16) rounded
			expect(result.height).toBe(1080);
		});

		it("should calculate dimensions for square images", () => {
			const result = calculateDimensionsForAspectRatio(1, 1000, 800);
			expect(result.width).toBe(800);
			expect(result.height).toBe(800);
		});
	});

	describe("needsOptimization", () => {
		it("should detect when optimization is needed", () => {
			expect(needsOptimization(2500, 1500, 1024 * 1024)).toBe(true); // Too wide
			expect(needsOptimization(1500, 1500, 1024 * 1024)).toBe(true); // Too tall
			expect(needsOptimization(1000, 800, 3 * 1024 * 1024)).toBe(true); // Too large file
		});

		it("should detect when optimization is not needed", () => {
			expect(needsOptimization(1000, 800, 1024 * 1024)).toBe(false);
			expect(needsOptimization(1920, 1080, 1024 * 1024)).toBe(false);
		});

		it("should use custom limits", () => {
			expect(
				needsOptimization(1000, 800, 1024 * 1024, 800, 600, 512 * 1024),
			).toBe(true);
			expect(
				needsOptimization(600, 400, 256 * 1024, 800, 600, 512 * 1024),
			).toBe(false);
		});
	});

	describe("generateResponsiveSizes", () => {
		it("should generate appropriate responsive sizes", () => {
			expect(generateResponsiveSizes(2000)).toEqual([
				320, 640, 768, 1024, 1280, 1920,
			]);
			expect(generateResponsiveSizes(1000)).toEqual([320, 640, 768]);
			expect(generateResponsiveSizes(500)).toEqual([320]);
			expect(generateResponsiveSizes(200)).toEqual([]);
		});
	});

	describe("createMediaUrl", () => {
		it("should create basic media URLs", () => {
			expect(createMediaUrl("test-id")).toBe("/api/media/test-id");
		});

		it("should create thumbnail URLs", () => {
			expect(createMediaUrl("test-id", { thumbnail: true })).toBe(
				"/api/media/test-id?thumbnail=true",
			);
		});

		it("should create info URLs", () => {
			expect(createMediaUrl("test-id", { info: true })).toBe(
				"/api/media/test-id?info=true",
			);
		});

		it("should combine multiple options", () => {
			expect(createMediaUrl("test-id", { thumbnail: true, info: true })).toBe(
				"/api/media/test-id?thumbnail=true&info=true",
			);
		});
	});

	describe("validateImageDimensions", () => {
		it("should validate correct dimensions", () => {
			const result = validateImageDimensions(1920, 1080);
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("should reject dimensions that are too small", () => {
			const result = validateImageDimensions(0, 0);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("too small");
		});

		it("should reject dimensions that are too large", () => {
			const result = validateImageDimensions(6000, 4000);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("too large");
		});

		it("should use custom limits", () => {
			const result = validateImageDimensions(1000, 800, 800, 600, 100, 100);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("too large");
		});
	});

	describe("extractDominantColor", () => {
		it("should extract color from blurhash", () => {
			const color = extractDominantColor("LEHV6nWB2yk8pyo0adR*.7kCMdnj");
			expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
		});

		it("should return default color on error", () => {
			const color = extractDominantColor("invalid-blurhash");
			expect(color).toBe("#f0f0f0");
		});
	});

	describe("isAnimatedImage", () => {
		it("should detect animated images", () => {
			expect(isAnimatedImage("image/gif")).toBe(true);
		});

		it("should detect non-animated images", () => {
			expect(isAnimatedImage("image/jpeg")).toBe(false);
			expect(isAnimatedImage("image/png")).toBe(false);
			expect(isAnimatedImage("image/webp")).toBe(false);
		});
	});

	describe("generateAltTextSuggestion", () => {
		it("should generate alt text from filename", () => {
			expect(generateAltTextSuggestion("my-photo.jpg")).toBe("My Photo");
			expect(generateAltTextSuggestion("beach_sunset.png")).toBe(
				"Beach Sunset",
			);
			expect(generateAltTextSuggestion("profilePicture.jpeg")).toBe(
				"Profile Picture",
			);
			expect(generateAltTextSuggestion("IMG_1234.jpg")).toBe("Img 1234");
		});

		it("should handle files without extensions", () => {
			expect(generateAltTextSuggestion("my-image")).toBe("My Image");
		});

		it("should handle empty or invalid filenames", () => {
			expect(generateAltTextSuggestion("")).toBe("Image");
			expect(generateAltTextSuggestion(".jpg")).toBe("Image");
		});

		it("should handle complex filenames", () => {
			expect(
				generateAltTextSuggestion("vacation-2024_beach-sunset_final.jpg"),
			).toBe("Vacation 2024 Beach Sunset Final");
		});
	});
});
