import { and, eq, ne, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { categories, posts, postTags, tags } from "@/lib/schema";
import {
	createErrorResponse,
	createSuccessResponse,
	generateSlug,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { idParamSchema, updatePostSchema } from "@/lib/validations";
import { mdxProcessor } from "@/lib/mdx-processor";

// GET /api/posts/[id] - Get a single post by ID or slug
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);
		const { searchParams } = new URL(request.url);
		const isPublicAccess = searchParams.get('public') === 'true';

		// Determine if the parameter is an ID (UUID format) or a slug
		const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
		
		// Build where condition based on parameter type
		let whereCondition;
		if (isUUID) {
			whereCondition = eq(posts.id, id);
		} else {
			// It's a slug
			whereCondition = eq(posts.slug, id);
		}

		// For public access, only show published posts
		if (isPublicAccess) {
			whereCondition = and(whereCondition, eq(posts.status, "published"));
		}

		// Get post with category information
		const postResult = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				content: posts.content,
				mdxContent: posts.mdxContent,
				contentStorageType: posts.contentStorageType,
				s3Bucket: posts.s3Bucket,
				s3Key: posts.s3Key,
				s3Url: posts.s3Url,
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
			.where(whereCondition)
			.limit(1);

		if (postResult.length === 0) {
			return createErrorResponse("NOT_FOUND", "Post not found", 404);
		}

		const post = postResult[0];

		// Get MDX content and process it for public access
		let mdxSource = null;
		if (isPublicAccess && post.mdxContent) {
			try {
				// Get MDX content based on storage type
				let mdxContent = "";
				if (post.contentStorageType === "database") {
					mdxContent = post.mdxContent || "";
				} else if (post.contentStorageType === "s3") {
					// TODO: Implement S3 content retrieval when S3 storage is implemented
					// For now, fallback to database content
					mdxContent = post.mdxContent || "";
				}

				if (mdxContent) {
					const processResult = await mdxProcessor.serialize(mdxContent);
					mdxSource = processResult.mdxSource;
				}
			} catch (error) {
				console.error("Error processing MDX content:", error);
				// Continue without MDX processing
			}
		}

		// Get tags for the post
		const postTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(postTags)
			.innerJoin(tags, eq(postTags.tagId, tags.id))
			.where(eq(postTags.postId, post.id));

		// Prepare response based on access type
		let postResponse;
		if (isPublicAccess) {
			// Public API - return only necessary fields and processed MDX
			postResponse = {
				id: post.id,
				title: post.title,
				slug: post.slug,
				excerpt: post.excerpt,
				readingTime: post.readingTime,
				wordCount: post.wordCount,
				publishedAt: post.publishedAt,
				metaTitle: post.metaTitle,
				metaDescription: post.metaDescription,
				category: post.category,
				tags: postTagsResult,
				mdxSource, // Processed MDX for rendering
			};
		} else {
			// Admin API - return all fields including raw content
			postResponse = {
				...post,
				tags: postTagsResult,
			};
		}

		return createSuccessResponse(postResponse);
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error fetching post:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch post", 500);
	}
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);
		const body = await request.json();
		const validatedData = updatePostSchema.parse(body);

		// Check if post exists
		const existingPost = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				status: posts.status,
				publishedAt: posts.publishedAt,
			})
			.from(posts)
			.where(eq(posts.id, id))
			.limit(1);

		if (existingPost.length === 0) {
			return createErrorResponse("NOT_FOUND", "Post not found", 404);
		}

		const currentPost = existingPost[0];
		const now = getCurrentTimestamp();

		// Prepare update data
		const updateData: any = {
			updatedAt: now,
		};

		// Handle title and slug update
		if (validatedData.title && validatedData.title !== currentPost.title) {
			const newSlug = generateSlug(validatedData.title);

			// Check if new slug conflicts with other posts
			if (newSlug !== currentPost.slug) {
				const slugConflict = await db
					.select({ id: posts.id })
					.from(posts)
					.where(
						and(
							eq(posts.slug, newSlug),
							ne(posts.id, id), // Exclude current post
						),
					)
					.limit(1);

				if (slugConflict.length > 0) {
					return createErrorResponse(
						"CONFLICT",
						"A post with this title already exists",
						409,
					);
				}

				updateData.slug = newSlug;
			}

			updateData.title = validatedData.title;
		}

		// Handle other fields
		if (validatedData.content !== undefined) {
			updateData.content = validatedData.content;
		}

		if (validatedData.excerpt !== undefined) {
			updateData.excerpt = validatedData.excerpt;
		}

		if (validatedData.status !== undefined) {
			updateData.status = validatedData.status;

			// Handle publishedAt when status changes to published
			if (validatedData.status === "published" && !currentPost.publishedAt) {
				updateData.publishedAt = now;
			} else if (validatedData.status !== "published") {
				updateData.publishedAt = null;
			}
		}

		if (validatedData.metaTitle !== undefined) {
			updateData.metaTitle = validatedData.metaTitle;
		}

		if (validatedData.metaDescription !== undefined) {
			updateData.metaDescription = validatedData.metaDescription;
		}

		if (validatedData.categoryId !== undefined) {
			// Validate category exists if provided (null is allowed)
			if (validatedData.categoryId !== null) {
				const categoryExists = await db
					.select({ id: categories.id })
					.from(categories)
					.where(eq(categories.id, validatedData.categoryId))
					.limit(1);

				if (categoryExists.length === 0) {
					return createErrorResponse("NOT_FOUND", "Category not found", 404);
				}
			}

			updateData.categoryId = validatedData.categoryId;
		}

		// Update the post
		await db.update(posts).set(updateData).where(eq(posts.id, id));

		// Handle tags update if provided
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
			await db.delete(postTags).where(eq(postTags.postId, id));

			// Add new tag relations
			if (validatedData.tagIds.length > 0) {
				const tagRelations = validatedData.tagIds.map((tagId) => ({
					postId: id,
					tagId,
				}));

				await db.insert(postTags).values(tagRelations);
			}
		}

		// Fetch the updated post with relations
		const updatedPost = await db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				content: posts.content,
				excerpt: posts.excerpt,
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
			.where(eq(posts.id, id))
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
			.where(eq(postTags.postId, id));

		const postWithTags = {
			...updatedPost[0],
			tags: postTagsResult,
		};

		return createSuccessResponse(postWithTags, "Post updated successfully");
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error updating post:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to update post", 500);
	}
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);

		// Check if post exists
		const existingPost = await db
			.select({ id: posts.id })
			.from(posts)
			.where(eq(posts.id, id))
			.limit(1);

		if (existingPost.length === 0) {
			return createErrorResponse("NOT_FOUND", "Post not found", 404);
		}

		// Delete post tags relations (cascade will handle this, but explicit is better)
		await db.delete(postTags).where(eq(postTags.postId, id));

		// Delete the post (comments will be cascade deleted due to foreign key)
		await db.delete(posts).where(eq(posts.id, id));

		return createSuccessResponse(null, "Post deleted successfully");
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error deleting post:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to delete post", 500);
	}
}
