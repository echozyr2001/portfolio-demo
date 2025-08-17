"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

interface Category {
	id: string;
	name: string;
	slug: string;
	postCount: number;
}

interface Tag {
	id: string;
	name: string;
	slug: string;
	postCount: number;
}

interface BlogFiltersProps {
	selectedCategory?: string;
	selectedTag?: string;
}

export function BlogFilters({
	selectedCategory,
	selectedTag,
}: BlogFiltersProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [showFilters, setShowFilters] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		async function fetchFilters() {
			try {
				const [categoriesRes, tagsRes] = await Promise.all([
					fetch("/api/categories"),
					fetch("/api/tags"),
				]);

				if (categoriesRes.ok) {
					const categoriesData = await categoriesRes.json();
					setCategories(categoriesData.data.categories || []);
				}

				if (tagsRes.ok) {
					const tagsData = await tagsRes.json();
					setTags(tagsData.data.tags || []);
				}
			} catch (error) {
				console.error("Error fetching filters:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchFilters();
	}, []);

	const updateFilters = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}

		// Reset to first page when filters change
		params.delete("page");

		router.push(`/blog?${params.toString()}`);
	};

	const clearAllFilters = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("category");
		params.delete("tag");
		params.delete("page");

		router.push(`/blog?${params.toString()}`);
	};

	const hasActiveFilters = selectedCategory || selectedTag;

	if (loading) {
		return (
			<div className="bg-white rounded-lg p-4 shadow-sm">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
					<div className="flex gap-2">
						<div className="h-8 bg-gray-200 rounded w-20"></div>
						<div className="h-8 bg-gray-200 rounded w-16"></div>
						<div className="h-8 bg-gray-200 rounded w-24"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-sm">
			{/* Filter Toggle (Mobile) */}
			<div className="md:hidden p-4 border-b border-gray-200">
				<button
					onClick={() => setShowFilters(!showFilters)}
					className="flex items-center gap-2 text-gray-700 font-medium"
				>
					<Filter className="w-4 h-4" />
					Filters
					{hasActiveFilters && (
						<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
							{(selectedCategory ? 1 : 0) + (selectedTag ? 1 : 0)}
						</span>
					)}
				</button>
			</div>

			{/* Filters Content */}
			<div className={`p-4 ${showFilters ? "block" : "hidden md:block"}`}>
				<div className="flex flex-col md:flex-row gap-6">
					{/* Categories */}
					{categories.length > 0 && (
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-gray-900 mb-3">
								Categories
							</h3>
							<div className="flex flex-wrap gap-2">
								{categories.map((category) => (
									<button
										key={category.id}
										onClick={() =>
											updateFilters(
												"category",
												selectedCategory === category.id ? null : category.id,
											)
										}
										className={`px-3 py-1 text-sm rounded-full transition-colors ${
											selectedCategory === category.id
												? "bg-blue-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										{category.name}
										{category.postCount > 0 && (
											<span className="ml-1 text-xs opacity-75">
												({category.postCount})
											</span>
										)}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
							<div className="flex flex-wrap gap-2">
								{tags.slice(0, 10).map((tag) => (
									<button
										key={tag.id}
										onClick={() =>
											updateFilters(
												"tag",
												selectedTag === tag.id ? null : tag.id,
											)
										}
										className={`px-3 py-1 text-sm rounded-full transition-colors ${
											selectedTag === tag.id
												? "bg-blue-600 text-white"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										{tag.name}
										{tag.postCount > 0 && (
											<span className="ml-1 text-xs opacity-75">
												({tag.postCount})
											</span>
										)}
									</button>
								))}
								{tags.length > 10 && (
									<span className="text-xs text-gray-500 px-3 py-1">
										+{tags.length - 10} more
									</span>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Clear Filters */}
				{hasActiveFilters && (
					<div className="mt-4 pt-4 border-t border-gray-200">
						<button
							onClick={clearAllFilters}
							className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
						>
							<X className="w-4 h-4" />
							Clear all filters
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
