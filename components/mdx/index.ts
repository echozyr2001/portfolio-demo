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
import { TechStack } from "./TechStack";
import { ProjectCard } from "./ProjectCard";
import { Timeline } from "./Timeline";
import { Quote } from "./Quote";

// 导入类型
import type { MDXRendererProps } from "./MDXRenderer";
import type { MDXImageProps } from "./MDXImage";
import type { CodeBlockProps } from "./CodeBlock";
import type { CalloutProps, CalloutType } from "./Callout";
import type { ImageGalleryProps, GalleryImage } from "./ImageGallery";
import type { MDXError, MDXErrorBoundaryProps } from "./MDXErrorBoundary";
import type { TechStackProps, TechItem } from "./TechStack";
import type { ProjectCardProps, ProjectLink } from "./ProjectCard";
import type { TimelineProps, TimelineItem } from "./Timeline";
import type { QuoteProps } from "./Quote";

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

// 技术栈组件
export { TechStack };
export type { TechStackProps, TechItem };

// 项目卡片组件
export { ProjectCard };
export type { ProjectCardProps, ProjectLink };

// 时间线组件
export { Timeline };
export type { TimelineProps, TimelineItem };

// 引用组件
export { Quote };
export type { QuoteProps };

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
	ImageGallery: ImageGallery,

	// 代码相关
	CodeBlock: CodeBlock,

	// 内容增强
	Callout: Callout,
	Quote: Quote,

	// 项目相关
	TechStack: TechStack,
	ProjectCard: ProjectCard,
	Timeline: Timeline,
};

/**
 * 完整的MDX组件库
 * 包含所有可用的自定义组件
 */
export const fullMDXComponents = {
	...mdxComponents,
	// HTML元素增强
	blockquote: Quote,
};

/**
 * MDX组件库版本信息
 */
export const MDX_COMPONENTS_VERSION = "2.0.0";

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
	"tech-stack-display",
	"project-showcase",
	"timeline-visualization",
	"enhanced-quotes",
] as const;

export type SupportedMDXFeature = (typeof SUPPORTED_MDX_FEATURES)[number];
