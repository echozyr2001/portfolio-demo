/**
 * Unified MDX Service
 * 
 * This service provides a unified interface for all MDX processing functionality,
 * combining the core processor, component registry, and error handling into a
 * single, easy-to-use service.
 */

import { 
  MDXCoreProcessor, 
  MDXCompileOptions, 
  MDXProcessResult, 
  ValidationResult,
  ComponentRegistration 
} from './mdx-core'
import { 
  mdxComponentService, 
  ComponentTemplate, 
  ComponentCategory,
  COMPONENT_CATEGORIES 
} from './mdx-component-registry'
import { 
  mdxErrorHandler, 
  EnhancedMDXError, 
  ErrorContext,
  ErrorRecovery 
} from './mdx-error-handler'
import { ComponentType } from 'react'

/**
 * MDX Service Configuration
 */
export interface MDXServiceConfig {
  // Core processing options
  enableCodeHighlight?: boolean
  enableMath?: boolean
  sanitizeContent?: boolean
  theme?: 'light' | 'dark' | 'auto'
  development?: boolean

  // Component options
  allowedComponents?: string[]
  enableCustomComponents?: boolean

  // Error handling options
  enableErrorRecovery?: boolean
  enableUserFriendlyErrors?: boolean
  logErrors?: boolean

  // Performance options
  enableCaching?: boolean
  cacheSize?: number
}

/**
 * MDX Processing Result with Enhanced Information
 */
export interface EnhancedMDXResult extends MDXProcessResult {
  isValid: boolean
  errors: EnhancedMDXError[]
  warnings: EnhancedMDXError[]
  components: Record<string, ComponentType<any>>
  processingTime: number
}

/**
 * Unified MDX Service
 */
export class MDXService {
  private processor: MDXCoreProcessor
  private config: MDXServiceConfig
  private cache = new Map<string, EnhancedMDXResult>()

  constructor(config: MDXServiceConfig = {}) {
    this.config = {
      enableCodeHighlight: true,
      enableMath: false,
      sanitizeContent: true,
      theme: 'auto',
      development: process.env.NODE_ENV === 'development',
      allowedComponents: [],
      enableCustomComponents: true,
      enableErrorRecovery: true,
      enableUserFriendlyErrors: true,
      logErrors: true,
      enableCaching: true,
      cacheSize: 100,
      ...config
    }

    this.processor = new MDXCoreProcessor({
      enableCodeHighlight: this.config.enableCodeHighlight,
      enableMath: this.config.enableMath,
      sanitizeContent: this.config.sanitizeContent,
      allowedComponents: this.config.allowedComponents,
      theme: this.config.theme,
      development: this.config.development
    })

    // Initialize component service
    mdxComponentService.initialize()
  }

  /**
   * Process MDX content with full error handling and validation
   */
  async process(source: string, context?: ErrorContext): Promise<EnhancedMDXResult> {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(source)

    // Check cache if enabled
    if (this.config.enableCaching && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      return { ...cached, processingTime: Date.now() - startTime }
    }

    try {
      // Validate content first
      const validation = await this.validate(source, context)
      
      // If validation fails with critical errors, return early
      const criticalErrors = validation.errors.filter(e => e.severity === 'error')
      if (criticalErrors.length > 0) {
        const result: EnhancedMDXResult = {
          mdxSource: { compiledSource: '', frontmatter: {}, scope: {} },
          frontmatter: {},
          readingTime: 0,
          wordCount: 0,
          excerpt: '',
          metadata: {},
          isValid: false,
          errors: validation.errors,
          warnings: validation.warnings,
          components: this.getComponentMap(),
          processingTime: Date.now() - startTime
        }
        return result
      }

      // Process the content
      const processResult = await this.processor.compile(source, {
        enableCodeHighlight: this.config.enableCodeHighlight,
        enableMath: this.config.enableMath,
        sanitizeContent: this.config.sanitizeContent,
        allowedComponents: this.config.allowedComponents,
        theme: this.config.theme,
        development: this.config.development
      })

      const result: EnhancedMDXResult = {
        ...processResult,
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        components: this.getComponentMap(),
        processingTime: Date.now() - startTime
      }

      // Cache result if enabled
      if (this.config.enableCaching) {
        this.addToCache(cacheKey, result)
      }

      return result

    } catch (error) {
      const enhancedError = mdxErrorHandler.handleError(error, context)
      
      const result: EnhancedMDXResult = {
        mdxSource: { compiledSource: '', frontmatter: {}, scope: {} },
        frontmatter: {},
        readingTime: 0,
        wordCount: 0,
        excerpt: '',
        metadata: {},
        isValid: false,
        errors: [enhancedError],
        warnings: [],
        components: this.getComponentMap(),
        processingTime: Date.now() - startTime
      }

      return result
    }
  }

  /**
   * Validate MDX content
   */
  async validate(source: string, context?: ErrorContext): Promise<ValidationResult> {
    try {
      const validation = await this.processor.validate(source, {
        enableCodeHighlight: false, // Skip highlighting for validation
        sanitizeContent: this.config.sanitizeContent,
        allowedComponents: this.config.allowedComponents
      })

      return mdxErrorHandler.handleValidationResult(validation, context)
    } catch (error) {
      const enhancedError = mdxErrorHandler.handleError(error, context)
      return {
        isValid: false,
        errors: [enhancedError],
        warnings: []
      }
    }
  }

  /**
   * Attempt to recover from errors automatically
   */
  async attemptRecovery(source: string, errors: EnhancedMDXError[]): Promise<string | null> {
    if (!this.config.enableErrorRecovery) {
      return null
    }

    for (const error of errors) {
      const recovered = mdxErrorHandler.attemptAutoRecovery(error, source)
      if (recovered) {
        return recovered
      }
    }

    return null
  }

  /**
   * Get user-friendly error messages
   */
  getErrorMessages(errors: EnhancedMDXError[]): string[] {
    if (!this.config.enableUserFriendlyErrors) {
      return errors.map(e => e.message)
    }

    return errors.map(error => mdxErrorHandler.getUserFriendlyMessage(error))
  }

  /**
   * Get recovery suggestions for errors
   */
  getRecoverySuggestions(errors: EnhancedMDXError[]): ErrorRecovery[] {
    const suggestions: ErrorRecovery[] = []
    
    for (const error of errors) {
      suggestions.push(...mdxErrorHandler.getRecoverySuggestions(error))
    }

    return suggestions
  }

  // Component Management Methods

  /**
   * Register a new component
   */
  registerComponent(registration: ComponentRegistration): void {
    mdxComponentService.registerComponent(registration)
    
    // Update allowed components if auto-management is enabled
    if (this.config.enableCustomComponents) {
      this.config.allowedComponents = mdxComponentService.getAllowedComponentNames()
    }
  }

  /**
   * Get all available components
   */
  getAvailableComponents(): ComponentRegistration[] {
    return mdxComponentService.getComponents()
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: ComponentCategory): ComponentRegistration[] {
    return mdxComponentService.getComponentsByCategory(category)
  }

  /**
   * Get component templates for editor integration
   */
  getComponentTemplates(): ComponentTemplate[] {
    return mdxComponentService.getComponentTemplates()
  }

  /**
   * Get component map for MDX rendering
   */
  getComponentMap(): Record<string, ComponentType<any>> {
    return mdxComponentService.getComponentMap()
  }

  /**
   * Search components
   */
  searchComponents(query: string): ComponentRegistration[] {
    return mdxComponentService.searchComponents(query)
  }

  /**
   * Generate component documentation
   */
  generateComponentDocs(): string {
    return mdxComponentService.generateComponentDocs()
  }

  // Utility Methods

  /**
   * Extract metadata from MDX content
   */
  extractMetadata(source: string): any {
    try {
      return this.processor.extractFrontmatter(source)
    } catch (error) {
      console.warn('Failed to extract metadata:', error)
      return {}
    }
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      errorStats: mdxErrorHandler.getStats(),
      cacheStats: {
        size: this.cache.size,
        maxSize: this.config.cacheSize || 100,
        hitRate: this.calculateCacheHitRate()
      },
      componentStats: {
        registered: mdxComponentService.getComponents().length,
        categories: Object.keys(COMPONENT_CATEGORIES).length
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MDXServiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Update processor configuration
    this.processor = new MDXCoreProcessor({
      enableCodeHighlight: this.config.enableCodeHighlight,
      enableMath: this.config.enableMath,
      sanitizeContent: this.config.sanitizeContent,
      allowedComponents: this.config.allowedComponents,
      theme: this.config.theme,
      development: this.config.development
    })
  }

  // Private Methods

  /**
   * Generate cache key for content
   */
  private generateCacheKey(source: string): string {
    // Simple hash function for cache key
    let hash = 0
    for (let i = 0; i < source.length; i++) {
      const char = source.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `mdx-${hash}-${JSON.stringify(this.config)}`
  }

  /**
   * Add result to cache with size management
   */
  private addToCache(key: string, result: EnhancedMDXResult): void {
    if (this.cache.size >= (this.config.cacheSize || 100)) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, result)
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would need to be tracked over time in a real implementation
    return 0.85 // Placeholder
  }
}

// Export singleton instance with default configuration
export const mdxService = new MDXService()

// Export factory function for custom configurations
export const createMDXService = (config: MDXServiceConfig) => new MDXService(config)

// Export types
export type { 
  MDXServiceConfig, 
  EnhancedMDXResult, 
  ComponentRegistration, 
  ComponentTemplate,
  ComponentCategory,
  EnhancedMDXError,
  ErrorRecovery 
}