/**
 * TechStack Component
 * 
 * Displays a collection of technology badges with icons and styling
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * Technology item interface
 */
interface TechItem {
  name: string;
  icon?: string;
  color?: string;
  url?: string;
}

/**
 * TechStack component props
 */
interface TechStackProps {
  /** Array of technology names or objects */
  technologies: (string | TechItem)[];
  /** Display variant */
  variant?: 'default' | 'outline' | 'secondary';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Layout style */
  layout?: 'inline' | 'grid' | 'vertical';
  /** Show icons if available */
  showIcons?: boolean;
  /** Custom className */
  className?: string;
  /** Title for the tech stack */
  title?: string;
}

/**
 * Predefined technology configurations
 */
const TECH_CONFIGS: Record<string, Omit<TechItem, 'name'>> = {
  // Frontend
  'React': { icon: '⚛️', color: 'bg-blue-500' },
  'Vue': { icon: '💚', color: 'bg-green-500' },
  'Angular': { icon: '🅰️', color: 'bg-red-500' },
  'Next.js': { icon: '▲', color: 'bg-black' },
  'Nuxt.js': { icon: '💚', color: 'bg-green-600' },
  'Svelte': { icon: '🧡', color: 'bg-orange-500' },
  
  // Languages
  'TypeScript': { icon: '📘', color: 'bg-blue-600' },
  'JavaScript': { icon: '📜', color: 'bg-yellow-500' },
  'Python': { icon: '🐍', color: 'bg-blue-500' },
  'Java': { icon: '☕', color: 'bg-orange-600' },
  'Go': { icon: '🐹', color: 'bg-cyan-500' },
  'Rust': { icon: '🦀', color: 'bg-orange-700' },
  'C++': { icon: '⚡', color: 'bg-blue-700' },
  'C#': { icon: '💜', color: 'bg-purple-600' },
  'PHP': { icon: '🐘', color: 'bg-indigo-600' },
  'Ruby': { icon: '💎', color: 'bg-red-600' },
  
  // Backend
  'Node.js': { icon: '🟢', color: 'bg-green-600' },
  'Express': { icon: '🚂', color: 'bg-gray-700' },
  'Fastify': { icon: '⚡', color: 'bg-black' },
  'Django': { icon: '🎸', color: 'bg-green-700' },
  'Flask': { icon: '🌶️', color: 'bg-gray-600' },
  'Spring': { icon: '🍃', color: 'bg-green-600' },
  'Laravel': { icon: '🎨', color: 'bg-red-500' },
  
  // Databases
  'MongoDB': { icon: '🍃', color: 'bg-green-600' },
  'PostgreSQL': { icon: '🐘', color: 'bg-blue-600' },
  'MySQL': { icon: '🐬', color: 'bg-orange-500' },
  'Redis': { icon: '🔴', color: 'bg-red-600' },
  'SQLite': { icon: '💾', color: 'bg-blue-500' },
  
  // Cloud & DevOps
  'AWS': { icon: '☁️', color: 'bg-orange-500' },
  'Azure': { icon: '☁️', color: 'bg-blue-600' },
  'GCP': { icon: '☁️', color: 'bg-blue-500' },
  'Docker': { icon: '🐳', color: 'bg-blue-500' },
  'Kubernetes': { icon: '⚓', color: 'bg-blue-600' },
  'Vercel': { icon: '▲', color: 'bg-black' },
  'Netlify': { icon: '🌐', color: 'bg-teal-500' },
  
  // Tools
  'Git': { icon: '📝', color: 'bg-orange-600' },
  'GitHub': { icon: '🐙', color: 'bg-gray-800' },
  'GitLab': { icon: '🦊', color: 'bg-orange-600' },
  'Figma': { icon: '🎨', color: 'bg-purple-500' },
  'Photoshop': { icon: '🎨', color: 'bg-blue-600' },
  
  // CSS Frameworks
  'Tailwind CSS': { icon: '💨', color: 'bg-cyan-500' },
  'Bootstrap': { icon: '🅱️', color: 'bg-purple-600' },
  'Sass': { icon: '💅', color: 'bg-pink-500' },
  'Less': { icon: '📘', color: 'bg-blue-600' },
  
  // Testing
  'Jest': { icon: '🃏', color: 'bg-red-600' },
  'Cypress': { icon: '🌲', color: 'bg-green-600' },
  'Playwright': { icon: '🎭', color: 'bg-green-500' },
  'Vitest': { icon: '⚡', color: 'bg-yellow-500' },
};

/**
 * Get layout classes based on layout prop
 */
function getLayoutClasses(layout: TechStackProps['layout']): string {
  switch (layout) {
    case 'grid':
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2';
    case 'vertical':
      return 'flex flex-col gap-2';
    case 'inline':
    default:
      return 'flex flex-wrap gap-2';
  }
}

/**
 * Get size classes based on size prop
 */
function getSizeClasses(size: TechStackProps['size']): string {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-1';
    case 'lg':
      return 'text-base px-4 py-2';
    case 'md':
    default:
      return 'text-sm px-3 py-1.5';
  }
}

/**
 * Normalize technology input to TechItem
 */
function normalizeTech(tech: string | TechItem): TechItem {
  if (typeof tech === 'string') {
    const config = TECH_CONFIGS[tech] || {};
    return {
      name: tech,
      ...config
    };
  }
  return tech;
}

/**
 * TechStack Component
 */
export function TechStack({
  technologies,
  variant = 'default',
  size = 'md',
  layout = 'inline',
  showIcons = true,
  className = '',
  title,
  ...props
}: TechStackProps) {
  if (!technologies || technologies.length === 0) {
    return null;
  }

  const normalizedTechs = technologies.map(normalizeTech);
  const layoutClasses = getLayoutClasses(layout);
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`my-4 ${className}`} {...props}>
      {title && (
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {title}
        </h4>
      )}
      
      <div className={layoutClasses}>
        {normalizedTechs.map((tech, index) => {
          const BadgeContent = (
            <Badge
              key={index}
              variant={variant}
              className={`
                ${sizeClasses}
                transition-all duration-200 hover:scale-105 hover:shadow-md
                ${tech.color ? `${tech.color} text-white hover:opacity-90` : ''}
              `}
            >
              {showIcons && tech.icon && (
                <span className="mr-1.5" role="img" aria-label={tech.name}>
                  {tech.icon}
                </span>
              )}
              {tech.name}
            </Badge>
          );

          // If tech has URL, wrap in link
          if (tech.url) {
            return (
              <a
                key={index}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                {BadgeContent}
              </a>
            );
          }

          return BadgeContent;
        })}
      </div>
    </div>
  );
}

// Export types
export type { TechStackProps, TechItem };