import { z } from "zod";

// Post validation schemas
export const createPostSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	content: z.any().optional(), // Tiptap JSON content
	excerpt: z.string().max(500, "Excerpt too long").optional(),
	status: z.enum(["draft", "published", "archived"]).default("draft"),
	categoryId: z.string().optional(),
	tagIds: z.array(z.string()).optional(),
	metaTitle: z.string().max(60, "Meta title too long").optional(),
	metaDescription: z.string().max(160, "Meta description too long").optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const postQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.enum(["draft", "published", "archived"]).optional(),
	categoryId: z.string().optional(),
	tagId: z.string().optional(),
	search: z.string().optional(),
});

// Public post query schema (no status filter - only published posts)
export const publicPostQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	categoryId: z.string().optional(),
	tagId: z.string().optional(),
	search: z.string().optional(),
});

// Project validation schemas
export const createProjectSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	mdxContent: z.string().optional(),
	githubUrl: z.string().url("Invalid GitHub URL").optional(),
	liveUrl: z.string().url("Invalid live URL").optional(),
	imageUrl: z.string().url("Invalid image URL").optional(),
	technologies: z.array(z.string()).optional(),
	featured: z.boolean().default(false),
	status: z.enum(["draft", "published", "archived"]).default("draft"),
	tagIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.enum(["draft", "published", "archived"]).optional(),
	featured: z.coerce.boolean().optional(),
	tagId: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(["publishedAt", "title", "featured"]).default("publishedAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Public project query schema (no status filter - only published projects)
export const publicProjectQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	featured: z.coerce.boolean().optional(),
	tagId: z.string().optional(),
	search: z.string().optional(),
	sortBy: z.enum(["publishedAt", "title", "featured"]).default("publishedAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Slug parameter schema
export const slugParamSchema = z.object({
	slug: z.string().min(1, "Slug is required"),
});

// Category validation schemas
export const createCategorySchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(100, "Slug too long")
		.optional(),
	description: z.string().max(500, "Description too long").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Tag validation schemas
export const createTagSchema = z.object({
	name: z.string().min(1, "Name is required").max(50, "Name too long"),
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(50, "Slug too long")
		.optional(),
});

export const updateTagSchema = createTagSchema.partial();

// Common query schemas
export const idParamSchema = z.object({
	id: z.string().min(1, "ID is required"),
});

// Error response schema
export const errorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	details: z.any().optional(),
});

// Success response schemas
export const successResponseSchema = z.object({
	success: z.boolean(),
	message: z.string().optional(),
	data: z.any().optional(),
});

// Import/Export validation schemas
export const importConfigSchema = z.object({
	contentType: z.enum(["posts", "projects"]),
	conflictResolution: z.enum(["skip", "overwrite", "rename"]).default("skip"),
	validateContent: z.boolean().default(true),
	createMissingCategories: z.boolean().default(true),
	createMissingTags: z.boolean().default(true),
});

export const exportConfigSchema = z.object({
	includeMetadata: z.boolean().default(true),
	format: z.enum(["zip", "individual"]).default("zip"),
	contentTypes: z
		.array(z.enum(["posts", "projects"]))
		.min(1, "At least one content type must be selected"),
	status: z.array(z.enum(["draft", "published", "archived"])).optional(),
});

export const mdxFileSchema = z.object({
	filename: z.string().regex(/\.mdx?$/i, "File must be .md or .mdx"),
	content: z.string().min(1, "File content cannot be empty"),
});

export const frontmatterSchema = z.object({
	title: z.string().min(1, "Title is required"),
	slug: z.string().optional(),
	status: z.enum(["draft", "published", "archived"]).optional(),
	publishedAt: z.string().or(z.date()).optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	// Project specific fields
	githubUrl: z.string().url().optional(),
	liveUrl: z.string().url().optional(),
	imageUrl: z.string().url().optional(),
	technologies: z.array(z.string()).optional(),
	featured: z.boolean().optional(),
});
