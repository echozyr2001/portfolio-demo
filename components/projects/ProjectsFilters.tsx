"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Star, SortAsc } from "lucide-react";

interface Tag {
	id: string;
	name: string;
	slug: string;
	postCount: number;
}

interface ProjectsFiltersProps {
	selectedTag?: string;
	featuredOnly?: boolean;
	sortBy?: string;
}

export function ProjectsFilters({
	selectedTag,
	featuredOnly,
	sortBy = "publishedAt",
}: ProjectsFiltersProps) {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [showFilters, setShowFilters] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		async function fetchTags() {
			try {
				const response = await fetch("/api/tags");
				if (response.ok) {
					const data = await response.json();
					setTags(data.data.tags || []);
				}
			} catch (error) {
				console.error("Error fetching tags:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchTags();
	}, []);

	const updateFilters = (key: string, value: string | boolean | null) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value !== null && value !== false) {
			params.set(key, value.toString());
		} else {
			params.delete(key);
		}

		// Reset to first page when filters change
		params.delete("page");

		router.push(`/projects?${params.toString()}`);
	};

	const clearAllFilters = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("tag");
		params.delete("featured");
		params.delete("sort");
		params.delete("page");

		router.push(`/projects?${params.toString()}`);
	};

	const hasActiveFilters =
		selectedTag || featuredOnly || sortBy !== "publishedAt";

	const sortOptions = [
		{ value: "publishedAt", label: "Latest" },
		{ value: "title", label: "Title A-Z" },
		{ value: "featured", label: "Featured First" },
	];

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
					Filters & Sort
					{hasActiveFilters && (
						<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
							{(selectedTag ? 1 : 0) +
								(featuredOnly ? 1 : 0) +
								(sortBy !== "publishedAt" ? 1 : 0)}
						</span>
					)}
				</button>
			</div>

			{/* Filters Content */}
			<div className={`p-4 ${showFilters ? "block" : "hidden md:block"}`}>
				<div className="flex flex-col md:flex-row gap-6">
					{/* Sort Options */}
					<div className="flex-shrink-0">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">
							Sort By
						</h3>
						<div className="flex flex-wrap gap-2">
							{sortOptions.map((option) => (
								<button
									key={option.value}
									onClick={() =>
										updateFilters(
											"sort",
											sortBy === option.value ? null : option.value,
										)
									}
									className={`flex items-center px-3 py-1 text-sm rounded-full transition-colors ${
										sortBy === option.value
											? "bg-blue-600 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									<SortAsc className="w-3 h-3 mr-1" />
									{option.label}
								</button>
							))}
						</div>
					</div>

					{/* Featured Filter */}
					<div className="flex-shrink-0">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">
							Featured
						</h3>
						<button
							onClick={() => updateFilters("featured", !featuredOnly)}
							className={`flex items-center px-3 py-1 text-sm rounded-full transition-colors ${
								featuredOnly
									? "bg-yellow-100 text-yellow-800"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							<Star className="w-3 h-3 mr-1" />
							Featured Only
						</button>
					</div>

					{/* Tags */}
					{tags.length > 0 && (
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
							<div className="flex flex-wrap gap-2">
								{tags.slice(0, 8).map((tag) => (
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
								{tags.length > 8 && (
									<span className="text-xs text-gray-500 px-3 py-1">
										+{tags.length - 8} more
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
