import { and, count, eq, ne } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/schema";
import {
	createErrorResponse,
	createSuccessResponse,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { idParamSchema, updateCategorySchema } from "@/lib/validations";

// GET /api/categories/[id] - Get a single category by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);

		// Get category with post count
		const categoryResult = await db
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
			.where(eq(categories.id, id))
			.groupBy(categories.id)
			.limit(1);

		if (categoryResult.length === 0) {
			return createErrorResponse("NOT_FOUND", "Category not found", 404);
		}

		return createSuccessResponse(categoryResult[0]);
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error fetching category:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to fetch category",
			500,
		);
	}
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);
		const body = await request.json();
		const validatedData = updateCategorySchema.parse(body);

		// Check if category exists
		const existingCategory = await db
			.select({
				id: categories.id,
				name: categories.name,
				slug: categories.slug,
			})
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		if (existingCategory.length === 0) {
			return createErrorResponse("NOT_FOUND", "Category not found", 404);
		}

		const currentCategory = existingCategory[0];
		const now = getCurrentTimestamp();

		// Prepare update data
		const updateData: any = {
			updatedAt: now,
		};

		// Check for name conflicts
		if (validatedData.name && validatedData.name !== currentCategory.name) {
			const nameConflict = await db
				.select({ id: categories.id })
				.from(categories)
				.where(
					and(
						eq(categories.name, validatedData.name),
						ne(categories.id, id), // Exclude current category
					),
				)
				.limit(1);

			if (nameConflict.length > 0) {
				return createErrorResponse(
					"CONFLICT",
					"A category with this name already exists",
					409,
				);
			}

			updateData.name = validatedData.name;
		}

		// Check for slug conflicts
		if (validatedData.slug && validatedData.slug !== currentCategory.slug) {
			const slugConflict = await db
				.select({ id: categories.id })
				.from(categories)
				.where(
					and(
						eq(categories.slug, validatedData.slug),
						ne(categories.id, id), // Exclude current category
					),
				)
				.limit(1);

			if (slugConflict.length > 0) {
				return createErrorResponse(
					"CONFLICT",
					"A category with this slug already exists",
					409,
				);
			}

			updateData.slug = validatedData.slug;
		}

		// Handle description
		if (validatedData.description !== undefined) {
			updateData.description = validatedData.description;
		}

		// Update the category
		await db.update(categories).set(updateData).where(eq(categories.id, id));

		// Fetch the updated category with post count
		const updatedCategory = await db
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
			.where(eq(categories.id, id))
			.groupBy(categories.id)
			.limit(1);

		return createSuccessResponse(
			updatedCategory[0],
			"Category updated successfully",
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error updating category:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to update category",
			500,
		);
	}
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);

		// Check if category exists
		const existingCategory = await db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		if (existingCategory.length === 0) {
			return createErrorResponse("NOT_FOUND", "Category not found", 404);
		}

		// Check if category has posts
		const postsInCategory = await db
			.select({ count: count() })
			.from(posts)
			.where(eq(posts.categoryId, id));

		if (postsInCategory[0].count > 0) {
			return createErrorResponse(
				"CONFLICT",
				"Cannot delete category that contains posts. Please reassign or delete the posts first.",
				409,
			);
		}

		// Delete the category
		await db.delete(categories).where(eq(categories.id, id));

		return createSuccessResponse(null, "Category deleted successfully");
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error deleting category:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to delete category",
			500,
		);
	}
}
