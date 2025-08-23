declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element
  export default MDXComponent
}

declare module 'next-mdx-remote/serialize' {
  export interface MDXRemoteSerializeResult {
    compiledSource: string
    frontmatter?: Record<string, any>
    scope?: Record<string, any>
  }
  
  export function serialize(
    source: string,
    options?: {
      mdxOptions?: {
        remarkPlugins?: any[]
        rehypePlugins?: any[]
        format?: 'mdx' | 'md'
      }
      parseFrontmatter?: boolean
      scope?: Record<string, any>
    }
  ): Promise<MDXRemoteSerializeResult>
}

declare module 'next-mdx-remote' {
  import { MDXRemoteSerializeResult } from 'next-mdx-remote/serialize'
  
  export interface MDXRemoteProps {
    compiledSource: string
    frontmatter?: Record<string, any>
    scope?: Record<string, any>
    components?: Record<string, React.ComponentType<any>>
  }
  
  export function MDXRemote(props: MDXRemoteProps): JSX.Element
  export { MDXRemoteSerializeResult }
}