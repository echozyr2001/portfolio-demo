import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GrainEffect } from '@/components/GrainEffect';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts';
import { mdxComponents } from '@/lib/mdx-components';
import readingTime from 'reading-time';

interface BlogPostPageProps {
  params: { slug: string; };
}

// Generate metadata for the page
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  const { frontmatter } = post;

  return {
    title: frontmatter.title,
    description: frontmatter.excerpt,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.excerpt,
      type: 'article',
      publishedTime: frontmatter.date,
      authors: ['Echo'], // Replace with your name
      images: frontmatter.featuredImage
        ? [
            {
              url: frontmatter.featuredImage,
              alt: frontmatter.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.excerpt,
      images: frontmatter.featuredImage ? [frontmatter.featuredImage] : [],
    },
  };
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map(slug => ({ slug }));
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { frontmatter, content } = post;

  const stats = readingTime(content);

  return (
    <div className="min-h-screen bg-[#D9D5D2] flex flex-col">
      <GrainEffect
        opacity={0.7}
        blendMode="difference"
        zIndex={60}
        grainIntensity={0.1}
      />
      <Header />
      <main className="flex-1 bg-[#F6F4F1]">
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
              {frontmatter.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(frontmatter.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{stats.text}</span>
              </div>
            </div>

            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {frontmatter.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {frontmatter.featuredImage && (
              <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
                <Image
                  src={frontmatter.featuredImage}
                  alt={frontmatter.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-12 text-gray-800 prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900">
            <MDXRemote source={content} components={mdxComponents} />
          </div>

          <Separator className="my-12" />

          {/* Share Section */}
          <ShareButtons title={frontmatter.title} />

          <Separator className="my-12" />

          {/* Navigation */}
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
      </main>
      <Footer />
    </div>
  );
}
