import React from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Callout } from '@/components/mdx/Callout'

// Custom MDX components that can be used in content
export const MDXComponents = {
  // Enhanced HTML elements
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image 
      src={src || ''} 
      alt={alt || ''} 
      width={800}
      height={400}
      className="rounded-lg shadow-md max-w-full h-auto my-4"
      {...props}
    />
  ),
  
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a 
      href={href}
      className="text-blue-600 hover:text-blue-800 underline transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),

  // Custom components
  CodeBlock: ({ language, children }: { language: string; children: string }) => (
    <div className="my-4">
      <div className="bg-gray-100 px-3 py-1 text-sm text-gray-600 rounded-t-md">
        {language}
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-md overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  ),

  ImageGallery: ({ images }: { images: Array<{ src: string; alt: string; caption?: string }> }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {images.map((image, index) => (
        <Card key={index} className="overflow-hidden">
          <Image 
            src={image.src} 
            alt={image.alt}
            width={400}
            height={192}
            className="w-full h-48 object-cover"
          />
          {image.caption && (
            <CardContent className="p-3">
              <p className="text-sm text-gray-600">{image.caption}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  ),

  TechStack: ({ technologies }: { technologies: string[] }) => (
    <div className="flex flex-wrap gap-2 my-4">
      {technologies.map((tech, index) => (
        <Badge key={index} variant="secondary">
          {tech}
        </Badge>
      ))}
    </div>
  ),

  ProjectCard: ({ 
    title, 
    description, 
    technologies, 
    projectUrl, 
    githubUrl 
  }: {
    title: string
    description: string
    technologies: string[]
    projectUrl?: string
    githubUrl?: string
  }) => (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{description}</p>
        <MDXComponents.TechStack technologies={technologies} />
        <div className="flex gap-2 mt-4">
          {projectUrl && (
            <a 
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Project
            </a>
          )}
          {githubUrl && (
            <a 
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              GitHub
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  ),

  // MDX-specific components
  Callout,
}

export type MDXComponentsType = typeof MDXComponents