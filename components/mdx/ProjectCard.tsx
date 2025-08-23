/**
 * ProjectCard Component
 * 
 * A comprehensive project showcase card for MDX content
 */

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MDXImage } from './MDXImage';
import { TechStack } from './TechStack';

/**
 * Project link interface
 */
interface ProjectLink {
  label: string;
  url: string;
  icon?: React.ReactNode;
  primary?: boolean;
}

/**
 * ProjectCard component props
 */
interface ProjectCardProps {
  /** Project title */
  title: string;
  /** Project description */
  description: string;
  /** Short description for preview */
  shortDescription?: string;
  /** Technologies used */
  technologies: string[];
  /** Project image (media ID or URL) */
  image?: string;
  /** Whether image is a media ID */
  isImageMediaId?: boolean;
  /** Project links */
  links?: ProjectLink[];
  /** Project URL (legacy - use links instead) */
  projectUrl?: string;
  /** GitHub URL (legacy - use links instead) */
  githubUrl?: string;
  /** Project status */
  status?: 'active' | 'completed' | 'archived' | 'in-progress';
  /** Whether project is featured */
  featured?: boolean;
  /** Project category/type */
  category?: string;
  /** Project date */
  date?: string;
  /** Custom className */
  className?: string;
  /** Card variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Whether to show full description */
  showFullDescription?: boolean;
}

/**
 * Get status badge configuration
 */
function getStatusConfig(status: ProjectCardProps['status']) {
  const configs = {
    active: {
      label: 'Active',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    completed: {
      label: 'Completed',
      variant: 'secondary' as const,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    archived: {
      label: 'Archived',
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    },
    'in-progress': {
      label: 'In Progress',
      variant: 'default' as const,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  };

  return configs[status || 'completed'];
}

/**
 * Default project links based on legacy props
 */
function createDefaultLinks(projectUrl?: string, githubUrl?: string): ProjectLink[] {
  const links: ProjectLink[] = [];
  
  if (projectUrl) {
    links.push({
      label: 'View Project',
      url: projectUrl,
      primary: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )
    });
  }
  
  if (githubUrl) {
    links.push({
      label: 'GitHub',
      url: githubUrl,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    });
  }
  
  return links;
}

/**
 * ProjectCard Component
 */
export function ProjectCard({
  title,
  description,
  shortDescription,
  technologies,
  image,
  isImageMediaId = false,
  links,
  projectUrl,
  githubUrl,
  status,
  featured = false,
  category,
  date,
  className = '',
  variant = 'default',
  showFullDescription = false,
  ...props
}: ProjectCardProps) {
  // Combine provided links with legacy URL props
  const allLinks = [
    ...(links || []),
    ...createDefaultLinks(projectUrl, githubUrl)
  ];

  const statusConfig = getStatusConfig(status);
  const displayDescription = showFullDescription ? description : (shortDescription || description);

  // Render based on variant
  if (variant === 'compact') {
    return (
      <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`} {...props}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Image */}
            {image && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {isImageMediaId ? (
                  <MDXImage
                    id={image}
                    alt={title}
                    className="w-full h-full object-cover"
                    inline
                    showThumbnail
                  />
                ) : (
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg leading-tight truncate">{title}</h3>
                {featured && (
                  <Badge variant="secondary" className="flex-shrink-0">
                    ⭐ Featured
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {displayDescription}
              </p>

              {/* Tech stack - show only first few */}
              <TechStack
                technologies={technologies.slice(0, 4)}
                size="sm"
                showIcons={false}
                className="mb-3"
              />

              {/* Links */}
              {allLinks.length > 0 && (
                <div className="flex gap-2">
                  {allLinks.slice(0, 2).map((link, index) => (
                    <Button
                      key={index}
                      variant={link.primary ? "default" : "outline"}
                      size="sm"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.icon}
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`} {...props}>
        {/* Image */}
        {image && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
            {isImageMediaId ? (
              <MDXImage
                id={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                inline
              />
            ) : (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            )}
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{title}</CardTitle>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {category && (
                  <Badge variant="outline">{category}</Badge>
                )}
                {status && (
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                )}
                {date && <span>{date}</span>}
              </div>
            </div>

            {featured && (
              <Badge variant="secondary" className="flex-shrink-0">
                ⭐ Featured
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            {displayDescription}
          </p>

          {/* Tech stack */}
          <TechStack
            technologies={technologies}
            title="Technologies"
            className="mb-6"
          />

          {/* Links */}
          {allLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allLinks.map((link, index) => (
                <Button
                  key={index}
                  variant={link.primary ? "default" : "outline"}
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.icon}
                    {link.label}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`} {...props}>
      {/* Image */}
      {image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
          {isImageMediaId ? (
            <MDXImage
              id={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              inline
            />
          ) : (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          {featured && (
            <Badge variant="secondary" className="flex-shrink-0">
              ⭐ Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {displayDescription}
        </p>

        {/* Tech stack */}
        <TechStack
          technologies={technologies}
          size="sm"
          className="mb-4"
        />

        {/* Status and category */}
        {(status || category) && (
          <div className="flex gap-2 mb-4">
            {status && (
              <Badge className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            )}
            {category && (
              <Badge variant="outline">{category}</Badge>
            )}
          </div>
        )}

        {/* Links */}
        {allLinks.length > 0 && (
          <div className="flex gap-2">
            {allLinks.map((link, index) => (
              <Button
                key={index}
                variant={link.primary ? "default" : "outline"}
                size="sm"
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.icon}
                  {link.label}
                </a>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export types
export type { ProjectCardProps, ProjectLink };