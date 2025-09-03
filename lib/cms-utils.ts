import { CMS_CONFIG, VALIDATION_RULES } from "./cms-config";
import type {
  BlogFormData,
  ProjectFormData,
  MDXValidationResult,
} from "./types/mdx";

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validate blog form data
 */
export function validateBlogData(
  data: Partial<BlogFormData>
): MDXValidationResult {
  const errors: Array<{
    type: "syntax" | "component" | "runtime";
    message: string;
  }> = [];
  const warnings: string[] = [];

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push({ type: "syntax", message: "Title is required" });
  } else if (data.title.length > VALIDATION_RULES.blog.title.maxLength) {
    errors.push({
      type: "syntax",
      message: `Title must be less than ${VALIDATION_RULES.blog.title.maxLength} characters`,
    });
  }

  // Slug validation
  if (!data.slug || data.slug.trim().length === 0) {
    errors.push({ type: "syntax", message: "Slug is required" });
  } else if (!VALIDATION_RULES.blog.slug.pattern.test(data.slug)) {
    errors.push({
      type: "syntax",
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    });
  }

  // Content validation
  if (!data.content || data.content.trim().length === 0) {
    errors.push({ type: "syntax", message: "Content is required" });
  } else if (data.content.length > VALIDATION_RULES.blog.content.maxLength) {
    errors.push({
      type: "syntax",
      message: `Content must be less than ${VALIDATION_RULES.blog.content.maxLength} characters`,
    });
  }

  // Excerpt validation
  if (
    data.excerpt &&
    data.excerpt.length > VALIDATION_RULES.blog.excerpt.maxLength
  ) {
    warnings.push(
      `Excerpt should be less than ${VALIDATION_RULES.blog.excerpt.maxLength} characters`
    );
  }

  // Tags validation
  if (data.tags && data.tags.length > VALIDATION_RULES.blog.tags.maxItems) {
    warnings.push(
      `Consider using fewer than ${VALIDATION_RULES.blog.tags.maxItems} tags`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate project form data
 */
export function validateProjectData(
  data: Partial<ProjectFormData>
): MDXValidationResult {
  const errors: Array<{
    type: "syntax" | "component" | "runtime";
    message: string;
  }> = [];
  const warnings: string[] = [];

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.push({ type: "syntax", message: "Title is required" });
  } else if (data.title.length > VALIDATION_RULES.project.title.maxLength) {
    errors.push({
      type: "syntax",
      message: `Title must be less than ${VALIDATION_RULES.project.title.maxLength} characters`,
    });
  }

  // Slug validation
  if (!data.slug || data.slug.trim().length === 0) {
    errors.push({ type: "syntax", message: "Slug is required" });
  } else if (!VALIDATION_RULES.project.slug.pattern.test(data.slug)) {
    errors.push({
      type: "syntax",
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    });
  }

  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.push({ type: "syntax", message: "Description is required" });
  } else if (
    data.description.length > VALIDATION_RULES.project.description.maxLength
  ) {
    errors.push({
      type: "syntax",
      message: `Description must be less than ${VALIDATION_RULES.project.description.maxLength} characters`,
    });
  }

  // Short description validation
  if (!data.shortDescription || data.shortDescription.trim().length === 0) {
    errors.push({ type: "syntax", message: "Short description is required" });
  } else if (
    data.shortDescription.length >
    VALIDATION_RULES.project.shortDescription.maxLength
  ) {
    errors.push({
      type: "syntax",
      message: `Short description must be less than ${VALIDATION_RULES.project.shortDescription.maxLength} characters`,
    });
  }

  // Technologies validation
  if (!data.technologies || data.technologies.length === 0) {
    errors.push({
      type: "syntax",
      message: "At least one technology is required",
    });
  } else if (
    data.technologies.length > VALIDATION_RULES.project.technologies.maxItems
  ) {
    warnings.push(
      `Consider using fewer than ${VALIDATION_RULES.project.technologies.maxItems} technologies`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if file type is allowed for upload
 */
export function isAllowedFileType(mimeType: string): boolean {
  return CMS_CONFIG.upload.ALLOWED_MIME_TYPES.includes(mimeType as any);
}

/**
 * Check if file size is within limits
 */
export function isValidFileSize(size: number): boolean {
  return size <= CMS_CONFIG.upload.MAX_FILE_SIZE;
}

/**
 * Generate SEO-friendly meta description from content
 */
export function generateMetaDescription(
  content: string,
  maxLength: number = 160
): string {
  // Remove MDX/HTML tags and get plain text
  const plainText = content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\{[^}]*\}/g, "") // Remove JSX expressions
    .replace(/[#*_`]/g, "") // Remove markdown formatting
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Truncate at word boundary
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + "..."
    : truncated + "...";
}

/**
 * Extract reading time from content
 */
export function calculateReadingTime(content: string): {
  text: string;
  minutes: number;
  words: number;
} {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return {
    text: `${minutes} min read`,
    minutes,
    words,
  };
}

/**
 * Debounce function for auto-save and preview updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create a safe filename from a string
 */
export function createSafeFilename(filename: string): string {
  const name = filename.replace(/\.[^/.]+$/, ""); // Remove extension
  const extension = filename.split(".").pop() || "";

  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return extension ? `${safeName}.${extension}` : safeName;
}

/**
 * Parse and validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique ID for temporary use
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return dateObj.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Sort array by multiple criteria
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}
