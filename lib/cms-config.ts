/**
 * CMS Configuration
 * Central configuration for the Payload CMS integration
 */

export const CMS_CONFIG = {
  // Collection names
  collections: {
    BLOG: "blog",
    PROJECTS: "projects",
    MEDIA: "media",
    USERS: "users",
  },

  // API endpoints
  api: {
    BASE_URL: process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000",
    ENDPOINTS: {
      BLOG: "/api/blog",
      PROJECTS: "/api/projects",
      MEDIA: "/api/media",
      AUTH: "/api/users",
    },
  },

  // File upload settings
  upload: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ],
    THUMBNAIL_SIZES: [
      { name: "thumbnail", width: 300, height: 300 },
      { name: "medium", width: 800, height: 600 },
      { name: "large", width: 1200, height: 900 },
    ],
  },

  // Editor settings
  editor: {
    DEFAULT_THEME: "vs-dark" as const,
    AUTO_SAVE_DELAY: 2000, // 2 seconds
    PREVIEW_DEBOUNCE: 500, // 500ms
    MAX_CONTENT_LENGTH: 100000, // 100KB
  },

  // SEO defaults
  seo: {
    DEFAULT_TITLE_SUFFIX: " | Portfolio",
    MAX_TITLE_LENGTH: 60,
    MAX_DESCRIPTION_LENGTH: 160,
    DEFAULT_OG_IMAGE: "/og-default.jpg",
  },

  // Pagination
  pagination: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
  },

  // Security settings
  security: {
    RATE_LIMIT: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Feature flags
  features: {
    ENABLE_COMMENTS: false,
    ENABLE_ANALYTICS: true,
    ENABLE_SEARCH: true,
    ENABLE_TAGS: true,
    ENABLE_DRAFTS: true,
    ENABLE_PREVIEW: true,
  },
} as const;

/**
 * Environment-specific configurations
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  return {
    isDevelopment,
    isProduction,

    // Database
    database: {
      url: process.env.DATABASE_URL || "./payload.db",
    },

    // Payload CMS
    payload: {
      secret: process.env.PAYLOAD_SECRET || "your-secret-here",
      adminUrl: process.env.PAYLOAD_ADMIN_URL || "/admin",
    },

    // Next.js
    nextjs: {
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    },

    // Security
    security: {
      corsOrigins: isDevelopment
        ? ["http://localhost:3000", "http://localhost:3001"]
        : [process.env.NEXTAUTH_URL || "https://yourdomain.com"],
    },
  };
};

/**
 * Validation schemas for content
 */
export const VALIDATION_RULES = {
  blog: {
    title: {
      minLength: 1,
      maxLength: 200,
      required: true,
    },
    slug: {
      pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      required: true,
    },
    content: {
      minLength: 1,
      maxLength: CMS_CONFIG.editor.MAX_CONTENT_LENGTH,
      required: true,
    },
    excerpt: {
      maxLength: 300,
    },
    tags: {
      maxItems: 10,
    },
  },

  project: {
    title: {
      minLength: 1,
      maxLength: 200,
      required: true,
    },
    slug: {
      pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      required: true,
    },
    description: {
      minLength: 1,
      maxLength: CMS_CONFIG.editor.MAX_CONTENT_LENGTH,
      required: true,
    },
    shortDescription: {
      minLength: 1,
      maxLength: 500,
      required: true,
    },
    technologies: {
      minItems: 1,
      maxItems: 20,
      required: true,
    },
  },
} as const;

/**
 * Default content templates
 */
export const CONTENT_TEMPLATES = {
  blog: {
    title: "New Blog Post",
    content: `# New Blog Post

Write your blog post content here using MDX syntax.

## Features

- **Markdown** support with _emphasis_
- **React components** like <TechStack technologies={["React", "TypeScript"]} />
- **Code blocks** with syntax highlighting

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

## Images

You can add images using the ImageGallery component:

<ImageGallery images={[
  {
    src: "/path/to/image.jpg",
    alt: "Description",
    caption: "Optional caption"
  }
]} />
`,
    excerpt: "A brief description of your blog post...",
    status: "draft" as const,
  },

  project: {
    title: "New Project",
    shortDescription: "A brief description of your project",
    description: `# Project Name

## Overview

Describe your project here using MDX syntax.

## Technologies Used

<TechStack technologies={["React", "TypeScript", "Next.js"]} />

## Features

- Feature 1
- Feature 2
- Feature 3

## Screenshots

<ImageGallery images={[
  {
    src: "/path/to/screenshot.jpg",
    alt: "Project screenshot",
    caption: "Main interface"
  }
]} />

## Code Example

\`\`\`typescript
// Example code snippet
interface ProjectProps {
  title: string;
  description: string;
}
\`\`\`
`,
    technologies: ["React", "TypeScript"],
    status: "draft" as const,
    featured: false,
    order: 0,
  },
} as const;
