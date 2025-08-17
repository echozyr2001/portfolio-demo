"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import MediaLibrary from "@/components/admin/MediaLibrary";
import { Media } from "@/lib/schema";

export default function MediaPage() {
	const [media, setMedia] = useState<Media[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchMedia();
	}, []);

	const fetchMedia = async () => {
		try {
			const response = await fetch("/api/admin/media");
			if (response.ok) {
				const data = await response.json();
				setMedia(data);
			}
		} catch (error) {
			console.error("Failed to fetch media:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleUpload = async (file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await fetch("/api/admin/media/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const newMedia = await response.json();
				setMedia([newMedia, ...media]);
			} else {
				const error = await response.json();
				throw new Error(error.error || "Upload failed");
			}
		} catch (error) {
			console.error("Failed to upload media:", error);
			alert(
				`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/admin/media/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setMedia(media.filter((item) => item.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete media:", error);
		}
	};

	const handleUpdateAlt = async (id: string, alt: string) => {
		try {
			const response = await fetch(`/api/admin/media/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ alt }),
			});

			if (response.ok) {
				const updatedMedia = await response.json();
				setMedia(media.map((item) => (item.id === id ? updatedMedia : item)));
			}
		} catch (error) {
			console.error("Failed to update alt text:", error);
		}
	};

	if (loading) {
		return (
			<AdminLayout>
				<div className="p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
							{[...Array(12)].map((_, i) => (
								<div
									key={i}
									className="aspect-square bg-gray-200 rounded"
								></div>
							))}
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<MediaLibrary
				media={media}
				onUpload={handleUpload}
				onDelete={handleDelete}
				onUpdateAlt={handleUpdateAlt}
			/>
		</AdminLayout>
	);
}
