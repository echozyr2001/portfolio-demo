"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// Import your custom MDX components
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { ImageGallery } from "@/components/mdx/ImageGallery";
import { ProjectCard } from "@/components/mdx/ProjectCard";
import { TechStack } from "@/components/mdx/TechStack";

export interface MDXPreviewProps {
  content: string;
  onError?: (error: Error) => void;
  className?: string;
  showHeader?: boolean;
  enableScrollSync?: boolean;
  onScroll?: (scrollTop: number, scrollHeight: number) => void;
  scrollPosition?: number;
}

export interface PreviewError {
  message: string;
  line?: number;
  column?: number;
  stack?: string;
}

// MDX components mapping
const mdxComponents = {
  CodeBlock,
  ImageGallery,
  ProjectCard,
  TechStack,
  // Add more custom components as needed
  pre: ({ children, ...props }: any) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, ...props }: any) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
      {children}
    </code>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-border" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: any) => (
    <th
      className="border border-border px-4 py-2 bg-muted font-semibold text-left"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="border border-border px-4 py-2" {...props}>
      {children}
    </td>
  ),
  a: ({ children, href, ...props }: any) => (
    <a
      href={href}
      className="text-primary hover:underline inline-flex items-center gap-1"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
      {href?.startsWith("http") && <ExternalLink className="h-3 w-3" />}
    </a>
  ),
};

export const MDXPreview: React.FC<MDXPreviewProps> = ({
  content,
  onError,
  className = "",
  showHeader = true,
  enableScrollSync = true,
  onScroll,
  scrollPosition,
}) => {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PreviewError | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Debounced content processing
  const debouncedContent = useMemo(() => {
    const timeoutId = setTimeout(() => content, 300);
    return () => clearTimeout(timeoutId);
  }, [content]);

  // Process MDX content
  useEffect(() => {
    let isCancelled = false;

    const processMDX = async () => {
      if (!content.trim()) {
        setMdxSource(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const mdxSource = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: "wrap" }],
            ],
            development: process.env.NODE_ENV === "development",
          },
          parseFrontmatter: true,
        });

        if (!isCancelled) {
          setMdxSource(mdxSource);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          const error = err as Error;
          const previewError: PreviewError = {
            message: error.message,
            stack: error.stack,
          };

          // Try to extract line/column info from error message
          const lineMatch = error.message.match(/line (\d+)/i);
          const columnMatch = error.message.match(/column (\d+)/i);

          if (lineMatch) previewError.line = parseInt(lineMatch[1]);
          if (columnMatch) previewError.column = parseInt(columnMatch[1]);

          setError(previewError);
          setMdxSource(null);
          onError?.(error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    processMDX();

    return () => {
      isCancelled = true;
    };
  }, [content, onError]);

  // Handle scroll synchronization
  useEffect(() => {
    if (!enableScrollSync || scrollPosition === undefined) return;

    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const viewport = scrollArea.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = scrollPosition;
      }
    }
  }, [scrollPosition, enableScrollSync]);

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!enableScrollSync || !onScroll) return;

    const target = event.target as HTMLDivElement;
    onScroll(target.scrollTop, target.scrollHeight);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const refreshPreview = () => {
    // Force re-render by updating a key or triggering re-processing
    setMdxSource(null);
    setError(null);
  };

  if (!isVisible) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Preview (Hidden)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVisibility}
              title="Show preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshPreview}
                title="Refresh preview"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVisibility}
                title="Hide preview"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <ScrollArea
          className="h-[600px]"
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          <div className="p-6" ref={contentRef}>
            {error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">Preview Error</div>
                    <div className="text-sm">{error.message}</div>
                    {error.line && (
                      <div className="text-xs text-muted-foreground">
                        Line {error.line}
                        {error.column && `, Column ${error.column}`}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing MDX...
                </div>
              </div>
            ) : mdxSource ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <MDXRemote {...mdxSource} components={mdxComponents} />
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div>Start typing to see preview</div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MDXPreview;
