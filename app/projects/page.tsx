import { Suspense } from "react";
import { Metadata } from "next";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { ProjectsFilters } from "@/components/projects/ProjectsFilters";
import { SearchBar } from "@/components/blog/SearchBar";

export const metadata: Metadata = {
	title: "Projects | Bibibai",
	description:
		"Explore my portfolio of web development projects and technical experiments",
	openGraph: {
		title: "Projects | Bibibai",
		description:
			"Explore my portfolio of web development projects and technical experiments",
	},
};

interface ProjectsPageProps {
	searchParams: {
		page?: string;
		tag?: string;
		search?: string;
		featured?: string;
		sort?: string;
	};
}

export default async function ProjectsPage({
	searchParams,
}: ProjectsPageProps) {
	const resolvedSearchParams = await searchParams;
	const currentPage = Number(resolvedSearchParams.page) || 1;
	const tagFilter = resolvedSearchParams.tag;
	const searchQuery = resolvedSearchParams.search;
	const featuredOnly = resolvedSearchParams.featured === "true";
	const sortBy = resolvedSearchParams.sort || "publishedAt";

	return (
		<div className="min-h-screen bg-[#D9D5D2]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Projects
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						A showcase of my web development projects and technical experiments
					</p>
				</div>

				{/* Search and Filters */}
				<div className="mb-8 space-y-6">
					<SearchBar initialValue={searchQuery} />
					<Suspense
						fallback={
							<div className="h-12 bg-gray-200 animate-pulse rounded-lg" />
						}
					>
						<ProjectsFilters
							selectedTag={tagFilter}
							featuredOnly={featuredOnly}
							sortBy={sortBy}
						/>
					</Suspense>
				</div>

				{/* Projects Grid */}
				<Suspense
					fallback={
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 6 }, () => crypto.randomUUID()).map(
								(key) => (
									<div
										key={key}
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
								),
							)}
						</div>
					}
				>
					<ProjectsList
						page={currentPage}
						tagId={tagFilter}
						search={searchQuery}
						featured={featuredOnly}
						sortBy={sortBy}
					/>
				</Suspense>
			</div>
		</div>
	);
}
