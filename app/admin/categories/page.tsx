"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import CategoryManager from "@/components/admin/CategoryManager";
import { Category } from "@/lib/schema";

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			const response = await fetch("/api/categories");
			if (response.ok) {
				const data = await response.json();
				setCategories(data.categories || []);
			}
		} catch (error) {
			console.error("Failed to fetch categories:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateCategory = async (data: {
		name: string;
		description?: string;
	}) => {
		try {
			const response = await fetch("/api/categories", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				const newCategory = await response.json();
				setCategories([...categories, newCategory]);
			}
		} catch (error) {
			console.error("Failed to create category:", error);
		}
	};

	const handleUpdateCategory = async (
		id: string,
		data: { name: string; description?: string },
	) => {
		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				const updatedCategory = await response.json();
				setCategories(
					categories.map((cat) => (cat.id === id ? updatedCategory : cat)),
				);
			}
		} catch (error) {
			console.error("Failed to update category:", error);
		}
	};

	const handleDeleteCategory = async (id: string) => {
		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setCategories(categories.filter((cat) => cat.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete category:", error);
		}
	};

	if (loading) {
		return (
			<AdminLayout>
				<div className="p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="h-16 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<CategoryManager
				categories={categories}
				onCreateCategory={handleCreateCategory}
				onUpdateCategory={handleUpdateCategory}
				onDeleteCategory={handleDeleteCategory}
			/>
		</AdminLayout>
	);
}
