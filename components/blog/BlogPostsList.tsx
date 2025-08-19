"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Tag, ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPost {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	readingTime: number;
	publishedAt: string;
	category?: {
		id: string;
		name: string;
		slug: string;
	};
	tags: Array<{
		id: string;
		name: string;
		slug: string;
	}>;
}

interface BlogPostsListProps {
	page: number;
	categoryId?: string;
	tagId?: string;
	search?: string;
}

interface ApiResponse {
	posts: BlogPost[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export function BlogPostsList({
	page,
	categoryId,
	tagId,
	search,
}: BlogPostsListProps) {
	const [data, setData] = useState<ApiResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchPosts() {
			setLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams();
				params.set("page", page.toString());
				params.set("limit", "12");

				if (categoryId) params.set("categoryId", categoryId);
				if (tagId) params.set("tagId", tagId);
				if (search) params.set("search", search);

				const response = await fetch(`/api/posts?${params.toString()}`);

				if (!response.ok) {
					throw new Error("Failed to fetch posts");
				}

				const result = await response.json();
				setData(result.data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchPosts();
	}, [page, categoryId, tagId, search]);

	if (loading) {
		return (
			<div className="space-y-6">
				{Array.from({ length: 6 }, () => crypto.randomUUID()).map((key) => (
					<div key={key} className="bg-white rounded-lg p-6 shadow-sm">
						<div className="animate-pulse">
							<div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
							<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-2/3"></div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600 mb-4">Error loading posts: {error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	if (!data || data.posts.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-600 text-lg">No posts found.</p>
				<Link
					href="/blog"
					className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					View All Posts
				</Link>
			</div>
		);
	}

	const { posts, pagination } = data;

	return (
		<div>
			{/* Posts Grid */}
			<div className="space-y-6 mb-12">
				{posts.map((post) => (
					<article
						key={post.id}
						className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
					>
						<div className="p-6">
							{/* Category */}
							{post.category && (
								<Link
									href={`/blog?category=${post.category.id}`}
									className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors mb-3"
								>
									{post.category.name}
								</Link>
							)}

							{/* Title */}
							<h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
								<Link href={`/blog/${post.slug}`}>{post.title}</Link>
							</h2>

							{/* Excerpt */}
							{post.excerpt && (
								<p className="text-gray-600 mb-4 line-clamp-3">
									{post.excerpt}
								</p>
							)}

							{/* Meta Information */}
							<div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
								<div className="flex items-center">
									<Calendar className="w-4 h-4 mr-1" />
									{new Date(post.publishedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</div>
								{post.readingTime && (
									<div className="flex items-center">
										<Clock className="w-4 h-4 mr-1" />
										{post.readingTime} min read
									</div>
								)}
							</div>

							{/* Tags */}
							{post.tags && post.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{post.tags.slice(0, 3).map((tag) => (
										<Link
											key={tag.id}
											href={`/blog?tag=${tag.id}`}
											className="inline-flex items-center px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
										>
											<Tag className="w-3 h-3 mr-1" />
											{tag.name}
										</Link>
									))}
									{post.tags.length > 3 && (
										<span className="text-xs text-gray-500">
											+{post.tags.length - 3} more
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
							href={`/blog?page=${pagination.page - 1}${categoryId ? `&category=${categoryId}` : ""}${tagId ? `&tag=${tagId}` : ""}${search ? `&search=${search}` : ""}`}
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
									href={`/blog?page=${pageNum}${categoryId ? `&category=${categoryId}` : ""}${tagId ? `&tag=${tagId}` : ""}${search ? `&search=${search}` : ""}`}
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
							href={`/blog?page=${pagination.page + 1}${categoryId ? `&category=${categoryId}` : ""}${tagId ? `&tag=${tagId}` : ""}${search ? `&search=${search}` : ""}`}
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
				Showing {posts.length} of {pagination.totalCount} posts
			</div>
		</div>
	);
}
