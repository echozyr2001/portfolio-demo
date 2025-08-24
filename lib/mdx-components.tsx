import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

/**
 * Custom CodeBlock component for syntax highlighting
 */
export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const lang = language || className?.replace("language-", "") || "text";

  return (
    <div className="relative">
      <pre
        className={`language-${lang} rounded-lg bg-muted p-4 overflow-x-auto`}
      >
        <code className={`language-${lang}`}>{children}</code>
      </pre>
      {language && (
        <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
          {language}
        </Badge>
      )}
    </div>
  );
}

/**
 * Image Gallery component for displaying multiple images
 */
export function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {images.map((image, index) => (
        <div key={index} className="space-y-2">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </div>
          {image.caption && (
            <p className="text-sm text-muted-foreground text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
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
        className="text-primary hover:underline"
        {...props}
      >
        {children}
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
 * MDX Components registry
 * This object maps component names to their implementations
 */
export const mdxComponents = {
  // Custom components
  CodeBlock,
  ImageGallery,
  ProjectCard,
  TechStack,

  // Enhanced HTML elements
  img: EnhancedImage,
  a: EnhancedLink,

  // You can add more custom components here as needed
  // Example:
  // Callout: ({ children, type = 'info' }) => (
  //   <div className={`callout callout-${type}`}>{children}</div>
  // ),
};

export type MDXComponents = typeof mdxComponents;
