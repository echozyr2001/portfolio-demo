/**
 * MDX Core Processing Service
 *
 * This service provides comprehensive MDX processing capabilities including:
 * - MDX compilation and validation
 * - Custom component registration system
 * - Security handling and content sanitization
 * - Error handling and recovery
 * - Performance optimization
 */

import { serialize } from "next-mdx-remote/serialize";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import matter from "gray-matter";
import readingTime from "reading-time";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { ComponentType } from "react";

// Types and Interfaces
export interface MDXError {
  type: "syntax" | "component" | "runtime" | "security";
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  severity: "error" | "warning" | "info";
}

export interface ValidationResult {
  isValid: boolean;
  errors: MDXError[];
  warnings: MDXError[];
}

export interface MDXCompileOptions {
  enableCodeHighlight?: boolean;
  enableMath?: boolean;
  sanitizeContent?: boolean;
  allowedComponents?: string[];
  theme?: "light" | "dark" | "auto";
  development?: boolean;
}

export interface MDXProcessResult {
  mdxSource: MDXRemoteSerializeResult;
  frontmatter: Record<string, any>;
  readingTime: number;
  wordCount: number;
  excerpt: string;
  metadata: MDXMetadata;
}

export interface MDXMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  publishedAt?: Date;
  updatedAt?: Date;
  author?: string;
  slug?: string;
  featured?: boolean;
  [key: string]: any;
}

export interface ComponentRegistration {
  name: string;
  component: ComponentType<any>;
  props?: Record<string, any>;
  description?: string;
  category?: string;
  security?: {
    allowedProps?: string[];
    sanitizeProps?: boolean;
  };
}

/**
 * Component Registry for managing custom MDX components
 */
export class ComponentRegistry {
  private components = new Map<string, ComponentRegistration>();
  private categories = new Set<string>();

  /**
   * Register a new component
   */
  register(registration: ComponentRegistration): void {
    // Validate component registration
    if (!registration.name || !registration.component) {
      throw new Error("Component name and component are required");
    }

    // Security check - ensure component name is safe
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(registration.name)) {
      throw new Error("Component name must be a valid identifier");
    }

    this.components.set(registration.name, registration);

    if (registration.category) {
      this.categories.add(registration.category);
    }
  }

  /**
   * Get a registered component
   */
  get(name: string): ComponentRegistration | undefined {
    return this.components.get(name);
  }

  /**
   * Get all registered components
   */
  getAll(): ComponentRegistration[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getByCategory(category: string): ComponentRegistration[] {
    return this.getAll().filter((comp) => comp.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(this.categories);
  }

  /**
   * Check if component is registered
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Unregister a component
   */
  unregister(name: string): boolean {
    return this.components.delete(name);
  }

  /**
   * Clear all components
   */
  clear(): void {
    this.components.clear();
    this.categories.clear();
  }

  /**
   * Get component map for MDX rendering
   */
  getComponentMap(): Record<string, ComponentType<any>> {
    const map: Record<string, ComponentType<any>> = {};
    for (const [name, registration] of this.components) {
      map[name] = registration.component;
    }
    return map;
  }
}

/**
 * Security utilities for MDX content
 */
export class MDXSecurity {
  private static readonly DANGEROUS_PATTERNS = [
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /on\w+\s*=/i, // Event handlers
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
  ];

  private static readonly ALLOWED_PROTOCOLS = [
    "http:",
    "https:",
    "mailto:",
    "tel:",
  ];

  /**
   * Sanitize MDX content for security
   */
  static sanitizeContent(content: string): string {
    let sanitized = content;

    // Remove dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, "");
    }

    // Validate URLs in links and images
    sanitized = sanitized.replace(
      /\[([^\]]*)\]\(([^)]+)\)/g,
      (match, text, url) => {
        if (this.isValidUrl(url)) {
          return match;
        }
        return `[${text}](#invalid-url)`;
      }
    );

    return sanitized;
  }

  /**
   * Validate if URL is safe
   */
  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return this.ALLOWED_PROTOCOLS.includes(parsed.protocol);
    } catch {
      // Relative URLs are allowed
      return !url.startsWith("javascript:") && !url.startsWith("data:");
    }
  }

  /**
   * Validate component usage in MDX
   */
  static validateComponentUsage(
    content: string,
    allowedComponents: string[]
  ): MDXError[] {
    const errors: MDXError[] = [];
    const componentPattern = /<(\w+)(?:\s|>|\/)/g;
    let match;

    while ((match = componentPattern.exec(content)) !== null) {
      const componentName = match[1];

      // Skip HTML elements
      if (componentName.toLowerCase() === componentName) {
        continue;
      }

      if (!allowedComponents.includes(componentName)) {
        errors.push({
          type: "security",
          message: `Component '${componentName}' is not allowed`,
          severity: "error",
          suggestion: `Use one of the allowed components: ${allowedComponents.join(", ")}`,
        });
      }
    }

    return errors;
  }
}

/**
 * Main MDX Core Processor
 */
export class MDXCoreProcessor {
  private componentRegistry: ComponentRegistry;
  private defaultOptions: MDXCompileOptions;

  constructor(options: Partial<MDXCompileOptions> = {}) {
    this.componentRegistry = new ComponentRegistry();
    this.defaultOptions = {
      enableCodeHighlight: true,
      enableMath: false,
      sanitizeContent: true,
      allowedComponents: [],
      theme: "auto",
      development: process.env.NODE_ENV === "development",
      ...options,
    };
  }

  /**
   * Get the component registry
   */
  getComponentRegistry(): ComponentRegistry {
    return this.componentRegistry;
  }

  /**
   * Compile MDX content to serialized format
   */
  async compile(
    source: string,
    options: Partial<MDXCompileOptions> = {}
  ): Promise<MDXProcessResult> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Security: Sanitize content if enabled
      let processedSource = source;
      if (opts.sanitizeContent) {
        processedSource = MDXSecurity.sanitizeContent(source);
      }

      // Extract frontmatter and content
      const { frontmatter, content } = this.extractFrontmatter(processedSource);

      // Calculate metadata
      const readingTimeResult = this.calculateReadingTime(content);
      const wordCount = this.calculateWordCount(content);
      const excerpt = this.generateExcerpt(content);
      const metadata = this.processMetadata(frontmatter);

      // Configure plugins
      const remarkPlugins = [
        remarkGfm,
        remarkFrontmatter,
        remarkMdxFrontmatter,
      ];

      const rehypePlugins: any[] = [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ];

      // Add code highlighting if enabled
      if (opts.enableCodeHighlight) {
        try {
          const { default: rehypeHighlight } = await import("rehype-highlight");
          rehypePlugins.push(rehypeHighlight);
        } catch (error) {
          console.warn("Failed to load rehype-highlight:", error);
        }
      }

      // Serialize MDX
      const mdxSource = await serialize(processedSource, {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins,
          rehypePlugins,
        },
      });

      return {
        mdxSource,
        frontmatter,
        readingTime: readingTimeResult,
        wordCount,
        excerpt,
        metadata,
      };
    } catch (error) {
      throw this.handleCompileError(error);
    }
  }

  /**
   * Validate MDX content
   */
  async validate(
    source: string,
    options: Partial<MDXCompileOptions> = {}
  ): Promise<ValidationResult> {
    const opts = { ...this.defaultOptions, ...options };
    const errors: MDXError[] = [];
    const warnings: MDXError[] = [];

    try {
      // Security validation
      if (opts.sanitizeContent && opts.allowedComponents) {
        const securityErrors = MDXSecurity.validateComponentUsage(
          source,
          opts.allowedComponents
        );
        errors.push(...securityErrors);
      }

      // Syntax validation - try to compile
      await this.compile(source, { ...opts, sanitizeContent: false });

      // Check for potential issues
      const potentialIssues = this.checkForPotentialIssues(source);
      warnings.push(...potentialIssues);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      const mdxError = this.handleCompileError(error);
      errors.push(mdxError);

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
  private extractFrontmatter(source: string): {
    frontmatter: Record<string, any>;
    content: string;
  } {
    try {
      const { data, content } = matter(source);
      return { frontmatter: data, content };
    } catch (error) {
      console.warn("Failed to parse frontmatter:", error);
      return this.parseFrontmatterFallback(source);
    }
  }

  /**
   * Fallback frontmatter parser when gray-matter is not available
   */
  private parseFrontmatterFallback(source: string): {
    frontmatter: Record<string, any>;
    content: string;
  } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = source.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, content: source };
    }

    const frontmatterText = match[1];
    const content = match[2];
    const frontmatter: Record<string, any> = {};

    // Simple YAML-like parsing
    const lines = frontmatterText.split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value: any = line.slice(colonIndex + 1).trim();

        // Remove quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Parse arrays
        if (value.startsWith("[") && value.endsWith("]")) {
          try {
            value = JSON.parse(value);
          } catch {
            // Keep as string if JSON parsing fails
          }
        }

        frontmatter[key] = value;
      }
    }

    return { frontmatter, content };
  }

  /**
   * Calculate reading time
   */
  private calculateReadingTime(content: string): number {
    try {
      const result = readingTime(content);
      return Math.ceil(result.minutes);
    } catch (error) {
      console.warn("Failed to calculate reading time:", error);
      // Fallback: simple calculation (average 200 words per minute)
      const wordCount = this.calculateWordCount(content);
      return Math.max(1, Math.ceil(wordCount / 200));
    }
  }

  /**
   * Calculate word count
   */
  private calculateWordCount(content: string): number {
    try {
      const cleanContent = content
        .replace(/```[\s\S]*?```/g, "") // Remove code blocks
        .replace(/`[^`]*`/g, "") // Remove inline code
        .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
        .replace(/\[.*?\]\(.*?\)/g, "$1") // Keep link text
        .replace(/[#*_~`]/g, "") // Remove markdown syntax
        .replace(/\s+/g, " ")
        .trim();

      // Count Chinese characters and English words
      const chineseChars = cleanContent.match(/[\u4e00-\u9fff]/g) || [];
      const englishWords = cleanContent.match(/\b[a-zA-Z]+\b/g) || [];

      return chineseChars.length + englishWords.length;
    } catch {
      return 0;
    }
  }

  /**
   * Generate excerpt
   */
  private generateExcerpt(content: string, maxLength: number = 200): string {
    try {
      const cleanContent = content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]*`/g, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "$1")
        .replace(/[#*_~]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanContent.length <= maxLength) {
        return cleanContent;
      }

      const truncated = cleanContent.substring(0, maxLength);
      const lastSpaceIndex = truncated.lastIndexOf(" ");

      if (lastSpaceIndex > maxLength * 0.8) {
        return truncated.substring(0, lastSpaceIndex) + "...";
      }

      return truncated + "...";
    } catch {
      return "";
    }
  }

  /**
   * Process metadata from frontmatter
   */
  private processMetadata(frontmatter: Record<string, any>): MDXMetadata {
    const metadata: MDXMetadata = { ...frontmatter };

    // Process dates
    if (metadata.publishedAt && typeof metadata.publishedAt === "string") {
      metadata.publishedAt = new Date(metadata.publishedAt);
    }
    if (metadata.updatedAt && typeof metadata.updatedAt === "string") {
      metadata.updatedAt = new Date(metadata.updatedAt);
    }

    // Process tags - handle both string and array formats
    if (frontmatter.tags && typeof frontmatter.tags === "string") {
      metadata.tags = frontmatter.tags
        .split(",")
        .map((tag: string) => tag.trim());
    } else if (Array.isArray(frontmatter.tags)) {
      metadata.tags = frontmatter.tags;
    }

    return metadata;
  }

  /**
   * Check for potential issues in MDX content
   */
  private checkForPotentialIssues(source: string): MDXError[] {
    const warnings: MDXError[] = [];

    // Check for missing alt text in images
    const imagePattern = /!\[[^\]]*\]\([^)]+\)/g;
    const images = source.match(imagePattern) || [];
    for (const image of images) {
      if (image.startsWith("![]")) {
        warnings.push({
          type: "component",
          message: "Image missing alt text",
          severity: "warning",
          suggestion: "Add descriptive alt text for accessibility",
        });
      }
    }

    // Check for very long lines
    const lines = source.split("\n");
    lines.forEach((line, index) => {
      if (line.length > 120) {
        warnings.push({
          type: "syntax",
          message: `Line ${index + 1} is very long (${line.length} characters)`,
          line: index + 1,
          severity: "info",
          suggestion: "Consider breaking long lines for better readability",
        });
      }
    });

    return warnings;
  }

  /**
   * Handle compilation errors
   */
  private handleCompileError(error: any): MDXError {
    if (error.name === "SyntaxError" || error.reason) {
      return {
        type: "syntax",
        message: error.message || error.reason || "MDX syntax error",
        line: error.line,
        column: error.column,
        severity: "error",
        suggestion:
          "Check your MDX syntax for missing closing tags or invalid JSX",
      };
    }

    if (error.message?.includes("Component")) {
      return {
        type: "component",
        message: error.message,
        severity: "error",
        suggestion:
          "Ensure all components are properly imported and registered",
      };
    }

    return {
      type: "runtime",
      message: error.message || "Unknown MDX compilation error",
      severity: "error",
      suggestion: "Please check your MDX content for errors",
    };
  }
}

// Export singleton instance
export const mdxCoreProcessor = new MDXCoreProcessor();

// Export component registry instance
export const componentRegistry = mdxCoreProcessor.getComponentRegistry();
