"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ExternalLink, Github, Star } from "lucide-react";

interface RelatedProject {
	id: string;
	title: string;
	slug: string;
	githubUrl?: string;
	liveUrl?: string;
	imageUrl?: string;
	technologies: string[];
	featured: boolean;
	publishedAt: string;
}

interface RelatedProjectsProps {
	currentProjectId: string;
	tags?: Array<{ id: string; name: string; slug: string }>;
	limit?: number;
}

export function RelatedProjects({
	currentProjectId,
	tags = [],
	limit = 3,
}: RelatedProjectsProps) {
	const [relatedProjects, setRelatedProjects] = useState<RelatedProject[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchRelatedProjects() {
			try {
				let projects: RelatedProject[] = [];

				// Try to find projects with same tags first
				if (tags.length > 0) {
					const tagId = tags[0].id; // Use first tag
					const tagResponse = await fetch(
						`/api/projects?tagId=${tagId}&limit=${limit + 1}`,
					);
					if (tagResponse.ok) {
						const tagData = await tagResponse.json();
						projects = tagData.data.projects.filter(
							(project: RelatedProject) => project.id !== currentProjectId,
						);
					}
				}

				// If we don't have enough projects, get recent projects
				if (projects.length < limit) {
					const recentResponse = await fetch(
						`/api/projects?limit=${limit + 1}&sortBy=publishedAt`,
					);
					if (recentResponse.ok) {
						const recentData = await recentResponse.json();
						const recentProjects = recentData.data.projects.filter(
							(project: RelatedProject) =>
								project.id !== currentProjectId &&
								!projects.some((p) => p.id === project.id),
						);
						projects = [...projects, ...recentProjects];
					}
				}

				setRelatedProjects(projects.slice(0, limit));
			} catch (error) {
				console.error("Error fetching related projects:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchRelatedProjects();
	}, [currentProjectId, tags, limit]);

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow-sm p-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Related Projects
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{Array.from({ length: 3 }, () => crypto.randomUUID()).map((key) => (
						<div key={key} className="animate-pulse">
							<div className="h-32 bg-gray-200 rounded mb-4"></div>
							<div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
							<div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-2/3"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (relatedProjects.length === 0) {
		return null;
	}

	return (
		<div className="bg-white rounded-lg shadow-sm p-8">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Related Projects
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{relatedProjects.map((project) => (
					<article key={project.id} className="group">
						<Link href={`/projects/${project.slug}`} className="block">
							{/* Project Image */}
							<div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
								{project.imageUrl ? (
									<img
										src={project.imageUrl}
										alt={project.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-gray-400">
										<ExternalLink className="w-8 h-8" />
									</div>
								)}

								{/* Featured Badge */}
								{project.featured && (
									<div className="absolute top-2 left-2">
										<div className="flex items-center px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-full">
											<Star className="w-3 h-3 mr-1" />
											Featured
										</div>
									</div>
								)}

								{/* Project Links */}
								<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{project.githubUrl && (
										<a
											href={project.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
											onClick={(e) => e.stopPropagation()}
										>
											<Github className="w-3 h-3 text-gray-700" />
										</a>
									)}
									{project.liveUrl && (
										<a
											href={project.liveUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
											onClick={(e) => e.stopPropagation()}
										>
											<ExternalLink className="w-3 h-3 text-gray-700" />
										</a>
									)}
								</div>
							</div>

							{/* Title */}
							<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
								{project.title}
							</h3>

							{/* Technologies */}
							{project.technologies && project.technologies.length > 0 && (
								<div className="flex flex-wrap gap-1 mb-3">
									{project.technologies.slice(0, 3).map((tech, index) => (
										<span
											key={index}
											className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
										>
											{tech}
										</span>
									))}
									{project.technologies.length > 3 && (
										<span className="text-xs text-gray-500">
											+{project.technologies.length - 3}
										</span>
									)}
								</div>
							)}

							{/* Meta */}
							<div className="flex items-center text-xs text-gray-500">
								<Calendar className="w-3 h-3 mr-1" />
								{new Date(project.publishedAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
								})}
							</div>
						</Link>
					</article>
				))}
			</div>

			{/* View All Projects Link */}
			<div className="text-center mt-8">
				<Link
					href="/projects"
					className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
				>
					View All Projects
				</Link>
			</div>
		</div>
	);
}
