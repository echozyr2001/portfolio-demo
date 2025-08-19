/**
 * MDX组件库入口文件
 *
 * 导出所有MDX相关组件和类型，提供统一的导入接口
 */

// 首先导入所有组件
import { MDXRenderer, defaultComponents } from "./MDXRenderer";
import { MDXImage } from "./MDXImage";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { ImageGallery } from "./ImageGallery";
import { MDXErrorBoundary, MDXErrorHandler } from "./MDXErrorBoundary";

// 导入类型
import type { MDXRendererProps } from "./MDXRenderer";
import type { MDXImageProps } from "./MDXImage";
import type { CodeBlockProps } from "./CodeBlock";
import type { CalloutProps, CalloutType } from "./Callout";
import type { ImageGalleryProps, GalleryImage } from "./ImageGallery";
import type { MDXError, MDXErrorBoundaryProps } from "./MDXErrorBoundary";

// 核心渲染组件
export { MDXRenderer, defaultComponents };
export type { MDXRendererProps };

// 图片组件
export { MDXImage };
export type { MDXImageProps };

// 代码块组件
export { CodeBlock };
export type { CodeBlockProps };

// 提示框组件
export { Callout };
export type { CalloutProps, CalloutType };

// 图片画廊组件
export { ImageGallery };
export type { ImageGalleryProps, GalleryImage };

// 错误边界组件
export { MDXErrorBoundary, MDXErrorHandler };
export type { MDXError, MDXErrorBoundaryProps };

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
export const MDX_COMPONENTS_VERSION = "1.0.0";

/**
 * 支持的MDX特性列表
 */
export const SUPPORTED_MDX_FEATURES = [
	"syntax-highlighting",
	"custom-components",
	"image-optimization",
	"error-boundaries",
	"responsive-design",
	"dark-theme",
	"accessibility",
	"lazy-loading",
	"blurhash-placeholders",
	"lightbox-gallery",
	"code-copy",
	"collapsible-callouts",
] as const;

export type SupportedMDXFeature = (typeof SUPPORTED_MDX_FEATURES)[number];
