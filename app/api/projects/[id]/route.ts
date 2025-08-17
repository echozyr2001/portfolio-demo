import { and, eq, ne } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { projects, projectTags, tags } from "@/lib/schema";
import {
	createErrorResponse,
	createSuccessResponse,
	generateSlug,
	getCurrentTimestamp,
	handleValidationError,
} from "@/lib/utils";
import { idParamSchema, updateProjectSchema } from "@/lib/validations";
import { mdxProcessor } from "@/lib/mdx-processor";

// GET /api/projects/[id] - Get a single project by ID or slug
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);
		const { searchParams } = new URL(request.url);
		const isPublicAccess = searchParams.get("public") === "true";

		// Determine if the parameter is an ID (UUID format) or a slug
		const isUUID =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				id,
			);

		// Build where condition based on parameter type
		let whereCondition;
		if (isUUID) {
			whereCondition = eq(projects.id, id);
		} else {
			// It's a slug
			whereCondition = eq(projects.slug, id);
		}

		// For public access, only show published projects
		if (isPublicAccess) {
			whereCondition = and(whereCondition, eq(projects.status, "published"));
		}

		// Get project
		const projectResult = await db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				mdxContent: projects.mdxContent,
				contentStorageType: projects.contentStorageType,
				s3Bucket: projects.s3Bucket,
				s3Key: projects.s3Key,
				s3Url: projects.s3Url,
				githubUrl: projects.githubUrl,
				liveUrl: projects.liveUrl,
				imageUrl: projects.imageUrl,
				technologies: projects.technologies,
				featured: projects.featured,
				status: projects.status,
				publishedAt: projects.publishedAt,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
			})
			.from(projects)
			.where(whereCondition)
			.limit(1);

		if (projectResult.length === 0) {
			return createErrorResponse("NOT_FOUND", "Project not found", 404);
		}

		const project = projectResult[0];

		// Get MDX content and process it for public access
		let mdxSource = null;
		if (isPublicAccess && project.mdxContent) {
			try {
				// Get MDX content based on storage type
				let mdxContent = "";
				if (project.contentStorageType === "database") {
					mdxContent = project.mdxContent || "";
				} else if (project.contentStorageType === "s3") {
					// TODO: Implement S3 content retrieval when S3 storage is implemented
					// For now, fallback to database content
					mdxContent = project.mdxContent || "";
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

		// Get tags for the project
		const projectTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(projectTags)
			.innerJoin(tags, eq(projectTags.tagId, tags.id))
			.where(eq(projectTags.projectId, project.id));

		// Prepare response based on access type
		let projectResponse;
		if (isPublicAccess) {
			// Public API - return only necessary fields and processed MDX
			projectResponse = {
				id: project.id,
				title: project.title,
				slug: project.slug,
				githubUrl: project.githubUrl,
				liveUrl: project.liveUrl,
				imageUrl: project.imageUrl,
				technologies: project.technologies,
				featured: project.featured,
				publishedAt: project.publishedAt,
				tags: projectTagsResult,
				mdxSource, // Processed MDX for rendering
			};
		} else {
			// Admin API - return all fields including raw content
			projectResponse = {
				...project,
				tags: projectTagsResult,
			};
		}

		return createSuccessResponse(projectResponse);
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error fetching project:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to fetch project",
			500,
		);
	}
}

// PUT /api/projects/[id] - Update a project (Admin only)
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);
		const body = await request.json();
		const validatedData = updateProjectSchema.parse(body);

		// Check if project exists
		const existingProject = await db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				status: projects.status,
				publishedAt: projects.publishedAt,
			})
			.from(projects)
			.where(eq(projects.id, id))
			.limit(1);

		if (existingProject.length === 0) {
			return createErrorResponse("NOT_FOUND", "Project not found", 404);
		}

		const currentProject = existingProject[0];
		const now = getCurrentTimestamp();

		// Prepare update data
		const updateData: any = {
			updatedAt: now,
		};

		// Handle title and slug update
		if (validatedData.title && validatedData.title !== currentProject.title) {
			const newSlug = generateSlug(validatedData.title);

			// Check if new slug conflicts with other projects
			if (newSlug !== currentProject.slug) {
				const slugConflict = await db
					.select({ id: projects.id })
					.from(projects)
					.where(
						and(
							eq(projects.slug, newSlug),
							ne(projects.id, id), // Exclude current project
						),
					)
					.limit(1);

				if (slugConflict.length > 0) {
					return createErrorResponse(
						"CONFLICT",
						"A project with this title already exists",
						409,
					);
				}

				updateData.slug = newSlug;
			}

			updateData.title = validatedData.title;
		}

		// Handle other fields
		if (validatedData.mdxContent !== undefined) {
			updateData.mdxContent = validatedData.mdxContent;
		}

		if (validatedData.githubUrl !== undefined) {
			updateData.githubUrl = validatedData.githubUrl;
		}

		if (validatedData.liveUrl !== undefined) {
			updateData.liveUrl = validatedData.liveUrl;
		}

		if (validatedData.imageUrl !== undefined) {
			updateData.imageUrl = validatedData.imageUrl;
		}

		if (validatedData.technologies !== undefined) {
			updateData.technologies = validatedData.technologies;
		}

		if (validatedData.featured !== undefined) {
			updateData.featured = validatedData.featured;
		}

		if (validatedData.status !== undefined) {
			updateData.status = validatedData.status;

			// Handle publishedAt when status changes to published
			if (validatedData.status === "published" && !currentProject.publishedAt) {
				updateData.publishedAt = now;
			} else if (validatedData.status !== "published") {
				updateData.publishedAt = null;
			}
		}

		// Update the project
		await db.update(projects).set(updateData).where(eq(projects.id, id));

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
			await db.delete(projectTags).where(eq(projectTags.projectId, id));

			// Add new tag relations
			if (validatedData.tagIds.length > 0) {
				const tagRelations = validatedData.tagIds.map((tagId) => ({
					projectId: id,
					tagId,
				}));

				await db.insert(projectTags).values(tagRelations);
			}
		}

		// Fetch the updated project with relations
		const updatedProject = await db
			.select()
			.from(projects)
			.where(eq(projects.id, id))
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
			.where(eq(projectTags.projectId, id));

		const projectWithTags = {
			...updatedProject[0],
			tags: projectTagsResult,
		};

		return createSuccessResponse(
			projectWithTags,
			"Project updated successfully",
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error updating project:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to update project",
			500,
		);
	}
}

// DELETE /api/projects/[id] - Delete a project (Admin only)
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = idParamSchema.parse(await params);

		// Check if project exists
		const existingProject = await db
			.select({ id: projects.id })
			.from(projects)
			.where(eq(projects.id, id))
			.limit(1);

		if (existingProject.length === 0) {
			return createErrorResponse("NOT_FOUND", "Project not found", 404);
		}

		// Delete project tags relations
		await db.delete(projectTags).where(eq(projectTags.projectId, id));

		// Delete the project
		await db.delete(projects).where(eq(projects.id, id));

		return createSuccessResponse(null, "Project deleted successfully");
	} catch (error) {
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		console.error("Error deleting project:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to delete project",
			500,
		);
	}
}
