'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Copy,
  ExternalLink
} from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class PreviewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Preview Error Boundary caught an error:', error, errorInfo)
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleCopyError = async () => {
    const { error, errorInfo } = this.state
    if (!error) return

    const errorText = `
Error: ${error.message}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo?.componentStack}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorText)
      // You could add a toast notification here
      console.log('Error details copied to clipboard')
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Preview Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">
                    {this.state.error?.name || 'Unknown Error'}
                  </div>
                  <div className="text-sm">
                    {this.state.error?.message || 'An unexpected error occurred while rendering the preview.'}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Error Details:</div>
                <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                  <pre>{this.state.error.stack}</pre>
                </div>
                
                {this.state.errorInfo?.componentStack && (
                  <>
                    <div className="text-sm font-medium">Component Stack:</div>
                    <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleCopyError}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Error
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const githubUrl = `https://github.com/search?q=${encodeURIComponent(this.state.error?.message || '')}&type=issues`
                    window.open(githubUrl, '_blank')
                  }}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Search Issues
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              This error occurred while rendering the MDX preview. Check your MDX syntax and component usage.
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function usePreviewErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  return {
    error,
    resetError,
    handleError,
    hasError: error !== null
  }
}

export default PreviewErrorBoundary