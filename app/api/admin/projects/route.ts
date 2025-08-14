import { and, count, desc, eq, like, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { projects, projectTags, tags } from "@/lib/schema";
import { isAuthenticatedFromRequest } from "@/lib/auth";
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

// Admin-specific project validation schemas
const createAdminProjectSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	mdxContent: z.string().min(1, "MDX content is required"),
	githubUrl: z.string().url("Invalid GitHub URL").optional(),
	liveUrl: z.string().url("Invalid live URL").optional(),
	imageUrl: z.string().url("Invalid image URL").optional(),
	technologies: z.array(z.string()).optional(),
	featured: z.boolean().default(false),
	status: z.enum(["draft", "published", "archived"]).default("draft"),
	tagIds: z.array(z.string()).optional(),
});

const updateAdminProjectSchema = createAdminProjectSchema.partial().extend({
	id: z.string().min(1, "ID is required"),
});

const adminProjectQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.enum(["draft", "published", "archived"]).optional(),
	featured: z.coerce.boolean().optional(),
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

// GET /api/admin/projects - Get projects with admin privileges (includes drafts)
export async function GET(request: NextRequest) {
	// Check authentication
	const authError = requireAuth(request);
	if (authError) return authError;

	try {
		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());

		const validatedQuery = adminProjectQuerySchema.parse(queryParams);
		const { page, limit, status, featured, tagId, search } = validatedQuery;

		// Build where conditions
		const conditions = [];

		if (status) {
			conditions.push(eq(projects.status, status));
		}

		if (featured !== undefined) {
			conditions.push(eq(projects.featured, featured));
		}

		if (search) {
			conditions.push(
				or(
					like(projects.title, `%${search}%`),
				),
			);
		}

		// Handle tag filtering
		if (tagId) {
			const taggedProjectIds = await db
				.select({ projectId: projectTags.projectId })
				.from(projectTags)
				.where(eq(projectTags.tagId, tagId));
			
			if (taggedProjectIds.length > 0) {
				conditions.push(
					or(...taggedProjectIds.map(({ projectId }) => eq(projects.id, projectId)))
				);
			} else {
				// No projects with this tag, return empty result
				return createSuccessResponse({
					projects: [],
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

		// Get projects
		const baseQuery = db
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
			.from(projects);

		const projectsResult = await (conditions.length > 0 
			? baseQuery.where(and(...conditions))
			: baseQuery)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(projects.updatedAt));

		// Get tags for each project
		const projectsWithTags = await Promise.all(
			projectsResult.map(async (project) => {
				const projectTagsResult = await db
					.select({
						id: tags.id,
						name: tags.name,
						slug: tags.slug,
					})
					.from(projectTags)
					.innerJoin(tags, eq(projectTags.tagId, tags.id))
					.where(eq(projectTags.projectId, project.id));

				return {
					...project,
					tags: projectTagsResult,
				};
			}),
		);

		// Get total count for pagination
		const [{ count: totalCount }] = await (conditions.length > 0 
			? db.select({ count: count() }).from(projects).where(and(...conditions))
			: db.select({ count: count() }).from(projects));
		const totalPages = Math.ceil(totalCount / limit);

		return createSuccessResponse({
			projects: projectsWithTags,
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

		console.error("Error fetching admin projects:", error);
		return createErrorResponse("INTERNAL_ERROR", "Failed to fetch projects", 500);
	}
}

// POST /api/admin/projects - Create a new project
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

		const validatedData = createAdminProjectSchema.parse(body);

		const projectId = generateId();
		const slug = generateSlug(validatedData.title);
		const now = getCurrentTimestamp();

		// Check if slug already exists
		const existingProject = await db
			.select({ id: projects.id })
			.from(projects)
			.where(eq(projects.slug, slug))
			.limit(1);

		if (existingProject.length > 0) {
			return createErrorResponse(
				"CONFLICT",
				"A project with this title already exists",
				409,
			);
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

		// Process MDX content (projects don't need reading time/word count like posts)
		const metadata = mdxProcessor.extractMetadata(validatedData.mdxContent);

		// Create the project record
		const newProject = {
			id: projectId,
			title: validatedData.title,
			slug,
			contentStorageType: "database" as const,
			mdxContent: validatedData.mdxContent,
			githubUrl: validatedData.githubUrl || null,
			liveUrl: validatedData.liveUrl || null,
			imageUrl: validatedData.imageUrl || null,
			technologies: validatedData.technologies || null,
			status: validatedData.status,
			featured: validatedData.featured,
			publishedAt: validatedData.status === "published" ? now : null,
			createdAt: now,
			updatedAt: now,
		};

		await db.insert(projects).values(newProject);

		// Handle tags if provided
		if (validatedData.tagIds && validatedData.tagIds.length > 0) {
			const tagRelations = validatedData.tagIds.map((tagId) => ({
				projectId,
				tagId,
			}));

			await db.insert(projectTags).values(tagRelations);
		}

		// Fetch the created project with relations
		const createdProject = await db
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
			.where(eq(projects.id, projectId))
			.limit(1);

		if (createdProject.length === 0) {
			return createErrorResponse(
				"INTERNAL_ERROR",
				"Failed to retrieve created project",
				500,
			);
		}

		// Get tags for the created project
		const projectTagsResult = await db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug,
			})
			.from(projectTags)
			.innerJoin(tags, eq(projectTags.tagId, tags.id))
			.where(eq(projectTags.projectId, projectId));

		const projectWithTags = {
			...createdProject[0],
			tags: projectTagsResult,
		};

		return createSuccessResponse(
			projectWithTags,
			"Project created successfully",
			201,
		);
	} catch (error) {
		console.error("Error creating project:", error);

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

		return createErrorResponse("INTERNAL_ERROR", "Failed to create project", 500);
	}
}