import React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { MDXComponents } from 'mdx/types';
import { MDXErrorBoundary } from './MDXErrorBoundary';
import { MDXImage } from './MDXImage';
import { CodeBlock } from './CodeBlock';
import { Callout } from './Callout';
import { ImageGallery } from './ImageGallery';

/**
 * MDX渲染器属性接口
 */
interface MDXRendererProps {
  /** 序列化的MDX内容 */
  mdxSource: MDXRemoteSerializeResult;
  /** 自定义组件映射 */
  components?: MDXComponents;
  /** 容器样式类名 */
  className?: string;
  /** 是否启用错误边界 */
  enableErrorBoundary?: boolean;
}

/**
 * 默认MDX组件库
 * 提供常用的MDX组件，包括图片、代码块、提示框等
 */
const defaultComponents: MDXComponents = {
  // 自定义图片组件
  Image: MDXImage,
  img: (props: any) => {
    // 对于标准的 img 标签，如果在段落中使用，则使用内联模式
    return <MDXImage {...props} inline={true} />;
  },
  
  // 代码块组件 (pre标签由Shiki处理，这里处理行内代码)
  code: ({ children, className, ...props }) => {
    // 如果有className且包含language-，说明是代码块，由Shiki处理
    if (className && className.includes('language-')) {
      return <code className={className} {...props}>{children}</code>;
    }
    
    // 行内代码样式
    return (
      <code 
        className="px-1.5 py-0.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-pink-600 dark:text-pink-400"
        {...props}
      >
        {children}
      </code>
    );
  },
  
  // 自定义组件
  CodeBlock,
  Callout,
  ImageGallery,
  
  // 标题组件 - 添加锚点链接
  h1: ({ children, id, ...props }) => (
    <h1 
      id={id} 
      className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100 scroll-mt-20"
      {...props}
    >
      {children}
      {id && (
        <a 
          href={`#${id}`} 
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to this section"
        >
          #
        </a>
      )}
    </h1>
  ),
  
  h2: ({ children, id, ...props }) => (
    <h2 
      id={id} 
      className="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100 scroll-mt-20 group"
      {...props}
    >
      {children}
      {id && (
        <a 
          href={`#${id}`} 
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to this section"
        >
          #
        </a>
      )}
    </h2>
  ),
  
  h3: ({ children, id, ...props }) => (
    <h3 
      id={id} 
      className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-100 scroll-mt-20 group"
      {...props}
    >
      {children}
      {id && (
        <a 
          href={`#${id}`} 
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to this section"
        >
          #
        </a>
      )}
    </h3>
  ),
  
  // 段落 - 检查是否包含块级元素
  p: ({ children, ...props }) => {
    // 检查children中是否包含块级元素（如figure, div等）
    const hasBlockElements = React.Children.toArray(children).some(child => {
      if (React.isValidElement(child)) {
        // 检查是否是我们的自定义组件（通常渲染为块级元素）
        const componentName = child.type?.toString();
        return componentName?.includes('MDXImage') || 
               componentName?.includes('ImageGallery') ||
               componentName?.includes('Callout') ||
               child.type === 'figure' ||
               child.type === 'div';
      }
      return false;
    });

    // 如果包含块级元素，使用div而不是p
    if (hasBlockElements) {
      return (
        <div className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
          {children}
        </div>
      );
    }

    return (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
        {children}
      </p>
    );
  },
  
  // 列表
  ul: ({ children, ...props }) => (
    <ul className="mb-4 ml-6 list-disc text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  
  // 链接
  a: ({ children, href, ...props }) => (
    <a 
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  
  // 引用块
  blockquote: ({ children, ...props }) => (
    <blockquote 
      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  
  // 表格
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
        {children}
      </table>
    </div>
  ),
  
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  ),
  
  th: ({ children, ...props }) => (
    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </th>
  ),
  
  td: ({ children, ...props }) => (
    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </td>
  ),
  
  // 分隔线
  hr: (props) => (
    <hr className="my-8 border-gray-300 dark:border-gray-600" {...props} />
  ),
  
  // 强调
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </strong>
  ),
  
  em: ({ children, ...props }) => (
    <em className="italic text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </em>
  ),
};

/**
 * MDX渲染器组件
 * 
 * 功能特性：
 * - 集成 next-mdx-remote 进行MDX内容渲染
 * - 提供丰富的默认组件库
 * - 支持自定义组件扩展
 * - 内置错误边界保护
 * - 支持暗色主题
 * - 响应式设计
 */
export function MDXRenderer({ 
  mdxSource, 
  components = {}, 
  className = '',
  enableErrorBoundary = true 
}: MDXRendererProps) {
  // 合并默认组件和自定义组件
  const mergedComponents = {
    ...defaultComponents,
    ...components,
  };

  // 渲染内容
  const content = (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
      <MDXRemote 
        {...mdxSource} 
        components={mergedComponents}
      />
    </div>
  );

  // 如果启用错误边界，包装内容
  if (enableErrorBoundary) {
    return (
      <MDXErrorBoundary>
        {content}
      </MDXErrorBoundary>
    );
  }

  return content;
}

// 导出默认组件库供外部使用
export { defaultComponents };
export type { MDXRendererProps };