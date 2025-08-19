"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

interface RelatedPost {
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
}

interface RelatedPostsProps {
	currentPostId: string;
	categoryId?: string;
	tags?: Array<{ id: string; name: string; slug: string }>;
	limit?: number;
}

export function RelatedPosts({
	currentPostId,
	categoryId,
	tags = [],
	limit = 3,
}: RelatedPostsProps) {
	const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchRelatedPosts() {
			try {
				// Try to find posts with same category first
				let posts: RelatedPost[] = [];

				if (categoryId) {
					const categoryResponse = await fetch(
						`/api/posts?categoryId=${categoryId}&limit=${limit + 1}`,
					);
					if (categoryResponse.ok) {
						const categoryData = await categoryResponse.json();
						posts = categoryData.data.posts.filter(
							(post: RelatedPost) => post.id !== currentPostId,
						);
					}
				}

				// If we don't have enough posts from category, try tags
				if (posts.length < limit && tags.length > 0) {
					const tagId = tags[0].id; // Use first tag
					const tagResponse = await fetch(
						`/api/posts?tagId=${tagId}&limit=${limit + 1}`,
					);
					if (tagResponse.ok) {
						const tagData = await tagResponse.json();
						const tagPosts = tagData.data.posts.filter(
							(post: RelatedPost) =>
								post.id !== currentPostId &&
								!posts.some((p) => p.id === post.id),
						);
						posts = [...posts, ...tagPosts];
					}
				}

				// If still not enough, get recent posts
				if (posts.length < limit) {
					const recentResponse = await fetch(`/api/posts?limit=${limit + 1}`);
					if (recentResponse.ok) {
						const recentData = await recentResponse.json();
						const recentPosts = recentData.data.posts.filter(
							(post: RelatedPost) =>
								post.id !== currentPostId &&
								!posts.some((p) => p.id === post.id),
						);
						posts = [...posts, ...recentPosts];
					}
				}

				setRelatedPosts(posts.slice(0, limit));
			} catch (error) {
				console.error("Error fetching related posts:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchRelatedPosts();
	}, [currentPostId, categoryId, tags, limit]);

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow-sm p-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{Array.from({ length: 3 }, () => crypto.randomUUID()).map((key) => (
						<div key={key} className="animate-pulse">
							<div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
							<div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-2/3"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (relatedPosts.length === 0) {
		return null;
	}

	return (
		<div className="bg-white rounded-lg shadow-sm p-8">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{relatedPosts.map((post) => (
					<article key={post.id} className="group">
						<Link href={`/blog/${post.slug}`} className="block">
							{/* Category */}
							{post.category && (
								<span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mb-2">
									{post.category.name}
								</span>
							)}

							{/* Title */}
							<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
								{post.title}
							</h3>

							{/* Excerpt */}
							{post.excerpt && (
								<p className="text-gray-600 text-sm mb-3 line-clamp-3">
									{post.excerpt}
								</p>
							)}

							{/* Meta */}
							<div className="flex items-center gap-3 text-xs text-gray-500">
								<div className="flex items-center">
									<Calendar className="w-3 h-3 mr-1" />
									{new Date(post.publishedAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</div>
								{post.readingTime && (
									<div className="flex items-center">
										<Clock className="w-3 h-3 mr-1" />
										{post.readingTime} min
									</div>
								)}
							</div>
						</Link>
					</article>
				))}
			</div>

			{/* View All Posts Link */}
			<div className="text-center mt-8">
				<Link
					href="/blog"
					className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
				>
					View All Posts
				</Link>
			</div>
		</div>
	);
}
