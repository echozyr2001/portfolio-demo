import { serialize } from "next-mdx-remote/serialize";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
const matter = require("gray-matter");
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { getMDXConfig, securityConfig } from "./mdx-config";
import {
  validateMDXComponents,
  ValidationResult as ComponentValidationResult,
} from "./mdx-component-validator";

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
  type: "syntax" | "component" | "runtime" | "security";
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ComponentRegistration {
  name: string;
  component: any; // Use any to avoid React import issues
  props?: Record<string, any>;
  allowedProps?: string[];
  description?: string;
}

export interface MDXProcessorOptions {
  allowedComponents?: string[];
  sanitizeContent?: boolean;
  enableSyntaxHighlighting?: boolean;
  customComponents?: Record<string, any>;
}

/**
 * MDX Processor class for handling MDX compilation, validation, and component registration
 */
export class MDXProcessor {
  private registeredComponents: Map<string, ComponentRegistration> = new Map();
  private allowedTags: Set<string> = new Set([
    "div",
    "span",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "code",
    "pre",
    "blockquote",
    "strong",
    "em",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
  ]);

  constructor() {
    // Register default components
    this.registerDefaultComponents();

    // Initialize allowed tags from security config
    securityConfig.allowedTags.forEach((tag) => {
      this.allowedTags.add(tag);
    });
  }

  /**
   * Register default MDX components
   */
  private registerDefaultComponents(): void {
    // Register basic components - will be loaded dynamically when needed
    const defaultComponents = [
      "CodeBlock",
      "ImageGallery",
      "ProjectCard",
      "TechStack",
    ];

    defaultComponents.forEach((name) => {
      this.registerComponent({
        name,
        component: null, // Will be loaded dynamically
        description: `Default ${name} component`,
      });
    });
  }

  /**
   * Register a custom component for use in MDX
   */
  registerComponent(registration: ComponentRegistration): void {
    this.registeredComponents.set(registration.name, registration);
  }

  /**
   * Get all registered components
   */
  getRegisteredComponents(): ComponentRegistration[] {
    return Array.from(this.registeredComponents.values());
  }

  /**
   * Get a specific registered component
   */
  getComponent(name: string): ComponentRegistration | undefined {
    return this.registeredComponents.get(name);
  }

  /**
   * Sanitize MDX content for security
   */
  private sanitizeContent(content: string): string {
    // Check content length
    if (content.length > securityConfig.maxContentLength) {
      throw new Error(
        `Content exceeds maximum length of ${securityConfig.maxContentLength} characters`
      );
    }

    // Remove potentially dangerous patterns
    let sanitized = content;
    securityConfig.dangerousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "");
    });

    return sanitized;
  }

  /**
   * Process MDX content with enhanced security and validation
   */
  async compile(
    source: string,
    options: MDXProcessorOptions = {}
  ): Promise<MDXContent> {
    // Merge with default config
    const config = { ...getMDXConfig(), ...options };
    try {
      // Extract frontmatter
      const { data: frontmatter, content } = matter(source);

      // Sanitize content if enabled
      const processedContent = config.sanitizeContent
        ? this.sanitizeContent(content)
        : content;

      // Calculate reading time
      let readingTime;
      try {
        const readingTimeLib = await import("reading-time");
        readingTime = readingTimeLib.default(processedContent);
      } catch {
        // reading-time is optional
      }

      // Prepare components for serialization
      const components = config.customComponents || {};

      // Serialize MDX content
      const mdxSource = await serialize(processedContent, {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            ...(config.enableSyntaxHighlighting ? [rehypeHighlight] : []),
          ],
          development: process.env.NODE_ENV === "development",
        },
        scope: frontmatter,
      });

      return {
        mdxSource,
        frontmatter,
        content: processedContent,
        readingTime,
      };
    } catch (error) {
      const mdxError: MDXError = {
        type: "runtime",
        message:
          error instanceof Error ? error.message : "Unknown compilation error",
        suggestion: "Check MDX syntax and component usage",
      };

      throw new MDXProcessingError("MDX compilation failed", [mdxError]);
    }
  }
}

/**
 * Custom error class for MDX processing errors
 */
export class MDXProcessingError extends Error {
  public errors: MDXError[];

  constructor(message: string, errors: MDXError[] = []) {
    super(message);
    this.name = "MDXProcessingError";
    this.errors = errors;
  }
}

/**
 * Enhanced MDX validation with comprehensive checks
 */
export async function validateMDX(
  source: string,
  processor?: MDXProcessor
): Promise<ValidationResult> {
  const errors: MDXError[] = [];
  const warnings: string[] = [];
  const mdxProcessor = processor || new MDXProcessor();

  try {
    // Extract content for validation
    const { content } = matter(source);

    // Security validation
    const securityErrors = validateSecurity(content);
    errors.push(...securityErrors);

    // Component validation
    const componentErrors = validateComponentUsage(content, mdxProcessor);
    errors.push(...componentErrors);

    // Enhanced component validation with prop checking
    const componentValidation = validateMDXComponents(content);
    componentValidation.errors.forEach((error) => {
      errors.push({
        type: "component",
        message: error.message,
        suggestion: `Check component '${error.component}' usage`,
      });
    });

    componentValidation.warnings.forEach((warning) => {
      warnings.push(warning.message);
    });

    // Syntax validation
    const syntaxErrors = await validateSyntax(content);
    errors.push(...syntaxErrors);

    // Content structure validation
    const structureWarnings = validateStructure(content);
    warnings.push(...structureWarnings);

    // Try to compile to catch runtime errors
    try {
      await mdxProcessor.compile(source);
    } catch (error) {
      if (error instanceof MDXProcessingError) {
        errors.push(...error.errors);
      } else {
        errors.push({
          type: "runtime",
          message:
            error instanceof Error ? error.message : "Unknown runtime error",
          suggestion: "Check MDX syntax and component usage",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push({
      type: "syntax",
      message:
        error instanceof Error ? error.message : "Unknown validation error",
      suggestion: "Check MDX syntax and structure",
    });

    return {
      isValid: false,
      errors,
      warnings,
    };
  }
}

/**
 * Validate component usage in MDX content
 */
function validateComponentUsage(
  content: string,
  processor: MDXProcessor
): MDXError[] {
  const errors: MDXError[] = [];

  // Find all JSX components in the content
  const componentMatches = content.match(/<[A-Z][a-zA-Z0-9]*[\s\S]*?>/g) || [];

  componentMatches.forEach((match) => {
    const componentName = match.match(/<([A-Z][a-zA-Z0-9]*)/)?.[1];
    if (componentName && !processor.getComponent(componentName)) {
      errors.push({
        type: "component",
        message: `Unknown component: ${componentName}`,
        suggestion: `Register the component or use one of: ${processor
          .getRegisteredComponents()
          .map((c) => c.name)
          .join(", ")}`,
      });
    }
  });

  return errors;
}

/**
 * Validate security aspects of MDX content
 */
function validateSecurity(content: string): MDXError[] {
  const errors: MDXError[] = [];

  // Check content length
  if (content.length > securityConfig.maxContentLength) {
    errors.push({
      type: "security",
      message: `Content exceeds maximum length of ${securityConfig.maxContentLength} characters`,
      suggestion: "Reduce content length or split into multiple documents",
    });
  }

  // Check for dangerous patterns using security config
  const patternMessages = [
    { pattern: /javascript:/gi, message: "JavaScript URLs are not allowed" },
    { pattern: /data:text\/html/gi, message: "HTML data URLs are not allowed" },
    { pattern: /vbscript:/gi, message: "VBScript URLs are not allowed" },
    { pattern: /on\w+\s*=/gi, message: "Event handlers are not allowed" },
    { pattern: /<script/gi, message: "Script tags are not allowed" },
    { pattern: /<iframe/gi, message: "Iframe tags are not allowed" },
    { pattern: /<object/gi, message: "Object tags are not allowed" },
    { pattern: /<embed/gi, message: "Embed tags are not allowed" },
    { pattern: /<form/gi, message: "Form tags are not allowed" },
    { pattern: /<input/gi, message: "Input tags are not allowed" },
    { pattern: /<textarea/gi, message: "Textarea tags are not allowed" },
  ];

  patternMessages.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      errors.push({
        type: "security",
        message,
        suggestion: "Remove or replace the dangerous content",
      });
    }
  });

  // Check component count
  const componentCount = (content.match(/<[A-Z][a-zA-Z0-9]*[\s\S]*?>/g) || [])
    .length;
  if (componentCount > securityConfig.maxComponentsPerDocument) {
    errors.push({
      type: "security",
      message: `Too many components (${componentCount}). Maximum allowed: ${securityConfig.maxComponentsPerDocument}`,
      suggestion:
        "Reduce the number of components or split into multiple documents",
    });
  }

  return errors;
}

/**
 * Validate MDX syntax
 */
async function validateSyntax(content: string): Promise<MDXError[]> {
  const errors: MDXError[] = [];

  try {
    // Use unified to parse and validate
    const processor = unified().use(remarkParse);
    await processor.process(content);

    // Check for unclosed JSX tags
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

    // Check for malformed JSX attributes
    const malformedAttrs = content.match(/<[^>]*\s+\w+\s*=\s*[^"'{][^>\s]*/g);
    if (malformedAttrs) {
      errors.push({
        type: "syntax",
        message: "Malformed JSX attributes detected",
        suggestion: "Ensure all attribute values are properly quoted",
      });
    }
  } catch (error) {
    errors.push({
      type: "syntax",
      message: error instanceof Error ? error.message : "Syntax parsing failed",
      suggestion: "Check Markdown and JSX syntax",
    });
  }

  return errors;
}

/**
 * Validate content structure and provide warnings
 */
function validateStructure(content: string): string[] {
  const warnings: string[] = [];

  // Check for code blocks formatting
  if (content.includes("```") && !content.match(/```\w*\n[\s\S]*?\n```/g)) {
    warnings.push("Code blocks may not be properly formatted");
  }

  // Check for heading structure
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  if (headings.length === 0) {
    warnings.push(
      "No headings found - consider adding structure to your content"
    );
  }

  // Check for very long paragraphs
  const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 0);
  const longParagraphs = paragraphs.filter((p) => p.length > 1000);
  if (longParagraphs.length > 0) {
    warnings.push("Some paragraphs are very long - consider breaking them up");
  }

  return warnings;
}

// Create a default processor instance
const defaultProcessor = new MDXProcessor();

/**
 * Process MDX content using the default processor (backward compatibility)
 */
export async function processMDX(
  source: string,
  options?: MDXProcessorOptions
): Promise<MDXContent> {
  return defaultProcessor.compile(source, options);
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
export async function renderMDXToHTML(
  source: string,
  options?: MDXProcessorOptions
): Promise<string> {
  try {
    const { mdxSource } = await defaultProcessor.compile(source, options);

    // For server-side rendering, we would need to use renderToString
    // This is a placeholder implementation
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkStringify);

    const result = await processor.process(source);
    return String(result);
  } catch (error) {
    throw new Error(
      `Failed to render MDX to HTML: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get the default MDX processor instance
 */
export function getDefaultProcessor(): MDXProcessor {
  return defaultProcessor;
}

/**
 * Create a new MDX processor instance
 */
export function createMDXProcessor(): MDXProcessor {
  return new MDXProcessor();
}
