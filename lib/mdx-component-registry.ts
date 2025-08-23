/**
 * MDX Component Registration Service
 * 
 * This service manages the registration and configuration of custom MDX components.
 * It provides a centralized way to register, validate, and manage components used in MDX content.
 */

import { ComponentType } from 'react'
import { componentRegistry, ComponentRegistration } from './mdx-core'

// Import existing components
import { MDXComponents } from './mdx-components'
import { 
  CodeBlock, 
  Callout, 
  ImageGallery, 
  MDXImage,
  TechStack,
  ProjectCard,
  Timeline,
  Quote
} from '@/components/mdx'

/**
 * Default component configurations
 */
const DEFAULT_COMPONENTS: ComponentRegistration[] = [
  {
    name: 'CodeBlock',
    component: CodeBlock,
    category: 'code',
    description: 'Syntax-highlighted code block with language support',
    security: {
      allowedProps: ['language', 'children', 'title', 'showLineNumbers', 'filename', 'highlightLines', 'enableCopy'],
      sanitizeProps: true
    }
  },
  {
    name: 'Callout',
    component: Callout,
    category: 'content',
    description: 'Highlighted callout box for important information',
    security: {
      allowedProps: ['type', 'title', 'children', 'collapsible', 'defaultOpen'],
      sanitizeProps: true
    }
  },
  {
    name: 'ImageGallery',
    component: ImageGallery,
    category: 'media',
    description: 'Responsive image gallery with lightbox functionality',
    security: {
      allowedProps: ['images', 'columns', 'gap', 'enableLightbox', 'title', 'description'],
      sanitizeProps: true
    }
  },
  {
    name: 'Image',
    component: MDXImage,
    category: 'media',
    description: 'Optimized image component with lazy loading',
    security: {
      allowedProps: ['id', 'src', 'alt', 'width', 'height', 'title', 'showThumbnail', 'lazy', 'inline'],
      sanitizeProps: true
    }
  },
  {
    name: 'TechStack',
    component: TechStack,
    category: 'project',
    description: 'Display technology stack as badges with icons',
    security: {
      allowedProps: ['technologies', 'variant', 'size', 'layout', 'showIcons', 'title'],
      sanitizeProps: true
    }
  },
  {
    name: 'ProjectCard',
    component: ProjectCard,
    category: 'project',
    description: 'Project showcase card with links and tech stack',
    security: {
      allowedProps: ['title', 'description', 'shortDescription', 'technologies', 'image', 'isImageMediaId', 'links', 'projectUrl', 'githubUrl', 'status', 'featured', 'category', 'date', 'variant', 'showFullDescription'],
      sanitizeProps: true
    }
  },
  {
    name: 'Timeline',
    component: Timeline,
    category: 'layout',
    description: 'Display chronological events in a timeline format',
    security: {
      allowedProps: ['items', 'orientation', 'variant', 'showConnectors', 'title'],
      sanitizeProps: true
    }
  },
  {
    name: 'Quote',
    component: Quote,
    category: 'content',
    description: 'Stylized quote component for highlighting important text',
    security: {
      allowedProps: ['children', 'author', 'authorTitle', 'authorImage', 'source', 'variant', 'size', 'showQuoteMarks'],
      sanitizeProps: true
    }
  }
]

/**
 * Component category definitions
 */
export const COMPONENT_CATEGORIES = {
  content: {
    name: 'Content',
    description: 'Components for enhancing content presentation',
    icon: '📝'
  },
  media: {
    name: 'Media',
    description: 'Components for images, videos, and galleries',
    icon: '🖼️'
  },
  code: {
    name: 'Code',
    description: 'Components for code display and syntax highlighting',
    icon: '💻'
  },
  project: {
    name: 'Project',
    description: 'Components for showcasing projects and skills',
    icon: '🚀'
  },
  layout: {
    name: 'Layout',
    description: 'Components for structuring content layout',
    icon: '📐'
  },
  interactive: {
    name: 'Interactive',
    description: 'Components with user interaction capabilities',
    icon: '🎮'
  }
} as const

export type ComponentCategory = keyof typeof COMPONENT_CATEGORIES

/**
 * Component template for easy insertion
 */
export interface ComponentTemplate {
  name: string
  template: string
  description: string
  example: string
  props: Array<{
    name: string
    type: string
    required: boolean
    description: string
    default?: any
  }>
}

/**
 * Predefined component templates
 */
export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    name: 'CodeBlock',
    template: '<CodeBlock language="{language}" filename="{filename}">\n{code}\n</CodeBlock>',
    description: 'Insert a syntax-highlighted code block',
    example: '<CodeBlock language="typescript" filename="example.ts">\nconst hello = "world";\n</CodeBlock>',
    props: [
      { name: 'language', type: 'string', required: true, description: 'Programming language for syntax highlighting' },
      { name: 'filename', type: 'string', required: false, description: 'Optional filename to display' },
      { name: 'showLineNumbers', type: 'boolean', required: false, description: 'Show line numbers', default: false },
      { name: 'enableCopy', type: 'boolean', required: false, description: 'Enable copy button', default: true }
    ]
  },
  {
    name: 'Callout',
    template: '<Callout type="{type}" title="{title}" collapsible={false}>\n{content}\n</Callout>',
    description: 'Insert a highlighted callout box',
    example: '<Callout type="info" title="Note">\nThis is important information.\n</Callout>',
    props: [
      { name: 'type', type: '"info" | "warning" | "error" | "success" | "note" | "tip"', required: false, description: 'Callout type', default: 'info' },
      { name: 'title', type: 'string', required: false, description: 'Optional title for the callout' },
      { name: 'collapsible', type: 'boolean', required: false, description: 'Make callout collapsible', default: false }
    ]
  },
  {
    name: 'ImageGallery',
    template: '<ImageGallery\n  images={[\n    { src: "{src1}", alt: "{alt1}", title: "{title1}" },\n    { src: "{src2}", alt: "{alt2}", title: "{title2}" }\n  ]}\n  enableLightbox={true}\n/>',
    description: 'Insert an image gallery with lightbox',
    example: '<ImageGallery\n  images={[\n    { src: "/image1.jpg", alt: "Description 1", title: "Image 1" },\n    { src: "/image2.jpg", alt: "Description 2", title: "Image 2" }\n  ]}\n  enableLightbox={true}\n/>',
    props: [
      { name: 'images', type: 'Array<{src: string, alt: string, title?: string}>', required: true, description: 'Array of image objects' },
      { name: 'columns', type: '{sm?: number, md?: number, lg?: number}', required: false, description: 'Responsive column configuration' },
      { name: 'enableLightbox', type: 'boolean', required: false, description: 'Enable lightbox mode', default: true }
    ]
  },
  {
    name: 'TechStack',
    template: '<TechStack\n  technologies={["{tech1}", "{tech2}", "{tech3}"]}\n  variant="default"\n  showIcons={true}\n/>',
    description: 'Display technology stack as badges with icons',
    example: '<TechStack\n  technologies={["React", "TypeScript", "Next.js"]}\n  variant="default"\n  showIcons={true}\n/>',
    props: [
      { name: 'technologies', type: 'string[]', required: true, description: 'Array of technology names' },
      { name: 'variant', type: '"default" | "outline" | "secondary"', required: false, description: 'Badge variant', default: 'default' },
      { name: 'showIcons', type: 'boolean', required: false, description: 'Show technology icons', default: true },
      { name: 'layout', type: '"inline" | "grid" | "vertical"', required: false, description: 'Layout style', default: 'inline' }
    ]
  },
  {
    name: 'ProjectCard',
    template: '<ProjectCard\n  title="{title}"\n  description="{description}"\n  technologies={["{tech1}", "{tech2}"]}\n  projectUrl="{projectUrl}"\n  githubUrl="{githubUrl}"\n  variant="default"\n/>',
    description: 'Display a project showcase card',
    example: '<ProjectCard\n  title="My Project"\n  description="A cool project description"\n  technologies={["React", "Node.js"]}\n  projectUrl="https://example.com"\n  githubUrl="https://github.com/user/repo"\n  variant="default"\n/>',
    props: [
      { name: 'title', type: 'string', required: true, description: 'Project title' },
      { name: 'description', type: 'string', required: true, description: 'Project description' },
      { name: 'technologies', type: 'string[]', required: true, description: 'Technologies used' },
      { name: 'projectUrl', type: 'string', required: false, description: 'Live project URL' },
      { name: 'githubUrl', type: 'string', required: false, description: 'GitHub repository URL' },
      { name: 'variant', type: '"default" | "compact" | "detailed"', required: false, description: 'Card variant', default: 'default' }
    ]
  },
  {
    name: 'Timeline',
    template: '<Timeline\n  items={[\n    { title: "{title1}", date: "{date1}", description: "{desc1}", status: "completed" },\n    { title: "{title2}", date: "{date2}", description: "{desc2}", status: "in-progress" }\n  ]}\n  orientation="vertical"\n/>',
    description: 'Display events in a timeline format',
    example: '<Timeline\n  items={[\n    { title: "Project Started", date: "2024-01", description: "Initial development phase", status: "completed" },\n    { title: "Beta Release", date: "2024-06", description: "First beta version", status: "in-progress" }\n  ]}\n  orientation="vertical"\n/>',
    props: [
      { name: 'items', type: 'Array<{title: string, date: string, description?: string, status?: string}>', required: true, description: 'Timeline items' },
      { name: 'orientation', type: '"vertical" | "horizontal"', required: false, description: 'Timeline orientation', default: 'vertical' },
      { name: 'variant', type: '"default" | "compact" | "detailed"', required: false, description: 'Timeline variant', default: 'default' }
    ]
  },
  {
    name: 'Quote',
    template: '<Quote\n  author="{author}"\n  authorTitle="{title}"\n  variant="default"\n>\n{quote text}\n</Quote>',
    description: 'Display a stylized quote or testimonial',
    example: '<Quote\n  author="John Doe"\n  authorTitle="CEO, Example Corp"\n  variant="testimonial"\n>\nThis is an amazing product that changed our workflow completely.\n</Quote>',
    props: [
      { name: 'author', type: 'string', required: false, description: 'Quote author name' },
      { name: 'authorTitle', type: 'string', required: false, description: 'Author title or role' },
      { name: 'variant', type: '"default" | "bordered" | "minimal" | "testimonial"', required: false, description: 'Quote style variant', default: 'default' },
      { name: 'size', type: '"sm" | "md" | "lg"', required: false, description: 'Quote size', default: 'md' }
    ]
  }
]

/**
 * MDX Component Registration Service
 */
export class MDXComponentRegistrationService {
  private initialized = false

  /**
   * Initialize the service with default components
   */
  initialize(): void {
    if (this.initialized) {
      return
    }

    // Register default components
    for (const componentConfig of DEFAULT_COMPONENTS) {
      try {
        componentRegistry.register(componentConfig)
      } catch (error) {
        console.warn(`Failed to register component ${componentConfig.name}:`, error)
      }
    }

    this.initialized = true
  }

  /**
   * Register a new component
   */
  registerComponent(registration: ComponentRegistration): void {
    this.ensureInitialized()
    componentRegistry.register(registration)
  }

  /**
   * Register multiple components
   */
  registerComponents(registrations: ComponentRegistration[]): void {
    this.ensureInitialized()
    for (const registration of registrations) {
      try {
        this.registerComponent(registration)
      } catch (error) {
        console.warn(`Failed to register component ${registration.name}:`, error)
      }
    }
  }

  /**
   * Get all registered components
   */
  getComponents(): ComponentRegistration[] {
    this.ensureInitialized()
    return componentRegistry.getAll()
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: ComponentCategory): ComponentRegistration[] {
    this.ensureInitialized()
    return componentRegistry.getByCategory(category)
  }

  /**
   * Get component templates
   */
  getComponentTemplates(): ComponentTemplate[] {
    return COMPONENT_TEMPLATES
  }

  /**
   * Get template for a specific component
   */
  getComponentTemplate(componentName: string): ComponentTemplate | undefined {
    return COMPONENT_TEMPLATES.find(template => template.name === componentName)
  }

  /**
   * Get component map for MDX rendering
   */
  getComponentMap(): Record<string, ComponentType<any>> {
    this.ensureInitialized()
    return componentRegistry.getComponentMap()
  }

  /**
   * Get allowed component names for security validation
   */
  getAllowedComponentNames(): string[] {
    this.ensureInitialized()
    return componentRegistry.getAll().map(comp => comp.name)
  }

  /**
   * Validate if a component is registered and allowed
   */
  isComponentAllowed(componentName: string): boolean {
    this.ensureInitialized()
    return componentRegistry.has(componentName)
  }

  /**
   * Get component categories
   */
  getCategories(): typeof COMPONENT_CATEGORIES {
    return COMPONENT_CATEGORIES
  }

  /**
   * Search components by name or description
   */
  searchComponents(query: string): ComponentRegistration[] {
    this.ensureInitialized()
    const lowercaseQuery = query.toLowerCase()
    return componentRegistry.getAll().filter(comp => 
      comp.name.toLowerCase().includes(lowercaseQuery) ||
      comp.description?.toLowerCase().includes(lowercaseQuery)
    )
  }

  /**
   * Generate component usage documentation
   */
  generateComponentDocs(): string {
    this.ensureInitialized()
    const components = componentRegistry.getAll()
    let docs = '# Available MDX Components\n\n'

    const categorizedComponents = new Map<string, ComponentRegistration[]>()
    
    // Group by category
    for (const comp of components) {
      const category = comp.category || 'other'
      if (!categorizedComponents.has(category)) {
        categorizedComponents.set(category, [])
      }
      categorizedComponents.get(category)!.push(comp)
    }

    // Generate docs for each category
    for (const [category, comps] of categorizedComponents) {
      const categoryInfo = COMPONENT_CATEGORIES[category as ComponentCategory]
      docs += `## ${categoryInfo?.name || category} ${categoryInfo?.icon || ''}\n\n`
      docs += `${categoryInfo?.description || ''}\n\n`

      for (const comp of comps) {
        docs += `### ${comp.name}\n\n`
        docs += `${comp.description || 'No description available'}\n\n`
        
        const template = this.getComponentTemplate(comp.name)
        if (template) {
          docs += '**Usage:**\n```jsx\n'
          docs += template.example
          docs += '\n```\n\n'
        }
      }
    }

    return docs
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize()
    }
  }
}

// Export singleton instance
export const mdxComponentService = new MDXComponentRegistrationService()

// Auto-initialize on import
mdxComponentService.initialize()