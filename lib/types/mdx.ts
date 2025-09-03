import { MDXRemoteSerializeResult } from "next-mdx-remote";

/**
 * Base content interface for blog posts and projects
 */
export interface BaseContent {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Blog post interface
 */
export interface BlogPost extends BaseContent {
  content: string; // MDX content
  excerpt?: string;
  publishedAt?: Date;
  featuredImage?: MediaFile;
  tags?: string[];
  seo: {
    title?: string;
    description?: string;
  };
}

/**
 * Project interface
 */
export interface Project extends BaseContent {
  description: string; // MDX content
  shortDescription: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  images: MediaFile[];
  featuredImage?: MediaFile;
  featured: boolean;
  order: number;
}

/**
 * Media file interface
 */
export interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  alt: string;
  caption?: string;
  url: string;
  thumbnailURL?: string;
}

/**
 * Processed MDX content
 */
export interface ProcessedMDX {
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

/**
 * MDX validation result
 */
export interface MDXValidationResult {
  isValid: boolean;
  errors: MDXError[];
  warnings: string[];
}

/**
 * MDX error types
 */
export interface MDXError {
  type: "syntax" | "component" | "runtime";
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

/**
 * Editor configuration
 */
export interface EditorSettings {
  theme: "dark" | "light" | "auto";
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  previewMode: "side" | "bottom" | "hidden";
}

/**
 * CMS form data interfaces
 */
export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: "draft" | "published";
  publishedAt?: string;
  featuredImageId?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  status: "draft" | "published";
  featured: boolean;
  order: number;
  featuredImageId?: string;
  imageIds: string[];
}

/**
 * API response types
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Search and filter types
 */
export interface ContentFilters {
  status?: "draft" | "published" | "all";
  tags?: string[];
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "publishedAt";
  sortOrder?: "asc" | "desc";
}

/**
 * Component props for MDX components
 */
export interface MDXComponentProps {
  [key: string]: any;
}

/**
 * Preview system types
 */
export interface PreviewState {
  isVisible: boolean;
  mode: "side" | "bottom" | "fullscreen";
  syncScroll: boolean;
  content: string;
  error?: string;
}

/**
 * File upload types
 */
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  result?: MediaFile;
}
