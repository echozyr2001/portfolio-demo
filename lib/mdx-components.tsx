'use client';

import React, { useState, useEffect } from 'react';

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Type definitions for MDX components
export interface CodeBlockProps {
  language?: string;
  children: string;
  className?: string;
}

export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
}

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

export interface CalloutProps {
  type?: "info" | "warning" | "error" | "success";
  title?: string;
  children: React.ReactNode;
}

export interface TabsComponentProps {
  defaultValue?: string;
  children: React.ReactNode;
}

export interface TabProps {
  value: string;
  label: string;
  children: React.ReactNode;
}

export interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
}

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  controls?: boolean;
}

export interface QuoteProps {
  author?: string;
  source?: string;
  children: React.ReactNode;
}

export interface TimelineProps {
  items: Array<{
    date: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
  }>;
}

export interface StatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
}

export interface AccordionProps {
  items: Array<{
    title: string;
    content: React.ReactNode;
  }>;
  type?: "single" | "multiple";
}

export interface FeatureGridProps {
  features: Array<{
    title: string;
    description: string;
    icon?: React.ReactNode;
    link?: string;
  }>;
  columns?: 2 | 3 | 4;
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

export interface CodeSandboxProps {
  id: string;
  title?: string;
  height?: number;
}

export interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

/**
 * Enhanced CodeBlock component with copy functionality and better styling
 */
export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lang = language || className?.replace("language-", "") || "text";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="relative group my-6">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border-b">
        {language && (
          <Badge variant="secondary" className="text-xs">
            {language}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? "已复制!" : "复制"}
        </Button>
      </div>
      <ScrollArea className="max-h-96">
        <pre
          className={`language-${lang} bg-muted p-4 rounded-b-lg overflow-x-auto`}
        >
          <code className={`language-${lang} text-sm`}>{children}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}

/**
 * Enhanced Image Gallery component with lightbox functionality
 */
export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(
        selectedImage === 0 ? images.length - 1 : selectedImage - 1
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        {images.map((image, index) => (
          <div key={index} className="space-y-2">
            <div
              className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  点击查看大图
                </span>
              </div>
            </div>
            {image.caption && (
              <p className="text-sm text-muted-foreground text-center">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              ✕
            </Button>
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  →
                </Button>
              </>
            )}
            {images[selectedImage].caption && (
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 px-4 py-2 rounded">
                {images[selectedImage].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Project Card component for displaying project information
 */
export function ProjectCard({
  title,
  description,
  technologies,
  projectUrl,
  githubUrl,
  image,
}: ProjectCardProps) {
  return (
    <Card className="my-6">
      {image && (
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>

        <TechStack technologies={technologies} />

        <div className="flex gap-2">
          {projectUrl && (
            <Link
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Project
            </Link>
          )}
          {githubUrl && (
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Code
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Tech Stack component for displaying technology badges
 */
export function TechStack({ technologies }: TechStackProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {technologies.map((tech, index) => (
        <Badge key={index} variant="outline">
          {tech}
        </Badge>
      ))}
    </div>
  );
}

/**
 * Enhanced Image component with better styling
 */
function EnhancedImage({
  src,
  alt,
  ...props
}: React.ComponentProps<typeof Image>) {
  return (
    <div className="relative my-6 overflow-hidden rounded-lg">
      <Image src={src} alt={alt} className="w-full h-auto" {...props} />
    </div>
  );
}

/**
 * Enhanced Link component with external link handling
 */
function EnhancedLink({ href, children, ...props }: React.ComponentProps<"a">) {
  const hrefString = href || "#";
  const isExternal = hrefString.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={hrefString}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline inline-flex items-center gap-1"
        {...props}
      >
        {children}
        <span className="text-xs">↗</span>
      </a>
    );
  }

  return (
    <Link href={hrefString} className="text-primary hover:underline">
      {children}
    </Link>
  );
}

/**
 * Callout component for highlighting important information
 */
export function Callout({ type = "info", title, children }: CalloutProps) {
  const variants = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
    error: "border-red-200 bg-red-50 text-red-900",
    success: "border-green-200 bg-green-50 text-green-900",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    error: "❌",
    success: "✅",
  };

  return (
    <Alert className={cn("my-6", variants[type])}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{icons[type]}</span>
        <div className="flex-1">
          {title && <AlertTitle className="mb-2">{title}</AlertTitle>}
          <AlertDescription>{children}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

/**
 * Tabs component for organizing content
 */
export function TabsComponent({ defaultValue, children }: TabsComponentProps) {
  // Extract tab triggers and content from children
  const tabElements = React.Children.toArray(children);
  const tabs = tabElements.filter(
    (child): child is React.ReactElement<TabProps> =>
      React.isValidElement(child) && child.type === Tab
  );

  if (tabs.length === 0) {
    return <div className="my-6">{children}</div>;
  }

  const firstTabValue = tabs[0]?.props?.value || defaultValue;

  return (
    <Tabs defaultValue={firstTabValue} className="my-6">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.props.value} value={tab.props.value}>
            {tab.props.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.props.value}
          value={tab.props.value}
          className="mt-4"
        >
          {tab.props.children}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * Tab component for use within TabsComponent
 */
export function Tab({ value, label, children }: TabProps) {
  return (
    <>
      <TabsTrigger value={value}>{label}</TabsTrigger>
      <TabsContent value={value} className="mt-4">
        {children}
      </TabsContent>
    </>
  );
}

/**
 * Progress bar component
 */
export function ProgressBar({
  value,
  label,
  showValue = true,
}: ProgressBarProps) {
  return (
    <div className="my-6 space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          {showValue && (
            <span className="text-sm text-muted-foreground">{value}%</span>
          )}
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
}

/**
 * Video player component
 */
export function VideoPlayer({
  src,
  poster,
  title,
  controls = true,
}: VideoPlayerProps) {
  return (
    <div className="my-6">
      {title && <h4 className="text-lg font-semibold mb-2">{title}</h4>}
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <video
          src={src}
          poster={poster}
          controls={controls}
          className="w-full h-full object-cover"
        >
          您的浏览器不支持视频播放。
        </video>
      </div>
    </div>
  );
}

/**
 * Quote component for displaying quotes
 */
export function Quote({ author, source, children }: QuoteProps) {
  return (
    <blockquote className="my-6 border-l-4 border-primary pl-6 italic">
      <div className="text-lg mb-2">{children}</div>
      {(author || source) && (
        <footer className="text-sm text-muted-foreground">
          {author && <cite className="font-medium">— {author}</cite>}
          {source && <span className="ml-2">({source})</span>}
        </footer>
      )}
    </blockquote>
  );
}

/**
 * Timeline component for displaying chronological events
 */
export function Timeline({ items }: TimelineProps) {
  return (
    <div className="my-6 space-y-6">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
              {item.icon || index + 1}
            </div>
            {index < items.length - 1 && (
              <div className="w-px h-12 bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{item.title}</h4>
              <Badge variant="outline" className="text-xs">
                {item.date}
              </Badge>
            </div>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Stats component for displaying statistics
 */
export function Stats({ stats }: StatsProps) {
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium mb-1">{stat.label}</div>
            {stat.description && (
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Divider component
 */
export function Divider() {
  return <Separator className="my-8" />;
}

/**
 * Accordion component for collapsible content
 */
export function Accordion({ items, type = "single" }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);

    if (type === "single") {
      // Close all other items
      newOpenItems.clear();
      if (!openItems.has(index)) {
        newOpenItems.add(index);
      }
    } else {
      // Multiple items can be open
      if (openItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
    }

    setOpenItems(newOpenItems);
  };

  return (
    <div className="my-6 space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border rounded-lg">
          <button
            className="w-full px-4 py-3 text-left font-medium hover:bg-muted/50 transition-colors flex items-center justify-between"
            onClick={() => toggleItem(index)}
          >
            <span>{item.title}</span>
            <span
              className={`transform transition-transform ${openItems.has(index) ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>
          {openItems.has(index) && (
            <div className="px-4 pb-4 border-t">
              <div className="pt-3">{item.content}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Feature grid component for showcasing features
 */
export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`my-6 grid gap-6 ${gridCols[columns]}`}>
      {features.map((feature, index) => (
        <Card key={index} className="p-6">
          <div className="space-y-3">
            {feature.icon && <div className="text-2xl">{feature.icon}</div>}
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
            {feature.link && (
              <Link
                href={feature.link}
                className="text-primary hover:underline text-sm font-medium"
              >
                了解更多 →
              </Link>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Comparison table component
 */
export function ComparisonTable({ items, headers }: ComparisonTableProps) {
  const renderCell = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? "✅" : "❌";
    }
    return value;
  };

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr>
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
              {headers.feature}
            </th>
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-center">
              {headers.option1}
            </th>
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-center">
              {headers.option2}
            </th>
            {headers.option3 && (
              <th className="border border-border px-4 py-2 bg-muted font-semibold text-center">
                {headers.option3}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border border-border px-4 py-2 font-medium">
                {item.feature}
              </td>
              <td className="border border-border px-4 py-2 text-center">
                {renderCell(item.option1)}
              </td>
              <td className="border border-border px-4 py-2 text-center">
                {renderCell(item.option2)}
              </td>
              {item.option3 !== undefined && (
                <td className="border border-border px-4 py-2 text-center">
                  {renderCell(item.option3)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * CodeSandbox embed component
 */
export function CodeSandbox({ id, title, height = 500 }: CodeSandboxProps) {
  return (
    <div className="my-6">
      {title && <h4 className="text-lg font-semibold mb-2">{title}</h4>}
      <div className="border rounded-lg overflow-hidden">
        <iframe
          src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
          style={{ width: "100%", height: `${height}px` }}
          title={title || "CodeSandbox Demo"}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}

/**
 * Mermaid diagram component (placeholder - would need mermaid library)
 */
export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  return (
    <div className="my-6">
      {title && <h4 className="text-lg font-semibold mb-2">{title}</h4>}
      <div className="border rounded-lg p-4 bg-muted/20">
        <pre className="text-sm overflow-x-auto">
          <code>{chart}</code>
        </pre>
        <p className="text-xs text-muted-foreground mt-2">
          注意：需要集成 Mermaid 库来渲染图表
        </p>
      </div>
    </div>
  );
}

/**
 * MDX Components registry
 * This object maps component names to their implementations
 */
export const mdxComponents = {
  // Core content components
  CodeBlock,
  ImageGallery,
  ProjectCard,
  TechStack,

  // UI components
  Callout,
  TabsComponent,
  Tab,
  ProgressBar,
  VideoPlayer,
  Quote,
  Timeline,
  Stats,
  Divider,

  // Advanced components
  Accordion,
  FeatureGrid,
  ComparisonTable,
  CodeSandbox,
  MermaidDiagram,

  // Enhanced HTML elements
  img: EnhancedImage,
  a: EnhancedLink,

  // Standard HTML elements with enhanced styling
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-4xl font-bold tracking-tight mb-6 mt-8 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-3xl font-semibold tracking-tight mb-4 mt-8 first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-2xl font-semibold tracking-tight mb-3 mt-6 first:mt-0"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-xl font-semibold mb-2 mt-4 first:mt-0" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 mb-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-primary pl-6 italic my-6 text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border border-border px-4 py-2 bg-muted font-semibold text-left"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-border px-4 py-2" {...props}>
      {children}
    </td>
  ),
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <Separator className="my-8" {...props} />
  ),
};

export type MDXComponents = typeof mdxComponents;
