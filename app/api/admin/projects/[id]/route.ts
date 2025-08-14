import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { projects, projectTags, tags } from "@/lib/schema";
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

// Admin-specific project validation schemas
const updateAdminProjectSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
	mdxContent: z.string().min(1, "MDX content is required").optional(),
	githubUrl: z.string().url("Invalid GitHub URL").optional(),
	liveUrl: z.string().url("Invalid live URL").optional(),
	imageUrl: z.string().url("Invalid image URL").optional(),
	technologies: z.array(z.string()).optional(),
	featured: z.boolean().optional(),
	status: z.enum(["draft", "published", "archived"]).optional(),
	tagIds: z.array(z.string()).optional(),
});

// Authentication middleware
function requireAuth(request: NextRequest) {
	if (!isAuthenticatedFromRequest(request)) {
		return createErrorResponse("UNAUTHORIZED", "Authentication required", 401);
	}
	return null;
}

// GET /api/admin/projects/[id] - Get a specific project with MDX content
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	// Check authentication
	const authError = requireAuth(request);
	if (authError) return authError;

	try {
		// Get basic project information
		const project = await db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				contentStorageType: projects.contentStorageType,
				githubUrl: projects.githubUrl,
				liveUrl: projects.liveUrl,
				imageUrl: projects.imageUrl,
				technologies: projects.technologies,
				status: projects.status,
				featured: projects.featured,
				publishedAt: projects.publishedAt,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
			})
			.from(projects)
			.where(eq(projects.id, params.id))
			.limit(1);

		if (!project[0]) {
			return createErrorResponse("NOT_FOUND", "Project not found", 404);
		}

		// Get MDX content using content storage service
		const storageService = ContentStorageFactory.createForRecord(project[0]);
		const mdxContent = await storageService.getContent(params.id, 'project');

		// Get tags for the project
		const projectTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(projectTags)
			.innerJoin(tags, eq(projectTags.tagId, tags.id))
			.where(eq(projectTags.projectId, params.id));

		const projectWithContent = {
			...project[0],
			mdxContent,
			tags: projectTagsResult,
		};

		return createSuccessResponse(projectWithContent);
	} catch (error) {
		console.error("Error fetching admin project:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch project", 500);
	}
}

// PUT /api/admin/projects/[id] - Update a specific project
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

		const validatedData = updateAdminProjectSchema.parse(body);

		// Check if project exists
		const currentProject = await db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				contentStorageType: projects.contentStorageType,
				status: projects.status,
			})
			.from(projects)
			.where(eq(projects.id, params.id))
			.limit(1);

		if (!currentProject[0]) {
			return createErrorResponse("NOT_FOUND", "Project not found", 404);
		}

		const now = getCurrentTimestamp();
		let updateData: any = {
			updatedAt: now,
		};

		// Handle title update and slug generation
		if (validatedData.title && validatedData.title !== currentProject[0].title) {
			const newSlug = generateSlug(validatedData.title);
			
			// Check if new slug conflicts with existing projects (excluding current project)
			const existingProject = await db
				.select({ id: projects.id })
				.from(projects)
				.where(eq(projects.slug, newSlug))
				.limit(1);

			if (existingProject.length > 0 && existingProject[0].id !== params.id) {
				return createErrorResponse(
					"CONFLICT",
					"A project with this title already exists",
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
			if (validatedData.status === "published" && currentProject[0].status !== "published") {
				updateData.publishedAt = now;
			}
			// Clear publishedAt when unpublishing
			else if (validatedData.status !== "published" && currentProject[0].status === "published") {
				updateData.publishedAt = null;
			}
		}

		// Handle project-specific fields
		if (validatedData.githubUrl !== undefined) {
			updateData.githubUrl = validatedData.githubUrl || null;
		}
		if (validatedData.liveUrl !== undefined) {
			updateData.liveUrl = validatedData.liveUrl || null;
		}
		if (validatedData.imageUrl !== undefined) {
			updateData.imageUrl = validatedData.imageUrl || null;
		}
		if (validatedData.technologies !== undefined) {
			updateData.technologies = validatedData.technologies || null;
		}
		if (validatedData.featured !== undefined) {
			updateData.featured = validatedData.featured;
		}

		// Handle MDX content update
		if (validatedData.mdxContent) {
			// Update content using storage service
			const storageService = ContentStorageFactory.createForRecord(currentProject[0]);
			await storageService.saveContent(params.id, validatedData.mdxContent, 'project');
		}

		// Update project record
		await db.update(projects)
			.set(updateData)
			.where(eq(projects.id, params.id));

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
			await db.delete(projectTags).where(eq(projectTags.projectId, params.id));

			// Add new tag relations
			if (validatedData.tagIds.length > 0) {
				const tagRelations = validatedData.tagIds.map((tagId) => ({
					projectId: params.id,
					tagId,
				}));

				await db.insert(projectTags).values(tagRelations);
			}
		}

		// Fetch updated project with relations
		const updatedProject = await db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				contentStorageType: projects.contentStorageType,
				githubUrl: projects.githubUrl,
				liveUrl: projects.liveUrl,
				imageUrl: projects.imageUrl,
				technologies: projects.technologies,
				status: projects.status,
				featured: projects.featured,
				publishedAt: projects.publishedAt,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
			})
			.from(projects)
			.where(eq(projects.id, params.id))
			.limit(1);

		// Get tags for the updated project
		const projectTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(projectTags)
			.innerJoin(tags, eq(projectTags.tagId, tags.id))
			.where(eq(projectTags.projectId, params.id));

		const projectWithTags = {
			...updatedProject[0],
			tags: projectTagsResult,
		};

		return createSuccessResponse(projectWithTags, "Project updated successfully");
	} catch (error) {
		console.error("Error updating project:", error);

		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		// Handle specific database errors
		if (error && typeof error === "object" && "code" in error) {
			if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
				return createErrorResponse(
					"FOREIGN_KEY_ERROR",
					"Referenced tag does not exist",
					400,
				);
			}

			if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
				return createErrorResponse(
					"CONFLICT",
					"A project with this title already exists",
					409,
				);
			}
		}

		return createErrorResponse("INTERNAL_ERROR", "Failed to update project", 500);
	}
}

// DELETE /api/admin/projects/[id] - Delete a specific project
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	// Check authentication
	const authError = requireAuth(request);
	if (authError) return authError;

	try {
		// Check if project exists
		const existingProject = await db
			.select({
				id: projects.id,
				title: projects.title,
				contentStorageType: projects.contentStorageType,
			})
			.from(projects)
			.where(eq(projects.id, params.id))
			.limit(1);

		if (!existingProject[0]) {
			return createErrorResponse("NOT_FOUND", "Project not found", 404);
		}

		// Clean up content storage
		const storageService = ContentStorageFactory.createForRecord(existingProject[0]);
		await storageService.deleteContent(params.id, 'project');

		// Delete project (this will cascade delete related records due to foreign key constraints)
		await db.delete(projects).where(eq(projects.id, params.id));

		return createSuccessResponse(
			{ id: params.id, title: existingProject[0].title },
			"Project deleted successfully"
		);
	} catch (error) {
		console.error("Error deleting project:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to delete project", 500);
	}
}