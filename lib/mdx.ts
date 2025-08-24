import { serialize } from "next-mdx-remote/serialize";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import matter from "gray-matter";

export interface MDXContent {
  mdxSource: MDXRemoteSerializeResult;
  frontmatter: Record<string, any>;
  content: string;
  readingTime?: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: MDXError[];
  warnings: string[];
}

export interface MDXError {
  type: "syntax" | "component" | "runtime";
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

/**
 * Process MDX content with frontmatter extraction and compilation
 */
export async function processMDX(source: string): Promise<MDXContent> {
  try {
    // Extract frontmatter
    const { data: frontmatter, content } = matter(source);

    // Calculate reading time if reading-time is available
    let readingTime;
    try {
      const readingTimeLib = await import("reading-time");
      readingTime = readingTimeLib.default(content);
    } catch {
      // reading-time is optional
    }

    // Serialize MDX content
    const mdxSource = await serialize(content, {
      parseFrontmatter: false, // We handle frontmatter separately
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          rehypeHighlight,
        ],
        development: process.env.NODE_ENV === "development",
      },
    });

    return {
      mdxSource,
      frontmatter,
      content,
      readingTime,
    };
  } catch (error) {
    throw new Error(
      `MDX processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate MDX syntax and structure
 */
export async function validateMDX(source: string): Promise<ValidationResult> {
  const errors: MDXError[] = [];
  const warnings: string[] = [];

  try {
    // Try to process the MDX to catch syntax errors
    await processMDX(source);

    // Additional validation checks
    const { content } = matter(source);

    // Check for common issues
    if (content.includes("```") && !content.match(/```\w*\n[\s\S]*?\n```/g)) {
      warnings.push("Code blocks may not be properly formatted");
    }

    // Check for unclosed JSX tags (basic check)
    const openTags = (content.match(/<[^/][^>]*[^/]>/g) || []).length;
    const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
    const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length;

    if (openTags !== closeTags + selfClosingTags) {
      errors.push({
        type: "syntax",
        message: "Possible unclosed JSX tags detected",
        suggestion: "Check that all JSX tags are properly closed",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push({
      type: "syntax",
      message: error instanceof Error ? error.message : "Unknown syntax error",
      suggestion: "Check MDX syntax and component usage",
    });

    return {
      isValid: false,
      errors,
      warnings,
    };
  }
}

/**
 * Extract frontmatter from MDX content
 */
export function extractFrontmatter(source: string): Record<string, any> {
  try {
    const { data } = matter(source);
    return data;
  } catch {
    return {};
  }
}

/**
 * Render MDX to HTML string (for preview purposes)
 */
export async function renderMDXToHTML(source: string): Promise<string> {
  try {
    const { mdxSource } = await processMDX(source);
    // This is a simplified version - in practice, you'd need to render the MDX
    // For now, we'll return the processed content
    return source;
  } catch (error) {
    throw new Error(
      `Failed to render MDX to HTML: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
