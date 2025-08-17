'use client';

import { useState, useEffect } from 'react';
import { MDXRenderer } from '../mdx/MDXRenderer';
import { mdxProcessor } from '@/lib/mdx-processor';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

interface MDXPreviewProps {
  /** MDX内容 */
  mdxContent: string;
  /** 自定义组件 */
  components?: Record<string, React.ComponentType>;
  /** 容器样式类名 */
  className?: string;
  /** 是否显示加载状态 */
  showLoading?: boolean;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 预览成功回调 */
  onSuccess?: () => void;
  /** 预览容器引用回调 */
  onContainerRef?: (element: HTMLDivElement | null) => void;
}

interface PreviewState {
  mdxSource: MDXRemoteSerializeResult | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * MDX实时预览组件
 * 
 * 功能特性：
 * - 实时解析和渲染MDX内容
 * - 错误处理和友好提示
 * - 加载状态显示
 * - 与前端渲染保持一致的样式
 * - 防抖优化性能
 */
export function MDXPreview({
  mdxContent,
  components,
  className = '',
  showLoading = true,
  onError,
  onSuccess,
  onContainerRef
}: MDXPreviewProps) {
  const [state, setState] = useState<PreviewState>({
    mdxSource: null,
    isLoading: false,
    error: null
  });

  // 防抖处理MDX内容变化 - 暂时移除，直接使用mdxContent
  // const debouncedContent = useMemo(() => {
  //   const timeoutId = setTimeout(() => {
  //     return mdxContent;
  //   }, 300);

  //   return () => clearTimeout(timeoutId);
  // }, [mdxContent]);

  // 处理MDX内容序列化
  useEffect(() => {
    let isCancelled = false;

    const processContent = async () => {
      if (!mdxContent.trim()) {
        setState({
          mdxSource: null,
          isLoading: false,
          error: null
        });
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await mdxProcessor.serialize(mdxContent, {
          enableCodeHighlight: true,
          shikiTheme: 'github-dark'
        });

        if (!isCancelled) {
          setState({
            mdxSource: result.mdxSource,
            isLoading: false,
            error: null
          });
          onSuccess?.();
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (!isCancelled) {
          setState({
            mdxSource: null,
            isLoading: false,
            error: err
          });
          onError?.(err);
        }
      }
    };

    processContent();

    return () => {
      isCancelled = true;
    };
  }, [mdxContent]);

  // 渲染加载状态
  if (state.isLoading && showLoading) {
    return (
      <div className={`mdx-preview-loading ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              正在渲染预览...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (state.error) {
    return (
      <div className={`mdx-preview-error ${className}`}>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                MDX 渲染错误
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p className="font-mono text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded border">
                  {state.error.message}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs text-red-600 dark:text-red-400">
                  请检查MDX语法是否正确，特别注意：
                </p>
                <ul className="mt-1 text-xs text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                  <li>React组件的导入和使用</li>
                  <li>JSX语法的正确性</li>
                  <li>Frontmatter格式</li>
                  <li>代码块的语言标识</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 渲染空状态
  if (!state.mdxSource) {
    return (
      <div className={`mdx-preview-empty ${className}`}>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-sm">开始输入MDX内容以查看预览</p>
          </div>
        </div>
      </div>
    );
  }

  // 渲染MDX内容
  return (
    <div 
      ref={onContainerRef}
      className={`mdx-preview ${className}`}
    >
      <MDXRenderer
        mdxSource={state.mdxSource}
        components={components}
        className="max-w-none"
        enableErrorBoundary={true}
      />
    </div>
  );
}