/**
 * Quote Component
 * 
 * A stylized quote component for highlighting important text or testimonials
 */

"use client";

import React from 'react';

/**
 * Quote component props
 */
interface QuoteProps {
  /** Quote content */
  children: React.ReactNode;
  /** Quote author */
  author?: string;
  /** Author's title or role */
  authorTitle?: string;
  /** Author's avatar/image */
  authorImage?: string;
  /** Quote source/citation */
  source?: string;
  /** Quote variant */
  variant?: 'default' | 'bordered' | 'minimal' | 'testimonial';
  /** Quote size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Whether to show quote marks */
  showQuoteMarks?: boolean;
}

/**
 * Get size classes
 */
function getSizeClasses(size: QuoteProps['size']) {
  const configs = {
    sm: {
      text: 'text-base',
      quote: 'text-4xl',
      author: 'text-sm',
      padding: 'p-4'
    },
    md: {
      text: 'text-lg',
      quote: 'text-5xl',
      author: 'text-base',
      padding: 'p-6'
    },
    lg: {
      text: 'text-xl',
      quote: 'text-6xl',
      author: 'text-lg',
      padding: 'p-8'
    }
  };

  return configs[size || 'md'];
}

/**
 * Quote marks component
 */
function QuoteMarks({ size, position }: { size: string; position: 'start' | 'end' }) {
  return (
    <span 
      className={`
        ${size} font-serif text-gray-300 dark:text-gray-600 
        ${position === 'start' ? 'mr-2' : 'ml-2'}
      `}
      aria-hidden="true"
    >
      {position === 'start' ? '"' : '"'}
    </span>
  );
}

/**
 * Quote Component
 */
export function Quote({
  children,
  author,
  authorTitle,
  authorImage,
  source,
  variant = 'default',
  size = 'md',
  className = '',
  showQuoteMarks = true,
  ...props
}: QuoteProps) {
  const sizeConfig = getSizeClasses(size);

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <blockquote 
        className={`
          my-6 italic text-gray-700 dark:text-gray-300 
          border-l-4 border-gray-300 dark:border-gray-600 pl-4
          ${sizeConfig.text} ${className}
        `}
        {...props}
      >
        <div className="flex items-start">
          {showQuoteMarks && <QuoteMarks size={sizeConfig.quote} position="start" />}
          <div className="flex-1">
            {children}
            {(author || source) && (
              <footer className={`mt-2 ${sizeConfig.author} text-gray-500 dark:text-gray-400 not-italic`}>
                {author && <cite>{author}</cite>}
                {author && source && ', '}
                {source && <span>{source}</span>}
              </footer>
            )}
          </div>
          {showQuoteMarks && <QuoteMarks size={sizeConfig.quote} position="end" />}
        </div>
      </blockquote>
    );
  }

  // Bordered variant
  if (variant === 'bordered') {
    return (
      <blockquote 
        className={`
          my-8 border border-gray-200 dark:border-gray-700 rounded-lg
          bg-gray-50 dark:bg-gray-800/50 ${sizeConfig.padding} ${className}
        `}
        {...props}
      >
        <div className="text-center">
          {showQuoteMarks && (
            <div className="mb-4">
              <span className={`${sizeConfig.quote} font-serif text-blue-500 dark:text-blue-400`}>
                "
              </span>
            </div>
          )}
          
          <div className={`${sizeConfig.text} italic text-gray-700 dark:text-gray-300 mb-4`}>
            {children}
          </div>

          {(author || authorTitle || source) && (
            <footer className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex items-center justify-center gap-3">
                {authorImage && (
                  <img 
                    src={authorImage} 
                    alt={author || 'Author'} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="text-center">
                  {author && (
                    <cite className={`${sizeConfig.author} font-semibold text-gray-900 dark:text-gray-100 not-italic block`}>
                      {author}
                    </cite>
                  )}
                  {authorTitle && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      {authorTitle}
                    </span>
                  )}
                  {source && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 block">
                      {source}
                    </span>
                  )}
                </div>
              </div>
            </footer>
          )}
        </div>
      </blockquote>
    );
  }

  // Testimonial variant
  if (variant === 'testimonial') {
    return (
      <blockquote 
        className={`
          my-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950
          border border-blue-200 dark:border-blue-800 rounded-xl ${sizeConfig.padding} ${className}
        `}
        {...props}
      >
        <div className="relative">
          {/* Quote icon */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
          </div>

          <div className={`${sizeConfig.text} text-gray-700 dark:text-gray-300 mb-6 pl-6`}>
            {children}
          </div>

          {(author || authorTitle || authorImage) && (
            <div className="flex items-center gap-4">
              {authorImage && (
                <img 
                  src={authorImage} 
                  alt={author || 'Author'} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                />
              )}
              <div>
                {author && (
                  <cite className={`${sizeConfig.author} font-semibold text-gray-900 dark:text-gray-100 not-italic block`}>
                    {author}
                  </cite>
                )}
                {authorTitle && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {authorTitle}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </blockquote>
    );
  }

  // Default variant
  return (
    <blockquote 
      className={`
        my-8 relative ${sizeConfig.padding}
        bg-gray-50 dark:bg-gray-800/50 rounded-lg
        border-l-4 border-blue-500 dark:border-blue-400
        ${className}
      `}
      {...props}
    >
      <div className="relative">
        {showQuoteMarks && (
          <span 
            className={`
              absolute -top-2 -left-2 ${sizeConfig.quote} font-serif 
              text-blue-500 dark:text-blue-400 leading-none
            `}
            aria-hidden="true"
          >
            "
          </span>
        )}
        
        <div className={`${sizeConfig.text} italic text-gray-700 dark:text-gray-300 ${showQuoteMarks ? 'pl-6' : ''}`}>
          {children}
        </div>

        {(author || authorTitle || source) && (
          <footer className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              {authorImage && (
                <img 
                  src={authorImage} 
                  alt={author || 'Author'} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                {author && (
                  <cite className={`${sizeConfig.author} font-medium text-gray-900 dark:text-gray-100 not-italic`}>
                    {author}
                  </cite>
                )}
                {authorTitle && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    {authorTitle}
                  </span>
                )}
                {source && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    — {source}
                  </span>
                )}
              </div>
            </div>
          </footer>
        )}
      </div>
    </blockquote>
  );
}

// Export types
export type { QuoteProps };