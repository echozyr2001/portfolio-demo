import { MDXProcessorOptions } from './mdx';

/**
 * Default MDX processing configuration
 */
export const defaultMDXConfig: Required<MDXProcessorOptions> = {
  allowedComponents: [
    'CodeBlock',
    'ImageGallery', 
    'ProjectCard',
    'TechStack',
    // Standard HTML elements that are safe
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'code', 'pre', 'blockquote',
    'strong', 'em', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'br', 'hr',
  ],
  sanitizeContent: true,
  enableSyntaxHighlighting: true,
  customComponents: {},
};

/**
 * Configuration for different environments
 */
export const mdxConfigs = {
  development: {
    ...defaultMDXConfig,
    sanitizeContent: false, // Allow more flexibility in development
  },
  
  production: {
    ...defaultMDXConfig,
    sanitizeContent: true, // Strict security in production
  },
  
  preview: {
    ...defaultMDXConfig,
    sanitizeContent: true,
    enableSyntaxHighlighting: true,
  },
} as const;

/**
 * Get MDX configuration for current environment
 */
export function getMDXConfig(environment?: keyof typeof mdxConfigs): Required<MDXProcessorOptions> {
  const env = environment || (process.env.NODE_ENV as keyof typeof mdxConfigs) || 'development';
  return mdxConfigs[env] || mdxConfigs.development;
}

/**
 * Security configuration for MDX content
 */
export const securityConfig = {
  // Allowed HTML tags (whitelist approach)
  allowedTags: [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'code', 'pre', 'blockquote',
    'strong', 'em', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'br', 'hr', 'del', 'ins', 'sub', 'sup',
  ],
  
  // Allowed attributes for specific tags
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'code': ['className'],
    'pre': ['className'],
    'div': ['className', 'id'],
    'span': ['className', 'id'],
  },
  
  // Dangerous patterns to remove
  dangerousPatterns: [
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<script[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?<\/embed>/gi,
    /<form[\s\S]*?<\/form>/gi,
    /<input[\s\S]*?>/gi,
    /<textarea[\s\S]*?<\/textarea>/gi,
  ],
  
  // Maximum content length (in characters)
  maxContentLength: 100000,
  
  // Maximum number of components per document
  maxComponentsPerDocument: 50,
} as const;

/**
 * Performance configuration
 */
export const performanceConfig = {
  // Cache compiled MDX for better performance
  enableCache: process.env.NODE_ENV === 'production',
  
  // Maximum cache size (number of entries)
  maxCacheSize: 100,
  
  // Cache TTL in milliseconds (1 hour)
  cacheTTL: 60 * 60 * 1000,
  
  // Enable lazy loading for components
  enableLazyLoading: true,
  
  // Timeout for MDX compilation (in milliseconds)
  compilationTimeout: 10000,
} as const;