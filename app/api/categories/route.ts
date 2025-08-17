import { count, desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/schema";
import {
	createErrorResponse,
	createSuccessResponse,
	generateId,
	generateSlug,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { createCategorySchema } from "@/lib/validations";

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
	try {
		// Get categories with post count
		const categoriesResult = await db
			.select({
				id: categories.id,
				name: categories.name,
				slug: categories.slug,
				description: categories.description,
				createdAt: categories.createdAt,
				updatedAt: categories.updatedAt,
				postCount: count(posts.id),
			})
			.from(categories)
			.leftJoin(posts, eq(categories.id, posts.categoryId))
			.groupBy(categories.id)
			.orderBy(desc(categories.createdAt));

		return createSuccessResponse({
			categories: categoriesResult,
		});
	} catch (error) {
		console.error("Error fetching categories:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to fetch categories",
			500,
		);
	}
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = createCategorySchema.parse(body);

		const categoryId = generateId();
		const now = getCurrentTimestamp();

		// Generate slug from name if not provided
		const slug = validatedData.slug || generateSlug(validatedData.name);

		// Check if name already exists
		const existingCategory = await db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.name, validatedData.name))
			.limit(1);

		if (existingCategory.length > 0) {
			return createErrorResponse(
				"CONFLICT",
				"A category with this name already exists",
				409,
			);
		}

		// Check if slug already exists
		const existingSlug = await db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.slug, slug))
			.limit(1);

		if (existingSlug.length > 0) {
			return createErrorResponse(
				"CONFLICT",
				"A category with this slug already exists",
				409,
			);
		}

		// Create the category
		const newCategory = {
			id: categoryId,
			name: validatedData.name,
			slug: slug,
			description: validatedData.description || null,
			createdAt: now,
			updatedAt: now,
		};

		await db.insert(categories).values(newCategory);

		// Fetch the created category
		const createdCategory = await db
			.select({
				id: categories.id,
				name: categories.name,
				slug: categories.slug,
				description: categories.description,
				createdAt: categories.createdAt,
				updatedAt: categories.updatedAt,
				postCount: count(posts.id),
			})
			.from(categories)
			.leftJoin(posts, eq(categories.id, posts.categoryId))
			.where(eq(categories.id, categoryId))
			.groupBy(categories.id)
			.limit(1);

		if (createdCategory.length === 0) {
			return createErrorResponse(
				"INTERNAL_ERROR",
				"Failed to retrieve created category",
				500,
			);
		}

		return createSuccessResponse(
			createdCategory[0],
			"Category created successfully",
			201,
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error creating category:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to create category",
			500,
		);
	}
}
