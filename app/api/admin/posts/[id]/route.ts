import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { categories, posts, postTags, tags } from "@/lib/schema";
import { isAuthenticatedFromRequest } from "@/lib/auth";
import { ContentStorageFactory } from "@/lib/content-storage";
import { mdxProcessor } from "@/lib/mdx-processor";
import {
	createErrorResponse,
	createSuccessResponse,
	generateSlug,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { z } from "zod";

// Admin-specific post validation schemas
const updateAdminPostSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
	mdxContent: z.string().min(1, "MDX content is required").optional(),
	status: z.enum(["draft", "published", "archived"]).optional(),
	categoryId: z.string().optional(),
	tagIds: z.array(z.string()).optional(),
	metaTitle: z.string().max(60, "Meta title too long").optional(),
	metaDescription: z.string().max(160, "Meta description too long").optional(),
});

// Authentication middleware
function requireAuth(request: NextRequest) {
	if (!isAuthenticatedFromRequest(request)) {
		return createErrorResponse("UNAUTHORIZED", "Authentication required", 401);
	}
	return null;
}

// GET /api/admin/posts/[id] - Get a specific post with MDX content
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	// Check authentication
	const authError = requireAuth(request);
	if (authError) return authError;

	try {
		// Get basic post information
		const post = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				contentStorageType: posts.contentStorageType,
				excerpt: posts.excerpt,
				readingTime: posts.readingTime,
				wordCount: posts.wordCount,
				status: posts.status,
				publishedAt: posts.publishedAt,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				metaTitle: posts.metaTitle,
				metaDescription: posts.metaDescription,
				category: {
					id: categories.id,
					name: categories.name,
					slug: categories.slug,
				},
			})
			.from(posts)
			.leftJoin(categories, eq(posts.categoryId, categories.id))
			.where(eq(posts.id, params.id))
			.limit(1);

		if (!post[0]) {
			return createErrorResponse("NOT_FOUND", "Post not found", 404);
		}

		// Get MDX content using content storage service
		const storageService = ContentStorageFactory.createForRecord(post[0]);
		const mdxContent = await storageService.getContent(params.id, 'post');

		// Get tags for the post
		const postTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(postTags)
			.innerJoin(tags, eq(postTags.tagId, tags.id))
			.where(eq(postTags.postId, params.id));

		const postWithContent = {
			...post[0],
			mdxContent,
			tags: postTagsResult,
		};

		return createSuccessResponse(postWithContent);
	} catch (error) {
		console.error("Error fetching admin post:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch post", 500);
	}
}

// PUT /api/admin/posts/[id] - Update a specific post
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	// Check authentication
	const authError = requireAuth(request);
	if (authError) return authError;

	try {
		let body;
		try {
			body = await request.json();
		} catch (parseError) {
			return createErrorResponse(
				"INVALID_JSON",
				"Invalid JSON in request body",
				400,
			);
		}

		const validatedData = updateAdminPostSchema.parse(body);

		// Check if post exists
		const currentPost = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				contentStorageType: posts.contentStorageType,
				status: posts.status,
			})
			.from(posts)
			.where(eq(posts.id, params.id))
			.limit(1);

		if (!currentPost[0]) {
			return createErrorResponse("NOT_FOUND", "Post not found", 404);
		}

		const now = getCurrentTimestamp();
		let updateData: any = {
			updatedAt: now,
		};

		// Handle title update and slug generation
		if (validatedData.title && validatedData.title !== currentPost[0].title) {
			const newSlug = generateSlug(validatedData.title);
			
			// Check if new slug conflicts with existing posts (excluding current post)
			const existingPost = await db
				.select({ id: posts.id })
				.from(posts)
				.where(eq(posts.slug, newSlug))
				.limit(1);

			if (existingPost.length > 0 && existingPost[0].id !== params.id) {
				return createErrorResponse(
					"CONFLICT",
					"A post with this title already exists",
					409,
				);
			}

			updateData.title = validatedData.title;
			updateData.slug = newSlug;
		}

		// Handle status update and published date
		if (validatedData.status) {
			updateData.status = validatedData.status;
			
			// Set publishedAt when publishing for the first time
			if (validatedData.status === "published" && currentPost[0].status !== "published") {
				updateData.publishedAt = now;
			}
			// Clear publishedAt when unpublishing
			else if (validatedData.status !== "published" && currentPost[0].status === "published") {
				updateData.publishedAt = null;
			}
		}

		// Handle category validation and update
		if (validatedData.categoryId !== undefined) {
			if (validatedData.categoryId) {
				const categoryExists = await db
					.select({ id: categories.id })
					.from(categories)
					.where(eq(categories.id, validatedData.categoryId))
					.limit(1);

				if (categoryExists.length === 0) {
					return createErrorResponse("NOT_FOUND", "Category not found", 404);
				}
			}
			updateData.categoryId = validatedData.categoryId || null;
		}

		// Handle meta fields
		if (validatedData.metaTitle !== undefined) {
			updateData.metaTitle = validatedData.metaTitle || null;
		}
		if (validatedData.metaDescription !== undefined) {
			updateData.metaDescription = validatedData.metaDescription || null;
		}

		// Handle MDX content update
		if (validatedData.mdxContent) {
			// Process MDX content and extract metadata
			const metadata = mdxProcessor.extractMetadata(validatedData.mdxContent);
			
			// Update content using storage service
			const storageService = ContentStorageFactory.createForRecord(currentPost[0]);
			await storageService.saveContent(params.id, validatedData.mdxContent, 'post');

			// Update extracted metadata
			updateData.excerpt = metadata.excerpt;
			updateData.readingTime = metadata.readingTime;
			updateData.wordCount = metadata.wordCount;
		}

		// Update post record
		await db.update(posts)
			.set(updateData)
			.where(eq(posts.id, params.id));

		// Handle tags update
		if (validatedData.tagIds !== undefined) {
			// Validate tags exist if provided
			if (validatedData.tagIds.length > 0) {
				const tagChecks = await Promise.all(
					validatedData.tagIds.map(async (tagId) => {
						const tagExists = await db
							.select({ id: tags.id })
							.from(tags)
							.where(eq(tags.id, tagId))
							.limit(1);
						return { tagId, exists: tagExists.length > 0 };
					}),
				);

				const missingTags = tagChecks.filter((check) => !check.exists);
				if (missingTags.length > 0) {
					return createErrorResponse(
						"NOT_FOUND",
						`Tags not found: ${missingTags.map((t) => t.tagId).join(", ")}`,
						404,
					);
				}
			}

			// Remove existing tag relations
			await db.delete(postTags).where(eq(postTags.postId, params.id));

			// Add new tag relations
			if (validatedData.tagIds.length > 0) {
				const tagRelations = validatedData.tagIds.map((tagId) => ({
					postId: params.id,
					tagId,
				}));

				await db.insert(postTags).values(tagRelations);
			}
		}

		// Fetch updated post with relations
		const updatedPost = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				contentStorageType: posts.contentStorageType,
				excerpt: posts.excerpt,
				readingTime: posts.readingTime,
				wordCount: posts.wordCount,
				status: posts.status,
				publishedAt: posts.publishedAt,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				metaTitle: posts.metaTitle,
				metaDescription: posts.metaDescription,
				category: {
					id: categories.id,
					name: categories.name,
					slug: categories.slug,
				},
			})
			.from(posts)
			.leftJoin(categories, eq(posts.categoryId, categories.id))
			.where(eq(posts.id, params.id))
			.limit(1);

		// Get tags for the updated post
		const postTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(postTags)
			.innerJoin(tags, eq(postTags.tagId, tags.id))
			.where(eq(postTags.postId, params.id));

		const postWithTags = {
			...updatedPost[0],
			tags: postTagsResult,
		};

		return createSuccessResponse(postWithTags, "Post updated successfully");
	} catch (error) {
		console.error("Error updating post:", error);

		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		// Handle specific database errors
		if (error && typeof error === "object" && "code" in error) {
			if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
				return createErrorResponse(
					"FOREIGN_KEY_ERROR",
					"Referenced category or tag does not exist",
					400,
				);
			}

			if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
				return createErrorResponse(
					"CONFLICT",
					"A post with this title already exists",
					409,
				);
			}
		}

		return createErrorResponse("INTERNAL_ERROR", "Failed to update post", 500);
	}
}

// DELETE /api/admin/posts/[id] - Delete a specific post
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	// Check authentication
	const authError = requireAuth(request);
	if (authError) return authError;

	try {
		// Check if post exists
		const existingPost = await db
			.select({
				id: posts.id,
				title: posts.title,
				contentStorageType: posts.contentStorageType,
			})
			.from(posts)
			.where(eq(posts.id, params.id))
			.limit(1);

		if (!existingPost[0]) {
			return createErrorResponse("NOT_FOUND", "Post not found", 404);
		}

		// Clean up content storage
		const storageService = ContentStorageFactory.createForRecord(existingPost[0]);
		await storageService.deleteContent(params.id, 'post');

		// Delete post (this will cascade delete related records due to foreign key constraints)
		await db.delete(posts).where(eq(posts.id, params.id));

		return createSuccessResponse(
			{ id: params.id, title: existingPost[0].title },
			"Post deleted successfully"
		);
	} catch (error) {
		console.error("Error deleting post:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to delete post", 500);
	}
}