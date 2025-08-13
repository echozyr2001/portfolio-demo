import { serialize } from "next-mdx-remote/serialize";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import matter from "gray-matter";
import readingTime from "reading-time";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

/**
 * MDX处理器配置选项
 */
interface MDXProcessorOptions {
	enableCodeHighlight?: boolean;
	enableMath?: boolean;
	customComponents?: Record<string, React.ComponentType>;
	shikiTheme?: string;
	shikiLangs?: string[];
}

/**
 * MDX处理结果
 */
interface MDXProcessResult {
	mdxSource: MDXRemoteSerializeResult;
	frontmatter: Record<string, any>;
	readingTime: number;
	wordCount: number;
	excerpt: string;
}

/**
 * 元数据提取结果
 */
interface MDXMetadata {
	frontmatter: Record<string, any>;
	readingTime: number;
	wordCount: number;
	excerpt: string;
	content: string;
}

/**
 * MDX处理器类
 * 提供MDX内容的序列化、解析和元数据提取功能
 *
 * 基于 Shiki Next.js 集成最佳实践：
 * - 使用 @shikijs/rehype 进行自动语法高亮
 * - 支持服务端渲染和客户端水合
 * - 推荐在 Serverless Runtime 中使用
 */
export class MDXProcessor {
	/**
	 * 序列化MDX内容为可渲染的格式
	 *
	 * 使用 @shikijs/rehype 进行自动语法高亮，无需手动管理 highlighter 实例
	 * 支持主题切换和多种编程语言
	 */
	async serialize(
		mdxContent: string,
		options: MDXProcessorOptions = {},
	): Promise<MDXProcessResult> {
		const { enableCodeHighlight = true, shikiTheme = "github-dark" } = options;

		// 解析frontmatter和内容
		const { frontmatter, content } = this.extractFrontmatter(mdxContent);

		// 计算阅读时间和字数
		const readingTimeResult = this.calculateReadingTime(content);
		const wordCount = this.calculateWordCount(content);
		const excerpt = this.generateExcerpt(content);

		try {
			// 配置remark插件
			const remarkPlugins = [
				remarkGfm,
				remarkFrontmatter,
				remarkMdxFrontmatter,
			];

			// 配置rehype插件
			const rehypePlugins = [];

			// 如果启用代码高亮，添加Shiki插件
			if (enableCodeHighlight) {
				const { default: rehypeShiki } = await import("@shikijs/rehype");
				rehypePlugins.push([
					rehypeShiki,
					{
						theme: shikiTheme,
						// 支持双主题模式
						themes: {
							light: "github-light",
							dark: shikiTheme,
						},
					},
				] as any);
			}

			// 序列化MDX内容
			const mdxSource = await serialize(mdxContent, {
				parseFrontmatter: true,
				mdxOptions: {
					remarkPlugins,
					rehypePlugins,
					development: process.env.NODE_ENV === "development",
				},
			});

			return {
				mdxSource,
				frontmatter,
				readingTime: readingTimeResult,
				wordCount,
				excerpt,
			};
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error("MDX serialization error:", error);
			throw new Error(`Failed to serialize MDX content: ${errorMessage}`);
		}
	}

	/**
	 * 提取frontmatter和内容
	 */
	extractFrontmatter(mdxContent: string): {
		frontmatter: Record<string, any>;
		content: string;
	} {
		try {
			const { data, content } = matter(mdxContent);
			return {
				frontmatter: data,
				content,
			};
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error("Frontmatter parsing error:", errorMessage);
			return {
				frontmatter: {},
				content: mdxContent,
			};
		}
	}

	/**
	 * 计算阅读时间（分钟）
	 */
	calculateReadingTime(content: string): number {
		try {
			const result = readingTime(content);
			return Math.ceil(result.minutes);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error("Reading time calculation error:", errorMessage);
			return 1; // 默认1分钟
		}
	}

	/**
	 * 计算字数
	 */
	calculateWordCount(content: string): number {
		try {
			// 移除Markdown语法和空白字符，然后计算字数
			const cleanContent = content
				.replace(/```[\s\S]*?```/g, "") // 移除代码块
				.replace(/`[^`]*`/g, "") // 移除行内代码
				.replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
				.replace(/\[.*?\]\(.*?\)/g, "$1") // 保留链接文本，移除URL
				.replace(/[#*_~`]/g, "") // 移除Markdown标记
				.replace(/\s+/g, " ") // 标准化空白字符
				.trim();

			// 对于中文内容，按字符计算；对于英文内容，按单词计算
			const chineseChars = cleanContent.match(/[\u4e00-\u9fff]/g) || [];
			const englishWords = cleanContent.match(/\b[a-zA-Z]+\b/g) || [];

			return chineseChars.length + englishWords.length;
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error("Word count calculation error:", errorMessage);
			return 0;
		}
	}

	/**
	 * 生成摘要
	 */
	generateExcerpt(content: string, maxLength: number = 200): string {
		try {
			// 移除Markdown语法
			const cleanContent = content
				.replace(/```[\s\S]*?```/g, "") // 移除代码块
				.replace(/`[^`]*`/g, "") // 移除行内代码
				.replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
				.replace(/\[.*?\]\(.*?\)/g, "$1") // 保留链接文本
				.replace(/[#*_~]/g, "") // 移除Markdown标记
				.replace(/\s+/g, " ") // 标准化空白字符
				.trim();

			if (cleanContent.length <= maxLength) {
				return cleanContent;
			}

			// 在单词边界处截断
			const truncated = cleanContent.substring(0, maxLength);
			const lastSpaceIndex = truncated.lastIndexOf(" ");

			if (lastSpaceIndex > maxLength * 0.8) {
				return truncated.substring(0, lastSpaceIndex) + "...";
			}

			return truncated + "...";
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error("Excerpt generation error:", errorMessage);
			return "";
		}
	}

	/**
	 * 提取所有元数据（不进行序列化）
	 */
	extractMetadata(mdxContent: string): MDXMetadata {
		const { frontmatter, content } = this.extractFrontmatter(mdxContent);
		const readingTimeResult = this.calculateReadingTime(content);
		const wordCount = this.calculateWordCount(content);
		const excerpt = this.generateExcerpt(content);

		return {
			frontmatter,
			readingTime: readingTimeResult,
			wordCount,
			excerpt,
			content,
		};
	}

	/**
	 * 验证MDX内容是否有效
	 */
	async validateMDX(
		mdxContent: string,
	): Promise<{ isValid: boolean; error?: string }> {
		try {
			await this.serialize(mdxContent, { enableCodeHighlight: false });
			return { isValid: true };
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			return {
				isValid: false,
				error: errorMessage,
			};
		}
	}

	/**
	 * 清理资源
	 *
	 * 注意：使用 @shikijs/rehype 时，highlighter 由插件内部管理，
	 * 无需手动清理资源
	 */
	dispose(): void {
		// 使用 @shikijs/rehype 时无需手动清理
		console.log("MDX Processor disposed");
	}
}

// 导出单例实例
export const mdxProcessor = new MDXProcessor();

// 导出类型
export type { MDXProcessorOptions, MDXProcessResult, MDXMetadata };
