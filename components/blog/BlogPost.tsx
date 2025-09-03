"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { mdxComponents } from "@/lib/mdx-components";
import { processMDX } from "@/lib/mdx";
import type { MDXContent } from "@/lib/mdx";
import { BlogPost as BlogPostType } from "@/app/(frontend)/types";

interface BlogPostProps {
  post: BlogPostType;
}

export function BlogPost({ post }: BlogPostProps) {
  const [mdxContent, setMdxContent] = useState<MDXContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const compileMDX = async () => {
      try {
        setLoading(true);
        const compiled = await processMDX(post.content);
        setMdxContent(compiled);
      } catch (err) {
        console.error("Error compiling MDX:", err);
        setError("Failed to load post content");
      } finally {
        setLoading(false);
      }
    };

    compileMDX();
  }, [post.content]);

  // Utility functions moved outside component scope
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post.title;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8 w-1/3"></div>
          <div className="aspect-video bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Post
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 md:px-8 py-16">
      {/* Back to Blog Link */}
      <div className="mb-8">
        <Link href="/blog">
          <Button
            variant="ghost"
            className="text-[#A2ABB1] hover:text-[#8A9AA3]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Post Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C2A25] mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{calculateReadingTime(post.content)}</span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tagObj, index) => (
              <Badge key={index} variant="outline">
                {tagObj.tag}
              </Badge>
            ))}
          </div>
        )}

        {post.featuredImage && (
          <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </header>

      {/* Post Content */}
      <div className="prose prose-lg max-w-none mb-12">
        {mdxContent ? (
          <MDXRemote {...mdxContent.mdxSource} components={mdxComponents} />
        ) : (
          <div className="whitespace-pre-wrap">{post.content}</div>
        )}
      </div>

      <Separator className="my-12" />

      {/* Share Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-[#2C2A25] mb-2">
            Share this post
          </h3>
          <p className="text-gray-600 text-sm">
            Found this helpful? Share it with others!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="rounded-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Copy Link
          </Button>

          <Button variant="outline" size="sm" asChild className="rounded-full">
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </a>
          </Button>

          <Button variant="outline" size="sm" asChild className="rounded-full">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </a>
          </Button>

          <Button variant="outline" size="sm" asChild className="rounded-full">
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </a>
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Navigation to other posts could be added here */}
      <div className="text-center">
        <Link href="/blog">
          <Button
            variant="default"
            className="rounded-full bg-[#A2ABB1] text-white px-8 h-12 hover:bg-[#8A9AA3] transition-colors duration-300"
          >
            View All Posts
          </Button>
        </Link>
      </div>
    </article>
  );
}
