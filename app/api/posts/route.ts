import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { categories, posts, postTags, tags } from "@/lib/schema";
import {
	createErrorResponse,
	createSuccessResponse,
	generateId,
	generateSlug,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { createPostSchema, postQuerySchema } from "@/lib/validations";

// GET /api/posts - Get posts with filtering and pagination
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());

		const validatedQuery = postQuerySchema.parse(queryParams);
		const { page, limit, status, categoryId, tagId, search } = validatedQuery;

		// Build where conditions
		const conditions = [];

		if (status) {
			conditions.push(eq(posts.status, status));
		}

		if (categoryId) {
			conditions.push(eq(posts.categoryId, categoryId));
		}

		if (search) {
			conditions.push(
				or(
					like(posts.title, `%${search}%`),
					like(posts.excerpt, `%${search}%`),
				),
			);
		}

		// Calculate offset
		const offset = (page - 1) * limit;

		// Get posts with category information
		let query = db
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
			.limit(limit)
			.offset(offset)
			.orderBy(desc(posts.createdAt));

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const postsResult = await query;

		// Get tags for each post
		const postsWithTags = await Promise.all(
			postsResult.map(async (post) => {
				const postTagsResult = await db
					.select({
						id: tags.id,
						name: tags.name,
						slug: tags.slug,
					})
					.from(postTags)
					.innerJoin(tags, eq(postTags.tagId, tags.id))
					.where(eq(postTags.postId, post.id));

				return {
					...post,
					tags: postTagsResult,
				};
			}),
		);

		// Get total count for pagination
		const totalCountQuery = db.select({ count: count() }).from(posts);

		if (conditions.length > 0) {
			totalCountQuery.where(and(...conditions));
		}

		const [{ count: totalCount }] = await totalCountQuery;
		const totalPages = Math.ceil(totalCount / limit);

		return createSuccessResponse({
			posts: postsWithTags,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error fetching posts:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch posts", 500);
	}
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
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

		const validatedData = createPostSchema.parse(body);

		const postId = generateId();
		const slug = generateSlug(validatedData.title);
		const now = getCurrentTimestamp();

		// Check if slug already exists
		const existingPost = await db
			.select({ id: posts.id })
			.from(posts)
			.where(eq(posts.slug, slug))
			.limit(1);

		if (existingPost.length > 0) {
			return createErrorResponse(
				"CONFLICT",
				"A post with this title already exists",
				409,
			);
		}

		// Validate category exists if provided
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

		// Validate tags exist if provided
		if (validatedData.tagIds && validatedData.tagIds.length > 0) {
			const existingTags = await db
				.select({ id: tags.id })
				.from(tags)
				.where(eq(tags.id, validatedData.tagIds[0])); // This needs to be fixed for multiple tags

			// Check all tag IDs exist
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

		// Create the post
		const newPost = {
			id: postId,
			title: validatedData.title,
			slug,
			content: validatedData.content || null,
			excerpt: validatedData.excerpt || null,
			status: validatedData.status,
			publishedAt: validatedData.status === "published" ? now : null,
			createdAt: now,
			updatedAt: now,
			metaTitle: validatedData.metaTitle || null,
			metaDescription: validatedData.metaDescription || null,
			categoryId: validatedData.categoryId || null,
		};

		await db.insert(posts).values(newPost);

		// Handle tags if provided
		if (validatedData.tagIds && validatedData.tagIds.length > 0) {
			const tagRelations = validatedData.tagIds.map((tagId) => ({
				postId,
				tagId,
			}));

			await db.insert(postTags).values(tagRelations);
		}

		// Fetch the created post with relations
		const createdPost = await db
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
			.where(eq(posts.id, postId))
			.limit(1);

		if (createdPost.length === 0) {
			return createErrorResponse(
				"INTERNAL_ERROR",
				"Failed to retrieve created post",
				500,
			);
		}

		// Get tags for the created post
		const postTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(postTags)
			.innerJoin(tags, eq(postTags.tagId, tags.id))
			.where(eq(postTags.postId, postId));

		const postWithTags = {
			...createdPost[0],
			tags: postTagsResult,
		};

		return createSuccessResponse(
			postWithTags,
			"Post created successfully",
			201,
		);
	} catch (error) {
		console.error("Error creating post:", error);

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

		return createErrorResponse("INTERNAL_ERROR", "Failed to create post", 500);
	}
}
