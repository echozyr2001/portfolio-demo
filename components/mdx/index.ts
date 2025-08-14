/**
 * MDX组件库入口文件
 * 
 * 导出所有MDX相关组件和类型，提供统一的导入接口
 */

// 核心渲染组件
export { MDXRenderer, defaultComponents } from './MDXRenderer';
export type { MDXRendererProps } from './MDXRenderer';

// 图片组件
export { MDXImage } from './MDXImage';
export type { MDXImageProps } from './MDXImage';

// 代码块组件
export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';

// 提示框组件
export { Callout } from './Callout';
export type { CalloutProps, CalloutType } from './Callout';

// 图片画廊组件
export { ImageGallery } from './ImageGallery';
export type { ImageGalleryProps, GalleryImage } from './ImageGallery';

// 错误边界组件
export { MDXErrorBoundary, MDXErrorHandler } from './MDXErrorBoundary';
export type { MDXError, MDXErrorBoundaryProps } from './MDXErrorBoundary';

/**
 * 预设的MDX组件配置
 */
export const mdxComponents = {
  // 图片相关
  Image: MDXImage,
  img: MDXImage,
  
  // 代码相关
  CodeBlock: CodeBlock,
  
  // 内容增强
  Callout: Callout,
  ImageGallery: ImageGallery,
};

/**
 * 完整的MDX组件库
 * 包含所有可用的自定义组件
 */
export const fullMDXComponents = {
  ...mdxComponents,
  // 可以在这里添加更多组件
};

/**
 * MDX组件库版本信息
 */
export const MDX_COMPONENTS_VERSION = '1.0.0';

/**
 * 支持的MDX特性列表
 */
export const SUPPORTED_MDX_FEATURES = [
  'syntax-highlighting',
  'custom-components',
  'image-optimization',
  'error-boundaries',
  'responsive-design',
  'dark-theme',
  'accessibility',
  'lazy-loading',
  'blurhash-placeholders',
  'lightbox-gallery',
  'code-copy',
  'collapsible-callouts',
] as const;

export type SupportedMDXFeature = typeof SUPPORTED_MDX_FEATURES[number];