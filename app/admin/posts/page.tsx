"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ContentList from "@/components/admin/ContentList";
import { Post } from "@/lib/schema";

export default function PostsPage() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchPosts();
	}, []);

	const fetchPosts = async () => {
		try {
			const response = await fetch("/api/admin/posts");
			if (response.ok) {
				const data = await response.json();
				// API returns { success: true, data: { posts: [...] } }
				setPosts(data.data?.posts || []);
			}
		} catch (error) {
			console.error("Failed to fetch posts:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (id: string, status: string) => {
		try {
			const response = await fetch(`/api/admin/posts/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status }),
			});

			if (response.ok) {
				setPosts(
					posts.map((post) =>
						post.id === id
							? {
									...post,
									status: status as "draft" | "published" | "archived",
								}
							: post,
					),
				);
			}
		} catch (error) {
			console.error("Failed to update post status:", error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/posts/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setPosts(posts.filter((post) => post.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete post:", error);
		}
	};

	if (loading) {
		return (
			<AdminLayout>
				<div className="p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="space-y-4">
							{Array.from({ length: 5 }, () => crypto.randomUUID()).map(
								(key) => (
									<div key={key} className="h-16 bg-gray-200 rounded"></div>
								),
							)}
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<ContentList
				type="posts"
				items={posts}
				onStatusChange={handleStatusChange}
				onDelete={handleDelete}
			/>
		</AdminLayout>
	);
}
