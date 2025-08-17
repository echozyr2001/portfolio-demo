import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { projects, projectTags, tags } from "@/lib/schema";
import {
	createErrorResponse,
	createSuccessResponse,
	handleValidationError,
} from "@/lib/utils";
import { publicProjectQuerySchema } from "@/lib/validations";

// GET /api/projects - Get published projects with filtering and pagination (Public API)
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());

		const validatedQuery = publicProjectQuerySchema.parse(queryParams);
		const { page, limit, featured, tagId, search, sortBy, sortOrder } =
			validatedQuery;

		// Build where conditions - Only show published projects for public API
		const conditions = [eq(projects.status, "published")];

		if (featured !== undefined) {
			conditions.push(eq(projects.featured, featured));
		}

		if (tagId) {
			// Join with projectTags to filter by tag
			const projectsWithTag = await db
				.select({ projectId: projectTags.projectId })
				.from(projectTags)
				.where(eq(projectTags.tagId, tagId));

			const projectIds = projectsWithTag.map((pt) => pt.projectId);
			if (projectIds.length === 0) {
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
			// For now, we'll handle this with a subquery approach
		}

		if (search) {
			conditions.push(
				or(
					like(projects.title, `%${search}%`),
					like(projects.mdxContent, `%${search}%`),
				),
			);
		}

		// Calculate offset
		const offset = (page - 1) * limit;

		// Determine sort order
		const sortColumn =
			sortBy === "publishedAt"
				? projects.publishedAt
				: sortBy === "title"
					? projects.title
					: projects.featured;
		const orderFn = sortOrder === "asc" ? asc : desc;

		// Get projects
		let query = db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				githubUrl: projects.githubUrl,
				liveUrl: projects.liveUrl,
				imageUrl: projects.imageUrl,
				technologies: projects.technologies,
				featured: projects.featured,
				publishedAt: projects.publishedAt,
			})
			.from(projects)
			.where(and(...conditions))
			.limit(limit)
			.offset(offset)
			.orderBy(orderFn(sortColumn));

		// If filtering by tag, we need to join with projectTags
		if (tagId) {
			query = db
				.select({
					id: projects.id,
					title: projects.title,
					slug: projects.slug,
					githubUrl: projects.githubUrl,
					liveUrl: projects.liveUrl,
					imageUrl: projects.imageUrl,
					technologies: projects.technologies,
					featured: projects.featured,
					publishedAt: projects.publishedAt,
				})
				.from(projects)
				.innerJoin(projectTags, eq(projects.id, projectTags.projectId))
				.where(and(...conditions, eq(projectTags.tagId, tagId)))
				.limit(limit)
				.offset(offset)
				.orderBy(orderFn(sortColumn));
		}

		const projectsResult = await query;

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

		// Get total count for pagination (only published projects)
		let totalCountQuery = db
			.select({ count: count() })
			.from(projects)
			.where(and(...conditions));

		if (tagId) {
			totalCountQuery = db
				.select({ count: count() })
				.from(projects)
				.innerJoin(projectTags, eq(projects.id, projectTags.projectId))
				.where(and(...conditions, eq(projectTags.tagId, tagId)));
		}

		const [{ count: totalCount }] = await totalCountQuery;
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

		console.error("Error fetching projects:", error);
		return createErrorResponse(
			"INTERNAL_ERROR",
			"Failed to fetch projects",
			500,
		);
	}
}
