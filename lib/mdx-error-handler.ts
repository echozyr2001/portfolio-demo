import { MDXError, MDXProcessingError } from "./mdx";

/**
 * Error handler for MDX processing with user-friendly messages
 */
export class MDXErrorHandler {
  /**
   * Convert technical errors to user-friendly messages
   */
  static getUserFriendlyMessage(error: MDXError): string {
    switch (error.type) {
      case "syntax":
        return `Syntax Error: ${error.message}. ${error.suggestion || "Please check your Markdown and JSX syntax."}`;

      case "component":
        return `Component Error: ${error.message}. ${error.suggestion || "Make sure the component is properly registered."}`;

      case "security":
        return `Security Issue: ${error.message}. ${error.suggestion || "Please remove or replace the problematic content."}`;

      case "runtime":
        return `Runtime Error: ${error.message}. ${error.suggestion || "Please check your content and try again."}`;

      default:
        return `Error: ${error.message}`;
    }
  }

  /**
   * Format multiple errors for display
   */
  static formatErrors(errors: MDXError[]): string {
    if (errors.length === 0) return "";

    if (errors.length === 1) {
      return this.getUserFriendlyMessage(errors[0]);
    }

    return `Multiple issues found:\n${errors
      .map(
        (error, index) => `${index + 1}. ${this.getUserFriendlyMessage(error)}`
      )
      .join("\n")}`;
  }

  /**
   * Log errors for debugging (in development)
   */
  static logError(error: MDXProcessingError | Error): void {
    if (process.env.NODE_ENV === "development") {
      console.error("MDX Processing Error:", error);

      if (error instanceof MDXProcessingError && error.errors.length > 0) {
        console.error("Detailed errors:", error.errors);
      }
    }
  }

  /**
   * Create a user-friendly error response
   */
  static createErrorResponse(error: MDXProcessingError | Error): {
    success: false;
    message: string;
    errors?: MDXError[];
  } {
    this.logError(error);

    if (error instanceof MDXProcessingError) {
      return {
        success: false,
        message: this.formatErrors(error.errors),
        errors: error.errors,
      };
    }

    return {
      success: false,
      message:
        error.message ||
        "An unexpected error occurred while processing MDX content.",
    };
  }

  /**
   * Handle validation results and provide feedback
   */
  static handleValidationResult(result: {
    isValid: boolean;
    errors: MDXError[];
    warnings: string[];
  }): {
    success: boolean;
    message?: string;
    warnings?: string[];
    errors?: MDXError[];
  } {
    if (result.isValid) {
      return {
        success: true,
        warnings: result.warnings.length > 0 ? result.warnings : undefined,
      };
    }

    return {
      success: false,
      message: this.formatErrors(result.errors),
      errors: result.errors,
      warnings: result.warnings.length > 0 ? result.warnings : undefined,
    };
  }
}

/**
 * Utility function to safely process MDX with error handling
 */
export async function safeMDXProcess<T>(
  operation: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (errorHandler) {
      errorHandler(error instanceof Error ? error : new Error(errorMessage));
    } else {
      MDXErrorHandler.logError(
        error instanceof Error ? error : new Error(errorMessage)
      );
    }

    return { success: false, error: errorMessage };
  }
}
