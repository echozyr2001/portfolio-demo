// Shared types for the example page components

export type Project = {
	id: string;
	title: string;
	description: string;
	tech: string[];
	link?: string;
};

// Blog post types
export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	publishedAt: string;
	status: 'draft' | 'published';
	featuredImage?: {
		id: string;
		url: string;
		alt: string;
		filename: string;
		mimeType: string;
		filesize: number;
		width?: number;
		height?: number;
	};
	tags?: Array<{ tag: string }>;
	seo?: {
		title?: string;
		description?: string;
	};
	createdAt: string;
	updatedAt: string;
}

// Project types (enhanced for CMS)
export interface ProjectCMS {
	id: string;
	title: string;
	slug: string;
	shortDescription: string;
	description: string;
	technologies: Array<{ technology: string }>;
	projectUrl?: string;
	githubUrl?: string;
	featuredImage?: {
		id: string;
		url: string;
		alt: string;
		filename: string;
		mimeType: string;
		filesize: number;
		width?: number;
		height?: number;
	};
	images?: Array<{
		image: {
			id: string;
			url: string;
			alt: string;
			filename: string;
			mimeType: string;
			filesize: number;
			width?: number;
			height?: number;
		};
		caption?: string;
	}>;
	status: 'draft' | 'published';
	featured: boolean;
	order: number;
	createdAt: string;
	updatedAt: string;
}

// Color constants for consistent usage
export const COLORS = {
	background: "#D9D5D2",
	text: "#2C2A25",
	accent: "#A2ABB1",
	dark: "#333333",
	light: "#ECEAE8",
};
