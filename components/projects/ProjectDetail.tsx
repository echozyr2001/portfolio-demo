"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Star,
  Calendar,
  ImageIcon,
} from "lucide-react";
import { mdxComponents } from "@/lib/mdx-components";
import { processMDX } from "@/lib/mdx";
import type { MDXContent } from "@/lib/mdx";
import { ProjectCMS } from "@/app/(frontend)/types";

interface ProjectDetailProps {
  project: ProjectCMS;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [mdxContent, setMdxContent] = useState<MDXContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const compileMDX = async () => {
      try {
        setLoading(true);
        const compiled = await processMDX(project.description);
        setMdxContent(compiled);
      } catch (err) {
        console.error("Error compiling MDX:", err);
        setError("Failed to load project description");
      } finally {
        setLoading(false);
      }
    };

    compileMDX();
  }, [project.description]);

  // Utility function moved outside component scope
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null && project.images) {
      setSelectedImageIndex((selectedImageIndex + 1) % project.images.length);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && project.images) {
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? project.images.length - 1
          : selectedImageIndex - 1
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex !== null) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-8 w-1/3"></div>
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Project
          </h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/projects">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-6xl mx-auto px-4 md:px-8 py-16">
      {/* Back to Projects Link */}
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

      {/* Project Header */}
      <header className="mb-12">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-[#2C2A25] mb-4 leading-tight">
              {project.title}
              {project.featured && (
                <Badge className="ml-4 bg-yellow-500 text-yellow-900 border-yellow-600">
                  <Star className="h-4 w-4 mr-1" />
                  Featured
                </Badge>
              )}
            </h1>

            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {project.shortDescription}
            </p>
          </div>
        </div>

        {/* Project Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(project.createdAt)}</span>
          </div>

          {project.technologies && project.technologies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Technologies:</span>
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((techObj, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {techObj.technology}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {project.projectUrl && (
            <Button
              asChild
              className="rounded-full bg-[#A2ABB1] text-white hover:bg-[#8A9AA3]"
            >
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live Project
              </a>
            </Button>
          )}

          {project.githubUrl && (
            <Button
              variant="outline"
              asChild
              className="rounded-full border-[#A2ABB1] text-[#A2ABB1] hover:bg-[#A2ABB1] hover:text-white"
            >
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                View Source Code
              </a>
            </Button>
          )}
        </div>

        {/* Featured Image */}
        {project.featuredImage && (
          <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
            <Image
              src={project.featuredImage.url}
              alt={project.featuredImage.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </header>

      {/* Project Description */}
      <div className="prose prose-lg max-w-none mb-12">
        {mdxContent ? (
          <MDXRemote {...mdxContent.mdxSource} components={mdxComponents} />
        ) : (
          <div className="whitespace-pre-wrap">{project.description}</div>
        )}
      </div>

      {/* Project Gallery */}
      {project.images && project.images.length > 0 && (
        <>
          <Separator className="my-12" />

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="h-5 w-5 text-[#A2ABB1]" />
              <h2 className="text-2xl font-semibold text-[#2C2A25]">
                Project Gallery
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.images.map((imageObj, index) => (
                <Card
                  key={index}
                  className="overflow-hidden cursor-pointer group"
                >
                  <div
                    className="relative aspect-video overflow-hidden"
                    onClick={() => openLightbox(index)}
                  >
                    <Image
                      src={imageObj.image.url}
                      alt={imageObj.image.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                  {imageObj.caption && (
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">
                        {imageObj.caption}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        </>
      )}

      <Separator className="my-12" />

      {/* Navigation */}
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

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && project.images && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={project.images[selectedImageIndex].image.url}
              alt={project.images[selectedImageIndex].image.alt}
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
            {project.images.length > 1 && (
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
            {project.images[selectedImageIndex].caption && (
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 px-4 py-2 rounded">
                {project.images[selectedImageIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
