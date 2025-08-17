"use client";

import { useState, useRef } from "react";
import { Media } from "@/lib/schema";

interface MediaLibraryProps {
	media: Media[];
	onUpload: (file: File) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onUpdateAlt: (id: string, alt: string) => Promise<void>;
}

export default function MediaLibrary({
	media,
	onUpload,
	onDelete,
	onUpdateAlt,
}: MediaLibraryProps) {
	const [uploading, setUploading] = useState(false);
	const [editingAlt, setEditingAlt] = useState<string | null>(null);
	const [altText, setAltText] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		try {
			await onUpload(file);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} finally {
			setUploading(false);
		}
	};

	const handleAltUpdate = async (id: string) => {
		try {
			await onUpdateAlt(id, altText);
			setEditingAlt(null);
			setAltText("");
		} catch (error) {
			console.error("Failed to update alt text:", error);
		}
	};

	const startEditingAlt = (mediaItem: Media) => {
		setEditingAlt(mediaItem.id);
		setAltText(mediaItem.alt || "");
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this media file?")) {
			try {
				await onDelete(id);
			} catch (error) {
				console.error("Failed to delete media:", error);
			}
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const getImageSrc = (mediaItem: Media) => {
		if (mediaItem.storageType === "base64" && mediaItem.base64Data) {
			return `data:${mediaItem.mimeType};base64,${mediaItem.base64Data}`;
		}
		return mediaItem.url;
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
				<div className="flex items-center space-x-4">
					{/* View Mode Toggle */}
					<div className="flex rounded-md shadow-sm">
						<button
							onClick={() => setViewMode("grid")}
							className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
								viewMode === "grid"
									? "bg-indigo-600 text-white border-indigo-600"
									: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
							}`}
						>
							Grid
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
								viewMode === "list"
									? "bg-indigo-600 text-white border-indigo-600"
									: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
							}`}
						>
							List
						</button>
					</div>

					{/* Upload Button */}
					<div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							className="hidden"
						/>
						<button
							onClick={() => fileInputRef.current?.click()}
							disabled={uploading}
							className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
						>
							{uploading ? "Uploading..." : "Upload Media"}
						</button>
					</div>
				</div>
			</div>

			{media.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-gray-400 text-6xl mb-4">🖼️</div>
					<p className="text-gray-500 mb-4">No media files found.</p>
					<button
						onClick={() => fileInputRef.current?.click()}
						className="text-indigo-600 hover:text-indigo-500"
					>
						Upload your first media file
					</button>
				</div>
			) : viewMode === "grid" ? (
				/* Grid View */
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
					{media.map((item) => (
						<div
							key={item.id}
							className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
						>
							<div className="aspect-square bg-gray-100 relative">
								<img
									src={getImageSrc(item)}
									alt={item.alt || item.originalName}
									className="w-full h-full object-cover"
								/>
								<div className="absolute top-2 right-2">
									<button
										onClick={() => handleDelete(item.id)}
										className="bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
									>
										×
									</button>
								</div>
							</div>
							<div className="p-3">
								<p className="text-xs font-medium text-gray-900 truncate">
									{item.originalName}
								</p>
								<p className="text-xs text-gray-500">
									{formatFileSize(item.size)}
								</p>
								{editingAlt === item.id ? (
									<div className="mt-2">
										<input
											type="text"
											value={altText}
											onChange={(e) => setAltText(e.target.value)}
											className="w-full text-xs border-gray-300 rounded"
											placeholder="Alt text"
										/>
										<div className="flex space-x-1 mt-1">
											<button
												onClick={() => handleAltUpdate(item.id)}
												className="text-xs text-indigo-600 hover:text-indigo-900"
											>
												Save
											</button>
											<button
												onClick={() => setEditingAlt(null)}
												className="text-xs text-gray-600 hover:text-gray-900"
											>
												Cancel
											</button>
										</div>
									</div>
								) : (
									<button
										onClick={() => startEditingAlt(item)}
										className="text-xs text-indigo-600 hover:text-indigo-900 mt-1"
									>
										{item.alt ? "Edit alt" : "Add alt"}
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			) : (
				/* List View */
				<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
					<table className="min-w-full divide-y divide-gray-300">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Preview
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Size
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Dimensions
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Alt Text
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Uploaded
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{media.map((item) => (
								<tr key={item.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										<img
											src={getImageSrc(item)}
											alt={item.alt || item.originalName}
											className="w-12 h-12 object-cover rounded"
										/>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{item.originalName}
										</div>
										<div className="text-sm text-gray-500">{item.mimeType}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatFileSize(item.size)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{item.width && item.height
											? `${item.width} × ${item.height}`
											: "N/A"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{editingAlt === item.id ? (
											<div className="flex space-x-2">
												<input
													type="text"
													value={altText}
													onChange={(e) => setAltText(e.target.value)}
													className="text-sm border-gray-300 rounded flex-1"
													placeholder="Alt text"
												/>
												<button
													onClick={() => handleAltUpdate(item.id)}
													className="text-sm text-indigo-600 hover:text-indigo-900"
												>
													Save
												</button>
												<button
													onClick={() => setEditingAlt(null)}
													className="text-sm text-gray-600 hover:text-gray-900"
												>
													Cancel
												</button>
											</div>
										) : (
											<div className="flex items-center space-x-2">
												<span className="text-sm text-gray-500">
													{item.alt || "No alt text"}
												</span>
												<button
													onClick={() => startEditingAlt(item)}
													className="text-sm text-indigo-600 hover:text-indigo-900"
												>
													Edit
												</button>
											</div>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(item.createdAt).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											onClick={() => handleDelete(item.id)}
											className="text-red-600 hover:text-red-900"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
