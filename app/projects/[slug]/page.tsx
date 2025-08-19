import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
	ArrowLeft,
	Calendar,
	ExternalLink,
	Github,
	Tag,
	Star,
} from "lucide-react";
import { MDXRenderer } from "@/components/mdx";
import { RelatedProjects } from "@/components/projects/RelatedProjects";

interface ProjectPageProps {
	params: {
		slug: string;
	};
}

// Fetch project data
async function getProject(slug: string) {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/projects/${slug}?public=true`,
			{
				cache: "no-store", // For development, use revalidate in production
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.data;
	} catch (error) {
		console.error("Error fetching project:", error);
		return null;
	}
}

// Generate metadata
export async function generateMetadata({
	params,
}: ProjectPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const project = await getProject(resolvedParams.slug);

	if (!project) {
		return {
			title: "Project Not Found",
		};
	}

	return {
		title: `${project.title} | Projects`,
		description: `Learn about ${project.title} - a web development project showcasing modern technologies and best practices.`,
		openGraph: {
			title: project.title,
			description: `Learn about ${project.title} - a web development project showcasing modern technologies and best practices.`,
			type: "article",
			publishedTime: project.publishedAt,
			modifiedTime: project.updatedAt,
			images: project.imageUrl ? [{ url: project.imageUrl }] : [],
		},
		twitter: {
			card: "summary_large_image",
			title: project.title,
			description: `Learn about ${project.title} - a web development project.`,
			images: project.imageUrl ? [project.imageUrl] : [],
		},
	};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
	const resolvedParams = await params;
	const project = await getProject(resolvedParams.slug);

	if (!project) {
		notFound();
	}

	const publishedDate = new Date(project.publishedAt).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	return (
		<div className="min-h-screen bg-[#F6F4F1]">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Back to Projects */}
				<Link
					href="/projects"
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Projects
				</Link>

				{/* Project Header */}
				<article className="bg-white rounded-lg shadow-sm overflow-hidden">
					{/* Project Image */}
					{project.imageUrl && (
						<div className="aspect-video bg-gray-100">
							<img
								src={project.imageUrl}
								alt={project.title}
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					<div className="p-8 md:p-12">
						{/* Featured Badge */}
						{project.featured && (
							<div className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-full mb-4">
								<Star className="w-3 h-3 mr-1" />
								Featured Project
							</div>
						)}

						{/* Title */}
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
							{project.title}
						</h1>

						{/* Meta Information */}
						<div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
							<div className="flex items-center">
								<Calendar className="w-4 h-4 mr-2" />
								{publishedDate}
							</div>

							{/* Project Links */}
							<div className="flex items-center gap-4">
								{project.githubUrl && (
									<a
										href={project.githubUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
									>
										<Github className="w-4 h-4 mr-1" />
										Code
									</a>
								)}
								{project.liveUrl && (
									<a
										href={project.liveUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
									>
										<ExternalLink className="w-4 h-4 mr-1" />
										Live Demo
									</a>
								)}
							</div>
						</div>

						{/* Technologies */}
						{project.technologies && project.technologies.length > 0 && (
							<div className="mb-8">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">
									Technologies Used
								</h3>
								<div className="flex flex-wrap gap-2">
									{project.technologies.map((tech: string, index: number) => (
										<span
											key={index}
											className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Tags */}
						{project.tags && project.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-8">
								{project.tags.map((tag: any) => (
									<Link
										key={tag.id}
										href={`/projects?tag=${tag.id}`}
										className="inline-flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
									>
										<Tag className="w-3 h-3 mr-1" />
										{tag.name}
									</Link>
								))}
							</div>
						)}

						{/* Content */}
						{project.mdxSource ? (
							<div className="prose prose-lg prose-gray max-w-none">
								<MDXRenderer mdxSource={project.mdxSource} />
							</div>
						) : (
							<div className="prose prose-lg prose-gray max-w-none">
								<p className="text-gray-600">
									Project description not available.
								</p>
							</div>
						)}
					</div>
				</article>

				{/* Related Projects */}
				<div className="mt-12">
					<RelatedProjects currentProjectId={project.id} tags={project.tags} />
				</div>
			</div>
		</div>
	);
}
