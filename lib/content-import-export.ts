import { z } from "zod";
import { db } from "./db";
import {
	posts,
	projects,
	categories,
	tags,
	postTags,
	projectTags,
} from "./schema";
import { MDXProcessor } from "./mdx-processor";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import JSZip from "jszip";
import matter from "gray-matter";

/**
 * 导入选项
 */
export interface ImportOptions {
	conflictResolution: "skip" | "overwrite" | "rename";
	validateContent: boolean;
	createMissingCategories: boolean;
	createMissingTags: boolean;
}

/**
 * 导出选项
 */
export interface ExportOptions {
	includeMetadata: boolean;
	format: "zip" | "individual";
	contentTypes: ("posts" | "projects")[];
	status?: ("draft" | "published" | "archived")[];
}

/**
 * 导入结果
 */
export interface ImportResult {
	success: boolean;
	imported: number;
	skipped: number;
	errors: ImportError[];
	warnings: string[];
}

/**
 * 导入错误
 */
export interface ImportError {
	filename: string;
	error: string;
	line?: number;
}

/**
 * 导出结果
 */
export interface ExportResult {
	success: boolean;
	filename: string;
	buffer: Buffer;
	contentType: string;
}

/**
 * MDX文件验证schema
 */
const mdxFileSchema = z.object({
	filename: z.string().regex(/\.mdx?$/i, "File must be .md or .mdx"),
	content: z.string().min(1, "File content cannot be empty"),
});

/**
 * Frontmatter验证schema
 */
const frontmatterSchema = z.object({
	title: z.string().min(1, "Title is required"),
	slug: z.string().optional(),
	status: z.enum(["draft", "published", "archived"]).optional(),
	publishedAt: z.string().or(z.date()).optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	// Project specific fields
	githubUrl: z.string().url().optional(),
	liveUrl: z.string().url().optional(),
	imageUrl: z.string().url().optional(),
	technologies: z.array(z.string()).optional(),
	featured: z.boolean().optional(),
});

/**
 * 内容导入导出服务
 */
export class ContentImportExportService {
	private mdxProcessor: MDXProcessor;

	constructor() {
		this.mdxProcessor = new MDXProcessor();
	}

	/**
	 * 批量导入MDX文件
	 */
	async importMDXFiles(
		files: { filename: string; content: string }[],
		contentType: "posts" | "projects",
		options: ImportOptions = {
			conflictResolution: "skip",
			validateContent: true,
			createMissingCategories: true,
			createMissingTags: true,
		},
	): Promise<ImportResult> {
		const result: ImportResult = {
			success: true,
			imported: 0,
			skipped: 0,
			errors: [],
			warnings: [],
		};

		for (const file of files) {
			try {
				// 验证文件格式
				const validatedFile = mdxFileSchema.parse(file);

				// 解析MDX内容
				const parseResult = await this.parseMDXFile(
					validatedFile.content,
					options.validateContent,
				);

				if (!parseResult.isValid) {
					result.errors.push({
						filename: file.filename,
						error: parseResult.error || "Invalid MDX content",
					});
					continue;
				}

				// 检查冲突
				const existingContent = await this.checkContentExists(
					parseResult.frontmatter.slug ||
						this.generateSlugFromFilename(file.filename),
					contentType,
				);

				if (existingContent) {
					switch (options.conflictResolution) {
						case "skip":
							result.skipped++;
							result.warnings.push(
								`Skipped ${file.filename}: content already exists`,
							);
							continue;
						case "overwrite":
							await this.updateExistingContent(
								existingContent.id,
								parseResult,
								contentType,
								options,
							);
							result.imported++;
							break;
						case "rename":
							parseResult.frontmatter.slug = await this.generateUniqueSlug(
								parseResult.frontmatter.slug ||
									this.generateSlugFromFilename(file.filename),
								contentType,
							);
							await this.createNewContent(parseResult, contentType, options);
							result.imported++;
							result.warnings.push(
								`Renamed ${file.filename} to avoid conflict`,
							);
							break;
					}
				} else {
					await this.createNewContent(parseResult, contentType, options);
					result.imported++;
				}
			} catch (error) {
				result.errors.push({
					filename: file.filename,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		result.success = result.errors.length === 0;
		return result;
	}

	/**
	 * 导出内容为MDX文件
	 */
	async exportContent(options: ExportOptions): Promise<ExportResult> {
		try {
			const zip = new JSZip();
			let totalExported = 0;

			// 导出Posts
			if (options.contentTypes.includes("posts")) {
				const postsData = await this.getPostsForExport(options.status);
				const postsFolder = zip.folder("posts");

				for (const post of postsData) {
					const mdxContent = await this.generateMDXContent(
						post,
						"post",
						options.includeMetadata,
					);
					postsFolder?.file(`${post.slug}.mdx`, mdxContent);
					totalExported++;
				}
			}

			// 导出Projects
			if (options.contentTypes.includes("projects")) {
				const projectsData = await this.getProjectsForExport(options.status);
				const projectsFolder = zip.folder("projects");

				for (const project of projectsData) {
					const mdxContent = await this.generateMDXContent(
						project,
						"project",
						options.includeMetadata,
					);
					projectsFolder?.file(`${project.slug}.mdx`, mdxContent);
					totalExported++;
				}
			}

			// 生成压缩包
			const buffer = await zip.generateAsync({ type: "nodebuffer" });
			const timestamp = new Date().toISOString().split("T")[0];
			const filename = `content-export-${timestamp}.zip`;

			return {
				success: true,
				filename,
				buffer,
				contentType: "application/zip",
			};
		} catch (error) {
			throw new Error(
				`Export failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * 解析MDX文件内容
	 */
	private async parseMDXFile(
		content: string,
		validateContent: boolean,
	): Promise<{
		isValid: boolean;
		error?: string;
		frontmatter: any;
		mdxContent: string;
		metadata: any;
	}> {
		try {
			// 解析frontmatter
			const { data: frontmatter, content: mdxBody } = matter(content);

			// 验证frontmatter
			const validatedFrontmatter = frontmatterSchema.parse(frontmatter);

			// 如果需要验证内容，使用MDX处理器验证
			if (validateContent) {
				const validation = await this.mdxProcessor.validateMDX(content);
				if (!validation.isValid) {
					return {
						isValid: false,
						error: validation.error,
						frontmatter: validatedFrontmatter,
						mdxContent: content,
						metadata: {},
					};
				}
			}

			// 提取元数据
			const metadata = this.mdxProcessor.extractMetadata(content);

			return {
				isValid: true,
				frontmatter: validatedFrontmatter,
				mdxContent: content,
				metadata,
			};
		} catch (error) {
			return {
				isValid: false,
				error: error instanceof Error ? error.message : String(error),
				frontmatter: {},
				mdxContent: content,
				metadata: {},
			};
		}
	}

	/**
	 * 检查内容是否已存在
	 */
	private async checkContentExists(
		slug: string,
		contentType: "posts" | "projects",
	): Promise<{ id: string } | null> {
		try {
			if (contentType === "posts") {
				const result = await db
					.select({ id: posts.id })
					.from(posts)
					.where(eq(posts.slug, slug))
					.limit(1);
				return result[0] || null;
			} else {
				const result = await db
					.select({ id: projects.id })
					.from(projects)
					.where(eq(projects.slug, slug))
					.limit(1);
				return result[0] || null;
			}
		} catch (error) {
			console.error("Error checking content existence:", error);
			return null;
		}
	}

	/**
	 * 创建新内容
	 */
	private async createNewContent(
		parseResult: any,
		contentType: "posts" | "projects",
		options: ImportOptions,
	): Promise<void> {
		const id = nanoid();
		const now = new Date();
		const slug =
			parseResult.frontmatter.slug ||
			this.generateSlugFromTitle(parseResult.frontmatter.title);

		// 处理分类和标签
		const categoryId = await this.handleCategory(
			parseResult.frontmatter.category,
			options.createMissingCategories,
		);
		const tagIds = await this.handleTags(
			parseResult.frontmatter.tags || [],
			options.createMissingTags,
		);

		if (contentType === "posts") {
			// 创建文章
			await db.insert(posts).values({
				id,
				title: parseResult.frontmatter.title,
				slug,
				mdxContent: parseResult.mdxContent,
				excerpt: parseResult.metadata.excerpt,
				readingTime: parseResult.metadata.readingTime,
				wordCount: parseResult.metadata.wordCount,
				status: parseResult.frontmatter.status || "draft",
				publishedAt: parseResult.frontmatter.publishedAt
					? new Date(parseResult.frontmatter.publishedAt)
					: null,
				categoryId,
				createdAt: now,
				updatedAt: now,
			});

			// 关联标签
			if (tagIds.length > 0) {
				await db
					.insert(postTags)
					.values(tagIds.map((tagId) => ({ postId: id, tagId })));
			}
		} else {
			// 创建项目
			await db.insert(projects).values({
				id,
				title: parseResult.frontmatter.title,
				slug,
				mdxContent: parseResult.mdxContent,
				githubUrl: parseResult.frontmatter.githubUrl,
				liveUrl: parseResult.frontmatter.liveUrl,
				imageUrl: parseResult.frontmatter.imageUrl,
				technologies: parseResult.frontmatter.technologies || [],
				featured: parseResult.frontmatter.featured || false,
				status: parseResult.frontmatter.status || "draft",
				publishedAt: parseResult.frontmatter.publishedAt
					? new Date(parseResult.frontmatter.publishedAt)
					: null,
				createdAt: now,
				updatedAt: now,
			});

			// 关联标签
			if (tagIds.length > 0) {
				await db
					.insert(projectTags)
					.values(tagIds.map((tagId) => ({ projectId: id, tagId })));
			}
		}
	}

	/**
	 * 更新现有内容
	 */
	private async updateExistingContent(
		id: string,
		parseResult: any,
		contentType: "posts" | "projects",
		options: ImportOptions,
	): Promise<void> {
		const now = new Date();

		// 处理分类和标签
		const categoryId = await this.handleCategory(
			parseResult.frontmatter.category,
			options.createMissingCategories,
		);
		const tagIds = await this.handleTags(
			parseResult.frontmatter.tags || [],
			options.createMissingTags,
		);

		if (contentType === "posts") {
			// 更新文章
			await db
				.update(posts)
				.set({
					title: parseResult.frontmatter.title,
					mdxContent: parseResult.mdxContent,
					excerpt: parseResult.metadata.excerpt,
					readingTime: parseResult.metadata.readingTime,
					wordCount: parseResult.metadata.wordCount,
					status: parseResult.frontmatter.status || "draft",
					publishedAt: parseResult.frontmatter.publishedAt
						? new Date(parseResult.frontmatter.publishedAt)
						: null,
					categoryId,
					updatedAt: now,
				})
				.where(eq(posts.id, id));

			// 更新标签关联
			await db.delete(postTags).where(eq(postTags.postId, id));
			if (tagIds.length > 0) {
				await db
					.insert(postTags)
					.values(tagIds.map((tagId) => ({ postId: id, tagId })));
			}
		} else {
			// 更新项目
			await db
				.update(projects)
				.set({
					title: parseResult.frontmatter.title,
					mdxContent: parseResult.mdxContent,
					githubUrl: parseResult.frontmatter.githubUrl,
					liveUrl: parseResult.frontmatter.liveUrl,
					imageUrl: parseResult.frontmatter.imageUrl,
					technologies: parseResult.frontmatter.technologies || [],
					featured: parseResult.frontmatter.featured || false,
					status: parseResult.frontmatter.status || "draft",
					publishedAt: parseResult.frontmatter.publishedAt
						? new Date(parseResult.frontmatter.publishedAt)
						: null,
					updatedAt: now,
				})
				.where(eq(projects.id, id));

			// 更新标签关联
			await db.delete(projectTags).where(eq(projectTags.projectId, id));
			if (tagIds.length > 0) {
				await db
					.insert(projectTags)
					.values(tagIds.map((tagId) => ({ projectId: id, tagId })));
			}
		}
	}

	/**
	 * 处理分类
	 */
	private async handleCategory(
		categoryName: string | undefined,
		createMissing: boolean,
	): Promise<string | null> {
		if (!categoryName) return null;

		// 查找现有分类
		const existing = await db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.name, categoryName))
			.limit(1);

		if (existing[0]) {
			return existing[0].id;
		}

		if (createMissing) {
			// 创建新分类
			const id = nanoid();
			const slug = this.generateSlug(categoryName);
			await db.insert(categories).values({
				id,
				name: categoryName,
				slug,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			return id;
		}

		return null;
	}

	/**
	 * 处理标签
	 */
	private async handleTags(
		tagNames: string[],
		createMissing: boolean,
	): Promise<string[]> {
		if (tagNames.length === 0) return [];

		const tagIds: string[] = [];

		for (const tagName of tagNames) {
			// 查找现有标签
			const existing = await db
				.select({ id: tags.id })
				.from(tags)
				.where(eq(tags.name, tagName))
				.limit(1);

			if (existing[0]) {
				tagIds.push(existing[0].id);
			} else if (createMissing) {
				// 创建新标签
				const id = nanoid();
				const slug = this.generateSlug(tagName);
				await db.insert(tags).values({
					id,
					name: tagName,
					slug,
					createdAt: new Date(),
				});
				tagIds.push(id);
			}
		}

		return tagIds;
	}

	/**
	 * 获取要导出的文章数据
	 */
	private async getPostsForExport(
		status?: ("draft" | "published" | "archived")[],
	) {
		let query = db
			.select({
				id: posts.id,
				title: posts.title,
				slug: posts.slug,
				mdxContent: posts.mdxContent,
				status: posts.status,
				publishedAt: posts.publishedAt,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
			})
			.from(posts);

		if (status && status.length > 0) {
			query = query.where(
				status.length === 1
					? eq(posts.status, status[0])
					: posts.status.in(status),
			) as any;
		}

		return await query;
	}

	/**
	 * 获取要导出的项目数据
	 */
	private async getProjectsForExport(
		status?: ("draft" | "published" | "archived")[],
	) {
		let query = db
			.select({
				id: projects.id,
				title: projects.title,
				slug: projects.slug,
				mdxContent: projects.mdxContent,
				githubUrl: projects.githubUrl,
				liveUrl: projects.liveUrl,
				imageUrl: projects.imageUrl,
				technologies: projects.technologies,
				featured: projects.featured,
				status: projects.status,
				publishedAt: projects.publishedAt,
				createdAt: projects.createdAt,
				updatedAt: projects.updatedAt,
			})
			.from(projects);

		if (status && status.length > 0) {
			query = query.where(
				status.length === 1
					? eq(projects.status, status[0])
					: projects.status.in(status),
			) as any;
		}

		return await query;
	}

	/**
	 * 生成MDX内容
	 */
	private async generateMDXContent(
		content: any,
		type: "post" | "project",
		includeMetadata: boolean,
	): Promise<string> {
		const frontmatter: any = {
			title: content.title,
			slug: content.slug,
			status: content.status,
		};

		if (content.publishedAt) {
			frontmatter.publishedAt = content.publishedAt.toISOString();
		}

		if (type === "project") {
			if (content.githubUrl) frontmatter.githubUrl = content.githubUrl;
			if (content.liveUrl) frontmatter.liveUrl = content.liveUrl;
			if (content.imageUrl) frontmatter.imageUrl = content.imageUrl;
			if (content.technologies && content.technologies.length > 0) {
				frontmatter.technologies = content.technologies;
			}
			if (content.featured) frontmatter.featured = content.featured;
		}

		if (includeMetadata) {
			frontmatter.createdAt = content.createdAt.toISOString();
			frontmatter.updatedAt = content.updatedAt.toISOString();
		}

		// 生成frontmatter YAML
		const frontmatterYaml = Object.entries(frontmatter)
			.map(([key, value]) => {
				if (Array.isArray(value)) {
					return `${key}:\n${value.map((v) => `  - ${v}`).join("\n")}`;
				}
				return `${key}: ${JSON.stringify(value)}`;
			})
			.join("\n");

		return `---\n${frontmatterYaml}\n---\n\n${content.mdxContent || ""}`;
	}

	/**
	 * 生成唯一slug
	 */
	private async generateUniqueSlug(
		baseSlug: string,
		contentType: "posts" | "projects",
	): Promise<string> {
		let counter = 1;
		let slug = baseSlug;

		while (await this.checkContentExists(slug, contentType)) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		return slug;
	}

	/**
	 * 从文件名生成slug
	 */
	private generateSlugFromFilename(filename: string): string {
		return filename
			.replace(/\.(mdx?|md)$/i, "")
			.toLowerCase()
			.replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	/**
	 * 从标题生成slug
	 */
	private generateSlugFromTitle(title: string): string {
		return this.generateSlug(title);
	}

	/**
	 * 生成slug
	 */
	private generateSlug(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
}

// 导出单例实例
export const contentImportExportService = new ContentImportExportService();
