import { ReactNode, ComponentType } from "react";

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Code-related components
export interface CodeBlockProps extends BaseComponentProps {
  language?: string;
  children: string;
}

// Media components
export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  controls?: boolean;
}

// Project and portfolio components
export interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  image?: string;
}

export interface TechStackProps {
  technologies: string[];
}

export interface TimelineProps {
  items: Array<{
    date: string;
    title: string;
    description: string;
    icon?: ReactNode;
  }>;
}

// UI and layout components
export interface CalloutProps extends BaseComponentProps {
  type?: "info" | "warning" | "error" | "success";
  title?: string;
}

export interface TabsComponentProps extends BaseComponentProps {
  defaultValue?: string;
}

export interface TabProps {
  value: string;
  label: string;
  children: ReactNode;
}

export interface AccordionProps {
  items: Array<{
    title: string;
    content: ReactNode;
  }>;
  type?: "single" | "multiple";
}

export interface FeatureGridProps {
  features: Array<{
    title: string;
    description: string;
    icon?: ReactNode;
    link?: string;
  }>;
  columns?: 2 | 3 | 4;
}

// Data display components
export interface StatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}

export interface ComparisonTableProps {
  items: Array<{
    feature: string;
    option1: string | boolean;
    option2: string | boolean;
    option3?: string | boolean;
  }>;
  headers: {
    feature: string;
    option1: string;
    option2: string;
    option3?: string;
  };
}

// Interactive components
export interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
}

export interface QuoteProps extends BaseComponentProps {
  author?: string;
  source?: string;
}

// Embed components
export interface CodeSandboxProps {
  id: string;
  title?: string;
  height?: number;
}

export interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

// Component registry type
export interface MDXComponentRegistry {
  [key: string]: ComponentType<any>;
}

// Enhanced HTML element props
export interface EnhancedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export interface EnhancedLinkProps {
  href?: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

// Component metadata for registration
export interface ComponentMetadata {
  name: string;
  description: string;
  category:
    | "content"
    | "media"
    | "layout"
    | "ui"
    | "data"
    | "interactive"
    | "embed";
  props: Record<
    string,
    {
      type: string;
      required: boolean;
      description: string;
      defaultValue?: any;
    }
  >;
  examples?: Array<{
    title: string;
    code: string;
    description?: string;
  }>;
}

// Export all component types
export type MDXComponentProps =
  | CodeBlockProps
  | ImageGalleryProps
  | VideoPlayerProps
  | ProjectCardProps
  | TechStackProps
  | TimelineProps
  | CalloutProps
  | TabsComponentProps
  | TabProps
  | AccordionProps
  | FeatureGridProps
  | StatsProps
  | ComparisonTableProps
  | ProgressBarProps
  | QuoteProps
  | CodeSandboxProps
  | MermaidDiagramProps;
