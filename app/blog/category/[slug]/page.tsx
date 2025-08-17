import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface CategoryPageProps {
	params: {
		slug: string;
	};
}

// Fetch category data
async function getCategory(slug: string) {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/categories`,
			{
				cache: "no-store",
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		const categories = data.data.categories || [];

		return categories.find((cat: any) => cat.slug === slug);
	} catch (error) {
		console.error("Error fetching category:", error);
		return null;
	}
}

// Generate metadata
export async function generateMetadata({
	params,
}: CategoryPageProps): Promise<Metadata> {
	const category = await getCategory(params.slug);

	if (!category) {
		return {
			title: "Category Not Found",
		};
	}

	return {
		title: `${category.name} | Blog Categories`,
		description:
			category.description ||
			`Browse all posts in the ${category.name} category`,
		openGraph: {
			title: `${category.name} | Blog Categories`,
			description:
				category.description ||
				`Browse all posts in the ${category.name} category`,
		},
	};
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	const category = await getCategory(params.slug);

	if (!category) {
		notFound();
	}

	// Redirect to blog page with category filter
	redirect(`/blog?category=${category.id}`);
}
