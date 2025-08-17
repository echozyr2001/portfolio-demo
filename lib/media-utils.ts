import { decode } from "blurhash";

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate image file type
 */
export function isValidImageType(mimeType: string): boolean {
	const validTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
		"image/gif",
		"image/svg+xml",
	];
	return validTypes.includes(mimeType);
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
	const mimeToExt: Record<string, string> = {
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/webp": "webp",
		"image/gif": "gif",
		"image/svg+xml": "svg",
	};
	return mimeToExt[mimeType] || "jpg";
}

/**
 * Generate blurhash SVG placeholder
 */
export function generateBlurhashSVG(
	blurhash: string,
	width: number = 100,
	height: number = 100,
): string {
	try {
		// Decode blurhash to pixel data
		const pixels = decode(blurhash, width, height);

		// Convert pixel data to base64 image
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			throw new Error("Could not get canvas context");
		}

		const imageData = ctx.createImageData(width, height);
		imageData.data.set(pixels);
		ctx.putImageData(imageData, 0, 0);

		return canvas.toDataURL();
	} catch (error) {
		console.error("Failed to generate blurhash SVG:", error);
		// Return a simple gray placeholder
		return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" fill="#f0f0f0"/>
      </svg>
    `)}`;
	}
}

/**
 * Generate blurhash CSS background
 */
export function generateBlurhashCSS(blurhash: string): string {
	try {
		const svg = generateBlurhashSVG(blurhash, 32, 32);
		return `url("${svg}")`;
	} catch (error) {
		return "linear-gradient(45deg, #f0f0f0, #e0e0e0)";
	}
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
	return width / height;
}

/**
 * Calculate dimensions for a given aspect ratio and max size
 */
export function calculateDimensionsForAspectRatio(
	aspectRatio: number,
	maxWidth: number,
	maxHeight: number,
): { width: number; height: number } {
	if (aspectRatio >= 1) {
		// Landscape or square
		const width = Math.min(maxWidth, maxHeight * aspectRatio);
		const height = width / aspectRatio;
		return { width: Math.round(width), height: Math.round(height) };
	} else {
		// Portrait
		const height = Math.min(maxHeight, maxWidth / aspectRatio);
		const width = height * aspectRatio;
		return { width: Math.round(width), height: Math.round(height) };
	}
}

/**
 * Check if image needs optimization
 */
export function needsOptimization(
	width: number,
	height: number,
	fileSize: number,
	maxWidth: number = 1920,
	maxHeight: number = 1080,
	maxFileSize: number = 2 * 1024 * 1024, // 2MB
): boolean {
	return width > maxWidth || height > maxHeight || fileSize > maxFileSize;
}

/**
 * Generate responsive image sizes
 */
export function generateResponsiveSizes(originalWidth: number): number[] {
	const sizes = [320, 640, 768, 1024, 1280, 1920];
	return sizes.filter((size) => size <= originalWidth);
}

/**
 * Create media URL with query parameters
 */
export function createMediaUrl(
	id: string,
	options: {
		thumbnail?: boolean;
		info?: boolean;
	} = {},
): string {
	const params = new URLSearchParams();

	if (options.thumbnail) {
		params.set("thumbnail", "true");
	}

	if (options.info) {
		params.set("info", "true");
	}

	const queryString = params.toString();
	return `/api/media/${id}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
	width: number,
	height: number,
	maxWidth: number = 5000,
	maxHeight: number = 5000,
	minWidth: number = 1,
	minHeight: number = 1,
): { valid: boolean; error?: string } {
	if (width < minWidth || height < minHeight) {
		return {
			valid: false,
			error: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`,
		};
	}

	if (width > maxWidth || height > maxHeight) {
		return {
			valid: false,
			error: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`,
		};
	}

	return { valid: true };
}

/**
 * Extract dominant color from image buffer (simplified version)
 */
export function extractDominantColor(blurhash: string): string {
	try {
		// This is a simplified approach - in a real implementation,
		// you might want to use a more sophisticated color extraction
		const pixels = decode(blurhash, 1, 1);
		const r = pixels[0];
		const g = pixels[1];
		const b = pixels[2];

		return `rgb(${r}, ${g}, ${b})`;
	} catch (error) {
		return "#f0f0f0"; // Default gray
	}
}

/**
 * Check if image is animated (GIF)
 */
export function isAnimatedImage(mimeType: string): boolean {
	return mimeType === "image/gif";
}

/**
 * Generate alt text suggestions based on filename
 */
export function generateAltTextSuggestion(filename: string): string {
	// Remove extension and replace common separators with spaces
	const baseName = filename.replace(/\.[^/.]+$/, "");
	const suggestion = baseName
		.replace(/[-_]/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2") // Handle camelCase
		.toLowerCase()
		.replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word

	return suggestion || "Image";
}
