import { Suspense } from "react";
import { Metadata } from "next";
import { BlogPostsList } from "@/components/blog/BlogPostsList";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { SearchBar } from "@/components/blog/SearchBar";

export const metadata: Metadata = {
	title: "Blog | Bibibai",
	description:
		"Explore my thoughts on web development, programming, and technology",
	openGraph: {
		title: "Blog | Bibibai",
		description:
			"Explore my thoughts on web development, programming, and technology",
	},
};

interface BlogPageProps {
	searchParams: {
		page?: string;
		category?: string;
		tag?: string;
		search?: string;
	};
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
	const resolvedSearchParams = await searchParams;
	const currentPage = Number(resolvedSearchParams.page) || 1;
	const categoryFilter = resolvedSearchParams.category;
	const tagFilter = resolvedSearchParams.tag;
	const searchQuery = resolvedSearchParams.search;

	return (
		<div className="min-h-screen bg-[#D9D5D2]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Blog
					</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Thoughts on web development, programming, and technology
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
						<BlogFilters
							selectedCategory={categoryFilter}
							selectedTag={tagFilter}
						/>
					</Suspense>
				</div>

				{/* Posts List */}
				<Suspense
					fallback={
						<div className="space-y-6">
							{[...Array(6)].map((item) => (
								<div
									key={item.id}
									className="bg-white rounded-lg p-6 shadow-sm"
								>
									<div className="animate-pulse">
										<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
										<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
										<div className="h-4 bg-gray-200 rounded w-2/3"></div>
									</div>
								</div>
							))}
						</div>
					}
				>
					<BlogPostsList
						page={currentPage}
						categoryId={categoryFilter}
						tagId={tagFilter}
						search={searchQuery}
					/>
				</Suspense>
			</div>
		</div>
	);
}
