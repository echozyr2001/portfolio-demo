"use client";

import { useState } from "react";
import { Tag } from "@/lib/schema";

interface TagManagerProps {
	tags: Tag[];
	onCreateTag: (data: { name: string }) => Promise<void>;
	onUpdateTag: (id: string, data: { name: string }) => Promise<void>;
	onDeleteTag: (id: string) => Promise<void>;
}

export default function TagManager({
	tags,
	onCreateTag,
	onUpdateTag,
	onDeleteTag,
}: TagManagerProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [tagName, setTagName] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!tagName.trim()) return;

		setLoading(true);
		try {
			if (editingId) {
				await onUpdateTag(editingId, { name: tagName });
				setEditingId(null);
			} else {
				await onCreateTag({ name: tagName });
				setIsCreating(false);
			}
			setTagName("");
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (tag: Tag) => {
		setEditingId(tag.id);
		setTagName(tag.name);
		setIsCreating(false);
	};

	const handleCancel = () => {
		setIsCreating(false);
		setEditingId(null);
		setTagName("");
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this tag?")) {
			setLoading(true);
			try {
				await onDeleteTag(id);
			} finally {
				setLoading(false);
			}
		}
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900">Tags</h2>
				{!isCreating && !editingId && (
					<button
						onClick={() => setIsCreating(true)}
						className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
					>
						Add Tag
					</button>
				)}
			</div>

			{/* Create/Edit Form */}
			{(isCreating || editingId) && (
				<div className="mb-6 p-4 bg-gray-50 rounded-lg">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						{editingId ? "Edit Tag" : "Create New Tag"}
					</h3>
					<form onSubmit={handleSubmit} className="flex space-x-3">
						<input
							type="text"
							value={tagName}
							onChange={(e) => setTagName(e.target.value)}
							className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							placeholder="Tag name"
							required
						/>
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
					</form>
				</div>
			)}

			{/* Tags Grid */}
			{tags.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500">No tags found.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{tags.map((tag) => (
						<div
							key={tag.id}
							className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
						>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-medium text-gray-900">
										{tag.name}
									</h3>
									<p className="text-xs text-gray-500 mt-1">/{tag.slug}</p>
									<p className="text-xs text-gray-400 mt-1">
										Created {new Date(tag.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div className="flex space-x-2">
									<button
										onClick={() => handleEdit(tag)}
										className="text-indigo-600 hover:text-indigo-900 text-sm"
									>
										Edit
									</button>
									<button
										onClick={() => handleDelete(tag.id)}
										disabled={loading}
										className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
