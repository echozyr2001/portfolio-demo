/**
 * MDX Error Handler Service
 * 
 * Provides comprehensive error handling, logging, and recovery mechanisms for MDX processing.
 * Includes user-friendly error messages, debugging information, and error recovery strategies.
 */

import { MDXError, ValidationResult } from './mdx-core'

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Error context information
 */
export interface ErrorContext {
  source?: string
  line?: number
  column?: number
  component?: string
  operation?: string
  timestamp?: Date
  userId?: string
  sessionId?: string
}

/**
 * Error recovery suggestion
 */
export interface ErrorRecovery {
  action: string
  description: string
  autoFix?: boolean
  fixFunction?: () => string
}

/**
 * Enhanced MDX error with recovery options
 */
export interface EnhancedMDXError extends MDXError {
  id: string
  context?: ErrorContext
  recovery?: ErrorRecovery[]
  userMessage?: string
  technicalMessage?: string
  documentation?: string
}

/**
 * Error statistics for monitoring
 */
export interface ErrorStats {
  total: number
  byType: Record<string, number>
  bySeverity: Record<ErrorSeverity, number>
  recent: EnhancedMDXError[]
  trends: {
    hourly: number[]
    daily: number[]
  }
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableLogging: boolean
  enableRecovery: boolean
  maxErrorHistory: number
  enableUserFriendlyMessages: boolean
  enableTelemetry: boolean
  logLevel: ErrorSeverity
}

/**
 * MDX Error Handler Service
 */
export class MDXErrorHandler {
  private config: ErrorHandlerConfig
  private errorHistory: EnhancedMDXError[] = []
  private errorStats: ErrorStats = {
    total: 0,
    byType: {},
    bySeverity: {
      [ErrorSeverity.INFO]: 0,
      [ErrorSeverity.WARNING]: 0,
      [ErrorSeverity.ERROR]: 0,
      [ErrorSeverity.CRITICAL]: 0
    },
    recent: [],
    trends: {
      hourly: new Array(24).fill(0),
      daily: new Array(7).fill(0)
    }
  }

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableRecovery: true,
      maxErrorHistory: 100,
      enableUserFriendlyMessages: true,
      enableTelemetry: false,
      logLevel: ErrorSeverity.WARNING,
      ...config
    }
  }

  /**
   * Handle and enhance an MDX error
   */
  handleError(
    error: MDXError | Error, 
    context?: ErrorContext
  ): EnhancedMDXError {
    const enhancedError = this.enhanceError(error, context)
    
    // Log error if enabled
    if (this.config.enableLogging) {
      this.logError(enhancedError)
    }

    // Update statistics
    this.updateStats(enhancedError)

    // Store in history
    this.addToHistory(enhancedError)

    // Send telemetry if enabled
    if (this.config.enableTelemetry) {
      this.sendTelemetry(enhancedError)
    }

    return enhancedError
  }

  /**
   * Handle validation results and enhance errors
   */
  handleValidationResult(result: ValidationResult, context?: ErrorContext): ValidationResult {
    const enhancedErrors = result.errors.map(error => this.handleError(error, context))
    const enhancedWarnings = result.warnings.map(warning => this.handleError(warning, context))

    return {
      isValid: result.isValid,
      errors: enhancedErrors,
      warnings: enhancedWarnings
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: EnhancedMDXError): string {
    if (error.userMessage) {
      return error.userMessage
    }

    switch (error.type) {
      case 'syntax':
        return this.getSyntaxErrorMessage(error)
      case 'component':
        return this.getComponentErrorMessage(error)
      case 'security':
        return this.getSecurityErrorMessage(error)
      case 'runtime':
        return this.getRuntimeErrorMessage(error)
      default:
        return 'An unexpected error occurred while processing your content.'
    }
  }

  /**
   * Get error recovery suggestions
   */
  getRecoverySuggestions(error: EnhancedMDXError): ErrorRecovery[] {
    if (error.recovery) {
      return error.recovery
    }

    const suggestions: ErrorRecovery[] = []

    switch (error.type) {
      case 'syntax':
        suggestions.push(...this.getSyntaxRecovery(error))
        break
      case 'component':
        suggestions.push(...this.getComponentRecovery(error))
        break
      case 'security':
        suggestions.push(...this.getSecurityRecovery(error))
        break
      case 'runtime':
        suggestions.push(...this.getRuntimeRecovery(error))
        break
    }

    return suggestions
  }

  /**
   * Attempt automatic error recovery
   */
  attemptAutoRecovery(error: EnhancedMDXError, source: string): string | null {
    if (!this.config.enableRecovery) {
      return null
    }

    const recoveryOptions = this.getRecoverySuggestions(error)
    const autoFixOption = recoveryOptions.find(option => option.autoFix && option.fixFunction)

    if (autoFixOption?.fixFunction) {
      try {
        return autoFixOption.fixFunction()
      } catch (fixError) {
        console.warn('Auto-recovery failed:', fixError)
        return null
      }
    }

    return null
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    return { ...this.errorStats }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): EnhancedMDXError[] {
    return this.errorHistory.slice(-limit)
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = []
    this.errorStats.recent = []
  }

  /**
   * Export error report
   */
  exportErrorReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.errorStats,
      recentErrors: this.getRecentErrors(20),
      config: this.config
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * Enhance a basic error with additional information
   */
  private enhanceError(error: MDXError | Error, context?: ErrorContext): EnhancedMDXError {
    const id = this.generateErrorId()
    const timestamp = new Date()

    // Convert Error to MDXError if needed
    let mdxError: MDXError
    if ('type' in error) {
      mdxError = error
    } else {
      mdxError = {
        type: 'runtime',
        message: error.message,
        severity: 'error'
      }
    }

    const enhanced: EnhancedMDXError = {
      ...mdxError,
      id,
      context: {
        ...context,
        timestamp
      }
    }

    // Add user-friendly message
    if (this.config.enableUserFriendlyMessages) {
      enhanced.userMessage = this.generateUserFriendlyMessage(enhanced)
    }

    // Add recovery suggestions
    if (this.config.enableRecovery) {
      enhanced.recovery = this.generateRecoverySuggestions(enhanced)
    }

    return enhanced
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `mdx-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Log error based on configuration
   */
  private logError(error: EnhancedMDXError): void {
    const shouldLog = this.shouldLogError(error.severity as ErrorSeverity)
    
    if (!shouldLog) {
      return
    }

    const logMessage = `[MDX Error ${error.id}] ${error.type}: ${error.message}`
    const logData = {
      error,
      context: error.context,
      timestamp: new Date().toISOString()
    }

    switch (error.severity) {
      case 'error':
      case 'critical':
        console.error(logMessage, logData)
        break
      case 'warning':
        console.warn(logMessage, logData)
        break
      case 'info':
        console.info(logMessage, logData)
        break
    }
  }

  /**
   * Check if error should be logged based on level
   */
  private shouldLogError(severity: ErrorSeverity): boolean {
    const levels = [ErrorSeverity.INFO, ErrorSeverity.WARNING, ErrorSeverity.ERROR, ErrorSeverity.CRITICAL]
    const configLevel = levels.indexOf(this.config.logLevel)
    const errorLevel = levels.indexOf(severity)
    
    return errorLevel >= configLevel
  }

  /**
   * Update error statistics
   */
  private updateStats(error: EnhancedMDXError): void {
    this.errorStats.total++
    this.errorStats.byType[error.type] = (this.errorStats.byType[error.type] || 0) + 1
    this.errorStats.bySeverity[error.severity as ErrorSeverity]++

    // Update trends
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    
    this.errorStats.trends.hourly[hour]++
    this.errorStats.trends.daily[day]++

    // Add to recent errors
    this.errorStats.recent.push(error)
    if (this.errorStats.recent.length > 10) {
      this.errorStats.recent.shift()
    }
  }

  /**
   * Add error to history
   */
  private addToHistory(error: EnhancedMDXError): void {
    this.errorHistory.push(error)
    
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory.shift()
    }
  }

  /**
   * Send error telemetry (placeholder for future implementation)
   */
  private sendTelemetry(error: EnhancedMDXError): void {
    // Placeholder for telemetry implementation
    // Could send to analytics service, error tracking service, etc.
    console.debug('Telemetry:', { errorId: error.id, type: error.type })
  }

  /**
   * Generate user-friendly message
   */
  private generateUserFriendlyMessage(error: EnhancedMDXError): string {
    // Implementation would generate contextual, helpful messages
    return error.message
  }

  /**
   * Generate recovery suggestions
   */
  private generateRecoverySuggestions(error: EnhancedMDXError): ErrorRecovery[] {
    // Implementation would generate contextual recovery suggestions
    return []
  }

  // Error-type specific message generators
  private getSyntaxErrorMessage(error: EnhancedMDXError): string {
    if (error.line) {
      return `There's a syntax error on line ${error.line}. Please check your MDX formatting.`
    }
    return 'There\'s a syntax error in your MDX content. Please check your formatting.'
  }

  private getComponentErrorMessage(error: EnhancedMDXError): string {
    return 'There\'s an issue with a component in your content. Please check that all components are properly formatted.'
  }

  private getSecurityErrorMessage(error: EnhancedMDXError): string {
    return 'Your content contains elements that aren\'t allowed for security reasons. Please review and remove any restricted content.'
  }

  private getRuntimeErrorMessage(error: EnhancedMDXError): string {
    return 'An error occurred while processing your content. Please try again or contact support if the issue persists.'
  }

  // Recovery suggestion generators
  private getSyntaxRecovery(error: EnhancedMDXError): ErrorRecovery[] {
    return [
      {
        action: 'Check brackets and tags',
        description: 'Ensure all opening tags have matching closing tags'
      },
      {
        action: 'Validate JSX syntax',
        description: 'Make sure all JSX elements are properly formatted'
      }
    ]
  }

  private getComponentRecovery(error: EnhancedMDXError): ErrorRecovery[] {
    return [
      {
        action: 'Check component name',
        description: 'Ensure the component name is spelled correctly and is available'
      },
      {
        action: 'Verify component props',
        description: 'Check that all required props are provided and correctly formatted'
      }
    ]
  }

  private getSecurityRecovery(error: EnhancedMDXError): ErrorRecovery[] {
    return [
      {
        action: 'Remove restricted content',
        description: 'Remove any script tags, event handlers, or other restricted elements'
      },
      {
        action: 'Use allowed components',
        description: 'Replace restricted elements with approved MDX components'
      }
    ]
  }

  private getRuntimeRecovery(error: EnhancedMDXError): ErrorRecovery[] {
    return [
      {
        action: 'Refresh and try again',
        description: 'Sometimes a simple refresh can resolve temporary issues'
      },
      {
        action: 'Check content format',
        description: 'Ensure your content follows the expected MDX format'
      }
    ]
  }
}

// Export singleton instance
export const mdxErrorHandler = new MDXErrorHandler()

// Export utility functions
export const handleMDXError = (error: MDXError | Error, context?: ErrorContext) => 
  mdxErrorHandler.handleError(error, context)

export const getUserFriendlyErrorMessage = (error: EnhancedMDXError) => 
  mdxErrorHandler.getUserFriendlyMessage(error)

export const getErrorRecovery = (error: EnhancedMDXError) => 
  mdxErrorHandler.getRecoverySuggestions(error)