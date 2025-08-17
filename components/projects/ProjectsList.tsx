"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	Calendar,
	ExternalLink,
	Github,
	Star,
	Tag,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

interface Project {
	id: string;
	title: string;
	slug: string;
	githubUrl?: string;
	liveUrl?: string;
	imageUrl?: string;
	technologies: string[];
	featured: boolean;
	publishedAt: string;
	tags: Array<{
		id: string;
		name: string;
		slug: string;
	}>;
}

interface ProjectsListProps {
	page: number;
	tagId?: string;
	search?: string;
	featured?: boolean;
	sortBy?: string;
}

interface ApiResponse {
	projects: Project[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export function ProjectsList({
	page,
	tagId,
	search,
	featured,
	sortBy = "publishedAt",
}: ProjectsListProps) {
	const [data, setData] = useState<ApiResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProjects() {
			setLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams();
				params.set("page", page.toString());
				params.set("limit", "12");
				params.set("sortBy", sortBy);
				params.set("sortOrder", "desc");

				if (tagId) params.set("tagId", tagId);
				if (search) params.set("search", search);
				if (featured) params.set("featured", "true");

				const response = await fetch(`/api/projects?${params.toString()}`);

				if (!response.ok) {
					throw new Error("Failed to fetch projects");
				}

				const result = await response.json();
				setData(result.data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchProjects();
	}, [page, tagId, search, featured, sortBy]);

	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[...Array(6)].map((_, i) => (
					<div
						key={i}
						className="bg-white rounded-lg overflow-hidden shadow-sm"
					>
						<div className="animate-pulse">
							<div className="h-48 bg-gray-200"></div>
							<div className="p-6">
								<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
								<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-2/3"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600 mb-4">Error loading projects: {error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	if (!data || data.projects.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600 text-lg">No projects found.</p>
				<Link
					href="/projects"
					className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					View All Projects
				</Link>
			</div>
		);
	}

	const { projects, pagination } = data;

	return (
		<div>
			{/* Projects Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
				{projects.map((project) => (
					<article
						key={project.id}
						className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
					>
						{/* Project Image */}
						<div className="aspect-video bg-gray-100 relative overflow-hidden">
							{project.imageUrl ? (
								<img
									src={project.imageUrl}
									alt={project.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400">
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
											<ExternalLink className="w-8 h-8" />
										</div>
										<p className="text-sm">No preview</p>
									</div>
								</div>
							)}

							{/* Featured Badge */}
							{project.featured && (
								<div className="absolute top-3 left-3">
									<div className="flex items-center px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-full">
										<Star className="w-3 h-3 mr-1" />
										Featured
									</div>
								</div>
							)}

							{/* Project Links Overlay */}
							<div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								{project.githubUrl && (
									<a
										href={project.githubUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
										onClick={(e) => e.stopPropagation()}
									>
										<Github className="w-4 h-4 text-gray-700" />
									</a>
								)}
								{project.liveUrl && (
									<a
										href={project.liveUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
										onClick={(e) => e.stopPropagation()}
									>
										<ExternalLink className="w-4 h-4 text-gray-700" />
									</a>
								)}
							</div>
						</div>

						{/* Project Content */}
						<div className="p-6">
							{/* Title */}
							<h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
								<Link href={`/projects/${project.slug}`}>{project.title}</Link>
							</h2>

							{/* Technologies */}
							{project.technologies && project.technologies.length > 0 && (
								<div className="flex flex-wrap gap-1 mb-4">
									{project.technologies.slice(0, 3).map((tech, index) => (
										<span
											key={index}
											className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
										>
											{tech}
										</span>
									))}
									{project.technologies.length > 3 && (
										<span className="px-2 py-1 text-xs text-gray-500">
											+{project.technologies.length - 3}
										</span>
									)}
								</div>
							)}

							{/* Meta Information */}
							<div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
								<div className="flex items-center">
									<Calendar className="w-4 h-4 mr-1" />
									{new Date(project.publishedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
									})}
								</div>
							</div>

							{/* Tags */}
							{project.tags && project.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{project.tags.slice(0, 2).map((tag) => (
										<Link
											key={tag.id}
											href={`/projects?tag=${tag.id}`}
											className="inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
											onClick={(e) => e.stopPropagation()}
										>
											<Tag className="w-3 h-3 mr-1" />
											{tag.name}
										</Link>
									))}
									{project.tags.length > 2 && (
										<span className="text-xs text-gray-500">
											+{project.tags.length - 2} more
										</span>
									)}
								</div>
							)}
						</div>
					</article>
				))}
			</div>

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					{pagination.hasPrev && (
						<Link
							href={`/projects?page=${pagination.page - 1}${tagId ? `&tag=${tagId}` : ""}${search ? `&search=${search}` : ""}${featured ? `&featured=true` : ""}${sortBy !== "publishedAt" ? `&sort=${sortBy}` : ""}`}
							className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<ChevronLeft className="w-4 h-4 mr-1" />
							Previous
						</Link>
					)}

					<div className="flex items-center gap-1">
						{[...Array(pagination.totalPages)].map((_, i) => {
							const pageNum = i + 1;
							const isCurrentPage = pageNum === pagination.page;

							// Show first page, last page, current page, and pages around current
							const showPage =
								pageNum === 1 ||
								pageNum === pagination.totalPages ||
								Math.abs(pageNum - pagination.page) <= 1;

							if (!showPage) {
								// Show ellipsis
								if (pageNum === 2 && pagination.page > 4) {
									return (
										<span key={pageNum} className="px-2 text-gray-500">
											...
										</span>
									);
								}
								if (
									pageNum === pagination.totalPages - 1 &&
									pagination.page < pagination.totalPages - 3
								) {
									return (
										<span key={pageNum} className="px-2 text-gray-500">
											...
										</span>
									);
								}
								return null;
							}

							return (
								<Link
									key={pageNum}
									href={`/projects?page=${pageNum}${tagId ? `&tag=${tagId}` : ""}${search ? `&search=${search}` : ""}${featured ? `&featured=true` : ""}${sortBy !== "publishedAt" ? `&sort=${sortBy}` : ""}`}
									className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
										isCurrentPage
											? "bg-blue-600 text-white"
											: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
									}`}
								>
									{pageNum}
								</Link>
							);
						})}
					</div>

					{pagination.hasNext && (
						<Link
							href={`/projects?page=${pagination.page + 1}${tagId ? `&tag=${tagId}` : ""}${search ? `&search=${search}` : ""}${featured ? `&featured=true` : ""}${sortBy !== "publishedAt" ? `&sort=${sortBy}` : ""}`}
							className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Next
							<ChevronRight className="w-4 h-4 ml-1" />
						</Link>
					)}
				</div>
			)}

			{/* Results Info */}
			<div className="text-center mt-6 text-sm text-gray-600">
				Showing {projects.length} of {pagination.totalCount} projects
			</div>
		</div>
	);
}
