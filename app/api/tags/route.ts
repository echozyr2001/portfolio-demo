import { count, desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { posts, postTags, tags } from "@/lib/schema";
import {
	createErrorResponse,
	createSuccessResponse,
	generateId,
	generateSlug,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { createTagSchema } from "@/lib/validations";

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
	try {
		// Get tags with post count
		const tagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
				createdAt: tags.createdAt,
				postCount: count(postTags.postId),
			})
			.from(tags)
			.leftJoin(postTags, eq(tags.id, postTags.tagId))
			.groupBy(tags.id)
			.orderBy(desc(tags.createdAt));

		return createSuccessResponse({
			tags: tagsResult,
		});
	} catch (error) {
		console.error("Error fetching tags:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch tags", 500);
	}
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = createTagSchema.parse(body);

		const tagId = generateId();
		const now = getCurrentTimestamp();

		// Generate slug from name if not provided
		const slug = validatedData.slug || generateSlug(validatedData.name);

		// Check if name already exists
		const existingTag = await db
			.select({ id: tags.id })
			.from(tags)
			.where(eq(tags.name, validatedData.name))
			.limit(1);

		if (existingTag.length > 0) {
			return createErrorResponse(
				"CONFLICT",
				"A tag with this name already exists",
				409,
			);
		}

		// Check if slug already exists
		const existingSlug = await db
			.select({ id: tags.id })
			.from(tags)
			.where(eq(tags.slug, slug))
			.limit(1);

		if (existingSlug.length > 0) {
			return createErrorResponse(
				"CONFLICT",
				"A tag with this slug already exists",
				409,
			);
		}

		// Create the tag
		const newTag = {
			id: tagId,
			name: validatedData.name,
			slug: slug,
			createdAt: now,
		};

		await db.insert(tags).values(newTag);

		// Fetch the created tag with post count
		const createdTag = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
				createdAt: tags.createdAt,
				postCount: count(postTags.postId),
			})
			.from(tags)
			.leftJoin(postTags, eq(tags.id, postTags.tagId))
			.where(eq(tags.id, tagId))
			.groupBy(tags.id)
			.limit(1);

		if (createdTag.length === 0) {
			return createErrorResponse(
				"INTERNAL_ERROR",
				"Failed to retrieve created tag",
				500,
			);
		}

		return createSuccessResponse(
			createdTag[0],
			"Tag created successfully",
			201,
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error creating tag:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to create tag", 500);
	}
}
