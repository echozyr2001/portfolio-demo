import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export type MDXContent = MDXRemoteSerializeResult

export interface MDXError {
  type: 'syntax' | 'component' | 'runtime'
  message: string
  line?: number
  column?: number
  suggestion?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: MDXError[]
}

export class MDXProcessor {
  async compile(source: string): Promise<MDXContent> {
    try {
      const mdxSource = await serialize(source, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeHighlight,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }]
          ],
        },
        parseFrontmatter: true,
      })
      return mdxSource
    } catch (error) {
      throw this.handleCompileError(error)
    }
  }

  validate(source: string): ValidationResult {
    try {
      // Basic validation - try to compile
      this.compile(source)
      return { isValid: true, errors: [] }
    } catch (error) {
      return {
        isValid: false,
        errors: [this.handleCompileError(error)]
      }
    }
  }

  extractFrontmatter(source: string): Record<string, unknown> {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
    const match = source.match(frontmatterRegex)
    
    if (!match) return {}
    
    try {
      // Simple YAML-like parsing for basic frontmatter
      const frontmatter: Record<string, unknown> = {}
      const lines = match[1].split('\n')
      
      for (const line of lines) {
        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim()
          const value = line.slice(colonIndex + 1).trim()
          frontmatter[key] = value.replace(/^["']|["']$/g, '') // Remove quotes
        }
      }
      
      return frontmatter
    } catch {
      return {}
    }
  }

  private handleCompileError(error: unknown): MDXError {
    if (error.name === 'SyntaxError') {
      return {
        type: 'syntax',
        message: error.message,
        line: error.line,
        column: error.column,
        suggestion: 'Check your MDX syntax for missing closing tags or invalid JSX'
      }
    }
    
    return {
      type: 'runtime',
      message: error.message || 'Unknown MDX compilation error',
      suggestion: 'Please check your MDX content for errors'
    }
  }
}

export const mdxProcessor = new MDXProcessor()