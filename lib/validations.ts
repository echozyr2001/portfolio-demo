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

// Category validation schemas
export const createCategorySchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	slug: z.string().min(1, "Slug is required").max(100, "Slug too long"),
	description: z.string().max(500, "Description too long").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Tag validation schemas
export const createTagSchema = z.object({
	name: z.string().min(1, "Name is required").max(50, "Name too long"),
	slug: z.string().min(1, "Slug is required").max(50, "Slug too long"),
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
