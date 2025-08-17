"use client";

import { useState } from "react";
import Link from "next/link";
import { Post, Project } from "@/lib/schema";

interface ContentListProps {
	type: "posts" | "projects";
	items: (Post | Project)[];
	onStatusChange: (id: string, status: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

export default function ContentList({
	type,
	items,
	onStatusChange,
	onDelete,
}: ContentListProps) {
	const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

	const handleStatusChange = async (id: string, newStatus: string) => {
		setLoadingItems((prev) => new Set(prev).add(id));
		try {
			await onStatusChange(id, newStatus);
		} finally {
			setLoadingItems((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}
	};

	const handleDelete = async (id: string) => {
		if (confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
			setLoadingItems((prev) => new Set(prev).add(id));
			try {
				await onDelete(id);
			} finally {
				setLoadingItems((prev) => {
					const next = new Set(prev);
					next.delete(id);
					return next;
				});
			}
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "published":
				return "bg-green-100 text-green-800";
			case "draft":
				return "bg-yellow-100 text-yellow-800";
			case "archived":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatDate = (timestamp: Date | null) => {
		if (!timestamp) return "Never";
		return new Date(timestamp).toLocaleDateString();
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900 capitalize">{type}</h2>
				<Link
					href={`/admin/${type}/new`}
					className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
				>
					Create New {type.slice(0, -1)}
				</Link>
			</div>

			{items.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">No {type} found.</p>
					<Link
						href={`/admin/${type}/new`}
						className="text-indigo-600 hover:text-indigo-500 mt-2 inline-block"
					>
						Create your first {type.slice(0, -1)}
					</Link>
				</div>
			) : (
				<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
					<table className="min-w-full divide-y divide-gray-300">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Title
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Published
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Updated
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{items.map((item) => {
								const isLoading = loadingItems.has(item.id);
								return (
									<tr key={item.id} className={isLoading ? "opacity-50" : ""}>
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">
													{item.title}
												</div>
												<div className="text-sm text-gray-500">
													/{item.slug}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<select
												value={item.status || "draft"}
												onChange={(e) =>
													handleStatusChange(item.id, e.target.value)
												}
												disabled={isLoading}
												className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
													item.status || "draft",
												)} border-0 focus:ring-2 focus:ring-indigo-500`}
											>
												<option value="draft">Draft</option>
												<option value="published">Published</option>
												<option value="archived">Archived</option>
											</select>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(item.publishedAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(item.updatedAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<Link
													href={`/admin/${type}/${item.id}/edit`}
													className="text-indigo-600 hover:text-indigo-900"
												>
													Edit
												</Link>
												<button
													onClick={() => handleDelete(item.id)}
													disabled={isLoading}
													className="text-red-600 hover:text-red-900 disabled:opacity-50"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
