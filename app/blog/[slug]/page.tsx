import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { MDXRenderer } from "@/components/mdx";
import { RelatedPosts } from "@/components/blog/RelatedPosts";

interface BlogPostPageProps {
	params: {
		slug: string;
	};
}

interface TagType {
	id: string;
	name: string;
	slug: string;
}

// Fetch post data
async function getPost(slug: string) {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/posts/${slug}?public=true`,
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
		console.error("Error fetching post:", error);
		return null;
	}
}

// Generate metadata
export async function generateMetadata({
	params,
}: BlogPostPageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const post = await getPost(resolvedParams.slug);

	if (!post) {
		return {
			title: "Post Not Found",
		};
	}

	return {
		title: post.metaTitle || post.title,
		description: post.metaDescription || post.excerpt,
		openGraph: {
			title: post.metaTitle || post.title,
			description: post.metaDescription || post.excerpt,
			type: "article",
			publishedTime: post.publishedAt,
			modifiedTime: post.updatedAt,
		},
		twitter: {
			card: "summary_large_image",
			title: post.metaTitle || post.title,
			description: post.metaDescription || post.excerpt,
		},
	};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const resolvedParams = await params;
	const post = await getPost(resolvedParams.slug);

	if (!post) {
		notFound();
	}

	const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="min-h-screen bg-[#F6F4F1]">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Back to Blog */}
				<Link
					href="/blog"
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Blog
				</Link>

				{/* Article Header */}
				<article className="bg-white rounded-lg shadow-sm overflow-hidden">
					<div className="p-8 md:p-12">
						{/* Category */}
						{post.category && (
							<Link
								href={`/blog?category=${post.category.id}`}
								className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors mb-4"
							>
								{post.category.name}
							</Link>
						)}

						{/* Title */}
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
							{post.title}
						</h1>

						{/* Meta Information */}
						<div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
							<div className="flex items-center">
								<Calendar className="w-4 h-4 mr-2" />
								{publishedDate}
							</div>
							{post.readingTime && (
								<div className="flex items-center">
									<Clock className="w-4 h-4 mr-2" />
									{post.readingTime} min read
								</div>
							)}
							{post.wordCount && (
								<div className="text-gray-500">
									{post.wordCount.toLocaleString()} words
								</div>
							)}
						</div>

						{/* Tags */}
						{post.tags && post.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-8">
								{post.tags.map((tag: TagType) => (
									<Link
										key={tag.id}
										href={`/blog?tag=${tag.id}`}
										className="inline-flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
									>
										<Tag className="w-3 h-3 mr-1" />
										{tag.name}
									</Link>
								))}
							</div>
						)}

						{/* Content */}
						{post.mdxSource ? (
							<div className="prose prose-lg prose-gray max-w-none">
								<MDXRenderer mdxSource={post.mdxSource} />
							</div>
						) : (
							<div className="prose prose-lg prose-gray max-w-none">
								<p className="text-gray-600">Content not available.</p>
							</div>
						)}
					</div>
				</article>

				{/* Related Posts */}
				<div className="mt-12">
					<RelatedPosts
						currentPostId={post.id}
						categoryId={post.category?.id}
						tags={post.tags}
					/>
				</div>
			</div>
		</div>
	);
}
