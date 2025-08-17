import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface TagPageProps {
	params: {
		slug: string;
	};
}

// Fetch tag data
async function getTag(slug: string) {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/tags`,
			{
				cache: "no-store",
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		const tags = data.data.tags || [];

		return tags.find((tag: any) => tag.slug === slug);
	} catch (error) {
		console.error("Error fetching tag:", error);
		return null;
	}
}

// Generate metadata
export async function generateMetadata({
	params,
}: TagPageProps): Promise<Metadata> {
	const tag = await getTag(params.slug);

	if (!tag) {
		return {
			title: "Tag Not Found",
		};
	}

	return {
		title: `${tag.name} | Blog Tags`,
		description: `Browse all posts tagged with ${tag.name}`,
		openGraph: {
			title: `${tag.name} | Blog Tags`,
			description: `Browse all posts tagged with ${tag.name}`,
		},
	};
}

export default async function TagPage({ params }: TagPageProps) {
	const tag = await getTag(params.slug);

	if (!tag) {
		notFound();
	}

	// Redirect to blog page with tag filter
	redirect(`/blog?tag=${tag.id}`);
}
