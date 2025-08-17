"use client";

import { useState } from "react";
import { Category } from "@/lib/schema";

interface CategoryManagerProps {
	categories: Category[];
	onCreateCategory: (data: {
		name: string;
		description?: string;
	}) => Promise<void>;
	onUpdateCategory: (
		id: string,
		data: { name: string; description?: string },
	) => Promise<void>;
	onDeleteCategory: (id: string) => Promise<void>;
}

export default function CategoryManager({
	categories,
	onCreateCategory,
	onUpdateCategory,
	onDeleteCategory,
}: CategoryManagerProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState({ name: "", description: "" });
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim()) return;

		setLoading(true);
		try {
			if (editingId) {
				await onUpdateCategory(editingId, formData);
				setEditingId(null);
			} else {
				await onCreateCategory(formData);
				setIsCreating(false);
			}
			setFormData({ name: "", description: "" });
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (category: Category) => {
		setEditingId(category.id);
		setFormData({
			name: category.name,
			description: category.description || "",
		});
		setIsCreating(false);
	};

	const handleCancel = () => {
		setIsCreating(false);
		setEditingId(null);
		setFormData({ name: "", description: "" });
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this category?")) {
			setLoading(true);
			try {
				await onDeleteCategory(id);
			} finally {
				setLoading(false);
			}
		}
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900">Categories</h2>
				{!isCreating && !editingId && (
					<button
						onClick={() => setIsCreating(true)}
						className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
					>
						Add Category
					</button>
				)}
			</div>

			{/* Create/Edit Form */}
			{(isCreating || editingId) && (
				<div className="mb-6 p-4 bg-gray-50 rounded-lg">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						{editingId ? "Edit Category" : "Create New Category"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700"
							>
								Name
							</label>
							<input
								type="text"
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								placeholder="Category name"
								required
							/>
						</div>
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700"
							>
								Description
							</label>
							<textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={3}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								placeholder="Category description (optional)"
							/>
						</div>
						<div className="flex space-x-3">
							<button
								type="submit"
								disabled={loading}
								className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
							>
								{loading ? "Saving..." : editingId ? "Update" : "Create"}
							</button>
							<button
								type="button"
								onClick={handleCancel}
								className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Categories List */}
			{categories.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">No categories found.</p>
				</div>
			) : (
				<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
					<table className="min-w-full divide-y divide-gray-300">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Slug
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Description
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Created
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{categories.map((category) => (
								<tr key={category.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm font-medium text-gray-900">
											{category.name}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-500">{category.slug}</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-sm text-gray-500 max-w-xs truncate">
											{category.description || "No description"}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(category.createdAt).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											<button
												onClick={() => handleEdit(category)}
												className="text-indigo-600 hover:text-indigo-900"
											>
												Edit
											</button>
											<button
												onClick={() => handleDelete(category.id)}
												disabled={loading}
												className="text-red-600 hover:text-red-900 disabled:opacity-50"
											>
												Delete
											</button>
										</div>
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
