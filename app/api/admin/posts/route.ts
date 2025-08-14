import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
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
	generateId,
	generateSlug,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { z } from "zod";

// Admin-specific post validation schemas
const createAdminPostSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	mdxContent: z.string().min(1, "MDX content is required"),
	status: z.enum(["draft", "published", "archived"]).default("draft"),
	categoryId: z.string().optional(),
	tagIds: z.array(z.string()).optional(),
	metaTitle: z.string().max(60, "Meta title too long").optional(),
	metaDescription: z.string().max(160, "Meta description too long").optional(),
});

const updateAdminPostSchema = createAdminPostSchema.partial().extend({
	id: z.string().min(1, "ID is required"),
});

const adminPostQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.enum(["draft", "published", "archived"]).optional(),
	categoryId: z.string().optional(),
	tagId: z.string().optional(),
	search: z.string().optional(),
});

// Authentication middleware
function requireAuth(request: NextRequest) {
	if (!isAuthenticatedFromRequest(request)) {
		return createErrorResponse("UNAUTHORIZED", "Authentication required", 401);
	}
	return null;
}

// GET /api/admin/posts - Get posts with admin privileges (includes drafts)
export async function GET(request: NextRequest) {
	// Check authentication
	const authError = requireAuth(request);
	if (authError) return authError;

	try {
		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());

		const validatedQuery = adminPostQuerySchema.parse(queryParams);
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

		// Handle tag filtering
		if (tagId) {
			const taggedPostIds = await db
				.select({ postId: postTags.postId })
				.from(postTags)
				.where(eq(postTags.tagId, tagId));
			
			if (taggedPostIds.length > 0) {
				conditions.push(
					or(...taggedPostIds.map(({ postId }) => eq(posts.id, postId)))
				);
			} else {
				// No posts with this tag, return empty result
				return createSuccessResponse({
					posts: [],
					pagination: {
						page,
						limit,
						totalCount: 0,
						totalPages: 0,
						hasNext: false,
						hasPrev: false,
					},
				});
			}
		}

		// Calculate offset
		const offset = (page - 1) * limit;

		// Get posts with category information
		const baseQuery = db
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
			.leftJoin(categories, eq(posts.categoryId, categories.id));

		const postsResult = await (conditions.length > 0 
			? baseQuery.where(and(...conditions))
			: baseQuery)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(posts.updatedAt));

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
		const [{ count: totalCount }] = await (conditions.length > 0 
			? db.select({ count: count() }).from(posts).where(and(...conditions))
			: db.select({ count: count() }).from(posts));
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

		console.error("Error fetching admin posts:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch posts", 500);
	}
}

// POST /api/admin/posts - Create a new post
export async function POST(request: NextRequest) {
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

		const validatedData = createAdminPostSchema.parse(body);

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

		// Process MDX content and extract metadata
		const metadata = mdxProcessor.extractMetadata(validatedData.mdxContent);

		// Create the post record
		const newPost = {
			id: postId,
			title: validatedData.title,
			slug,
			contentStorageType: "database" as const,
			mdxContent: validatedData.mdxContent,
			excerpt: metadata.excerpt,
			readingTime: metadata.readingTime,
			wordCount: metadata.wordCount,
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