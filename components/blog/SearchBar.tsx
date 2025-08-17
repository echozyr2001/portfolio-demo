"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchBarProps {
	initialValue?: string;
	placeholder?: string;
}

export function SearchBar({
	initialValue = "",
	placeholder = "Search posts...",
}: SearchBarProps) {
	const [query, setQuery] = useState(initialValue);
	const [isSearching, setIsSearching] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();

	// Update local state when URL changes
	useEffect(() => {
		setQuery(initialValue);
	}, [initialValue]);

	const handleSearch = (searchQuery: string) => {
		setIsSearching(true);

		const params = new URLSearchParams(searchParams.toString());

		if (searchQuery.trim()) {
			params.set("search", searchQuery.trim());
		} else {
			params.delete("search");
		}

		// Reset to first page when searching
		params.delete("page");

		router.push(`/blog?${params.toString()}`);

		// Reset searching state after a short delay
		setTimeout(() => setIsSearching(false), 500);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearch(query);
	};

	const handleClear = () => {
		setQuery("");
		handleSearch("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			handleClear();
		}
	};

	return (
		<div className="relative max-w-md mx-auto">
			<form onSubmit={handleSubmit} className="relative">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
					/>
					{query && (
						<button
							type="button"
							onClick={handleClear}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					)}
				</div>

				{/* Search button for accessibility */}
				<button type="submit" className="sr-only" disabled={isSearching}>
					Search
				</button>
			</form>

			{/* Search indicator */}
			{isSearching && (
				<div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
						Searching...
					</div>
				</div>
			)}

			{/* Search suggestions could be added here in the future */}
		</div>
	);
}
