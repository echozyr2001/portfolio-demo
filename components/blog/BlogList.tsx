"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import type { PostData } from "@/lib/posts";

interface BlogListProps {
  posts: PostData[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function BlogList({ posts }: BlogListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-[#2C2A25] mb-4">
          No blog posts yet
        </h2>
        <p className="text-gray-600">Check back soon for new content!</p>
      </div>
    );
  }

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="space-y-8">
      {/* Featured Post (First Post) */}
      {featuredPost && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-[#2C2A25] mb-6">
            Featured Post
          </h2>
          <FeaturedPostCard post={featuredPost} />
        </div>
      )}

      {/* Regular Posts Grid */}
      {regularPosts.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-[#2C2A25] mb-6">
            All Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeaturedPostCard({ post }: { post: PostData }) {
  const { frontmatter, slug } = post;

  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="md:flex">
        {frontmatter.featuredImage && (
          <div className="md:w-1/2 relative aspect-video md:aspect-auto">
            <Image
              src={frontmatter.featuredImage}
              alt={frontmatter.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div
          className={`${frontmatter.featuredImage ? "md:w-1/2" : "w-full"} p-8`}
        >
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(frontmatter.date)}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-[#2C2A25] mb-4 hover:text-[#A2ABB1] transition-colors">
            <Link href={`/blog/${slug}`}>{frontmatter.title}</Link>
          </h3>

          {frontmatter.excerpt && (
            <p className="text-gray-600 mb-6 line-clamp-3">
              {frontmatter.excerpt}
            </p>
          )}

          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {frontmatter.tags
                .slice(0, 3)
                .map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          )}

          <Link href={`/blog/${slug}`}>
            <Button
              variant="outline"
              className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
            >
              Read More
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function BlogPostCard({ post }: { post: PostData }) {
  const { frontmatter, slug } = post;

  return (
    <Card className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300 group">
      {frontmatter.featuredImage && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={frontmatter.featuredImage}
            alt={frontmatter.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(frontmatter.date)}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-[#2C2A25] group-hover:text-[#A2ABB1] transition-colors line-clamp-2">
          <Link href={`/blog/${slug}`}>{frontmatter.title}</Link>
        </h3>
      </CardHeader>

      <CardContent className="pt-0">
        {frontmatter.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
            {frontmatter.excerpt}
          </p>
        )}

        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {frontmatter.tags.slice(0, 2).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {frontmatter.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{frontmatter.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        <Link href={`/blog/${slug}`}>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-[#A2ABB1] hover:text-[#8A9AA3] font-medium"
          >
            Read More
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
