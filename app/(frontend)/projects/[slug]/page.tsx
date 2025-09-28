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
import { ProjectGallery } from '@/components/projects/ProjectGallery';
import { ArrowLeft, ExternalLink, Github, Star, Calendar } from 'lucide-react';
import { getAllProjectSlugs, getProjectData } from '@/lib/projects';
import { mdxComponents } from '@/lib/mdx-components';

interface ProjectPageProps {
  params: Promise<{ slug: string; }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { frontmatter } = await getProjectData(slug);

  if (!frontmatter) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${frontmatter.title} | Projects`,
    description: frontmatter.shortDescription,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.shortDescription,
      type: 'website',
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
      description: frontmatter.shortDescription,
      images: frontmatter.featuredImage ? [frontmatter.featuredImage] : [],
    },
  };
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const { frontmatter, content } = await getProjectData(slug);

  if (!content) {
    notFound();
  }

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
        <article className="max-w-6xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-8">
            <Link href="/projects">
              <Button
                variant="ghost"
                className="text-[#A2ABB1] hover:text-[#8A9AA3]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>

          <header className="mb-12">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-[#2C2A25] mb-4 leading-tight">
                  {frontmatter.title}
                  {frontmatter.featured && (
                    <Badge className="ml-4 bg-yellow-500 text-yellow-900 border-yellow-600">
                      <Star className="h-4 w-4 mr-1" />
                      Featured
                    </Badge>
                  )}
                </h1>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {frontmatter.shortDescription}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
              {frontmatter.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(frontmatter.date)}</span>
                </div>
              )}
              {frontmatter.technologies && frontmatter.technologies.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Technologies:</span>
                  <div className="flex flex-wrap gap-1">
                    {frontmatter.technologies.map((tech: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              {frontmatter.projectUrl && (
                <Button
                  asChild
                  className="rounded-full bg-[#A2ABB1] text-white hover:bg-[#8A9AA3]"
                >
                  <a
                    href={frontmatter.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Project
                  </a>
                </Button>
              )}
              {frontmatter.githubUrl && (
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
                >
                  <a
                    href={frontmatter.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    View Source Code
                  </a>
                </Button>
              )}
            </div>

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

          <div className="prose prose-lg max-w-none mb-12 text-gray-800 prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900">
            <MDXRemote source={content} components={mdxComponents} />
          </div>

          {frontmatter.images && frontmatter.images.length > 0 && (
            <>
              <Separator className="my-12" />
              <ProjectGallery images={frontmatter.images} />
            </> 
          )}

          <Separator className="my-12" />

          <div className="text-center">
            <Link href="/projects">
              <Button
                variant="default"
                className="rounded-full bg-[#A2ABB1] text-white px-8 h-12 hover:bg-[#8A9AA3] transition-colors duration-300"
              >
                View All Projects
              </Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
