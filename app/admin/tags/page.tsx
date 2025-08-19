"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import TagManager from "@/components/admin/TagManager";
import { Tag } from "@/lib/schema";
import { time } from "console";

export default function TagsPage() {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchTags();
	}, []);

	const fetchTags = async () => {
		try {
			const response = await fetch("/api/tags");
			if (response.ok) {
				const data = await response.json();
				setTags(data.tags || []);
			}
		} catch (error) {
			console.error("Failed to fetch tags:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateTag = async (data: { name: string }) => {
		try {
			const response = await fetch("/api/tags", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				const newTag = await response.json();
				setTags([...tags, newTag]);
			}
		} catch (error) {
			console.error("Failed to create tag:", error);
		}
	};

	const handleUpdateTag = async (id: string, data: { name: string }) => {
		try {
			const response = await fetch(`/api/tags/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				const updatedTag = await response.json();
				setTags(tags.map((tag) => (tag.id === id ? updatedTag : tag)));
			}
		} catch (error) {
			console.error("Failed to update tag:", error);
		}
	};

	const handleDeleteTag = async (id: string) => {
		try {
			const response = await fetch(`/api/tags/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setTags(tags.filter((tag) => tag.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete tag:", error);
		}
	};

	if (loading) {
		return (
			<AdminLayout>
				<div className="p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[...Array(6)].map((item) => (
								<div key={item.id} className="h-24 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<TagManager
				tags={tags}
				onCreateTag={handleCreateTag}
				onUpdateTag={handleUpdateTag}
				onDeleteTag={handleDeleteTag}
			/>
		</AdminLayout>
	);
}
