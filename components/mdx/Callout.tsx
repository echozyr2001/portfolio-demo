import React from "react";

/**
 * 提示框类型
 */
type CalloutType = "info" | "warning" | "error" | "success" | "note" | "tip";

/**
 * 提示框组件属性接口
 */
interface CalloutProps {
	/** 提示框类型 */
	type?: CalloutType;
	/** 自定义标题 */
	title?: string;
	/** 内容 */
	children: React.ReactNode;
	/** 是否可折叠 */
	collapsible?: boolean;
	/** 默认是否展开（仅在collapsible为true时有效） */
	defaultOpen?: boolean;
	/** 自定义样式类名 */
	className?: string;
	/** 自定义图标 */
	icon?: React.ReactNode;
}

/**
 * 获取提示框配置
 */
function getCalloutConfig(type: CalloutType) {
	const configs = {
		info: {
			title: "信息",
			bgColor: "bg-blue-50 dark:bg-blue-950",
			borderColor: "border-blue-200 dark:border-blue-800",
			textColor: "text-blue-800 dark:text-blue-200",
			titleColor: "text-blue-900 dark:text-blue-100",
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fillRule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		warning: {
			title: "警告",
			bgColor: "bg-yellow-50 dark:bg-yellow-950",
			borderColor: "border-yellow-200 dark:border-yellow-800",
			textColor: "text-yellow-800 dark:text-yellow-200",
			titleColor: "text-yellow-900 dark:text-yellow-100",
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fillRule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		error: {
			title: "错误",
			bgColor: "bg-red-50 dark:bg-red-950",
			borderColor: "border-red-200 dark:border-red-800",
			textColor: "text-red-800 dark:text-red-200",
			titleColor: "text-red-900 dark:text-red-100",
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fillRule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		success: {
			title: "成功",
			bgColor: "bg-green-50 dark:bg-green-950",
			borderColor: "border-green-200 dark:border-green-800",
			textColor: "text-green-800 dark:text-green-200",
			titleColor: "text-green-900 dark:text-green-100",
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		note: {
			title: "注意",
			bgColor: "bg-gray-50 dark:bg-gray-900",
			borderColor: "border-gray-200 dark:border-gray-700",
			textColor: "text-gray-800 dark:text-gray-200",
			titleColor: "text-gray-900 dark:text-gray-100",
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fillRule="evenodd"
						d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		tip: {
			title: "提示",
			bgColor: "bg-purple-50 dark:bg-purple-950",
			borderColor: "border-purple-200 dark:border-purple-800",
			textColor: "text-purple-800 dark:text-purple-200",
			titleColor: "text-purple-900 dark:text-purple-100",
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
			),
		},
	};

	return configs[type];
}

/**
 * 提示框组件
 *
 * 功能特性：
 * - 多种提示框类型（信息、警告、错误、成功、注意、提示）
 * - 可折叠功能
 * - 自定义标题和图标
 * - 响应式设计
 * - 暗色主题支持
 * - 无障碍访问支持
 */
export function Callout({
	type = "info",
	title,
	children,
	collapsible = false,
	defaultOpen = true,
	className = "",
	icon,
	...props
}: CalloutProps) {
	const [isOpen, setIsOpen] = React.useState(defaultOpen);
	const config = getCalloutConfig(type);
	const displayTitle = title || config.title;
	const displayIcon = icon || config.icon;

	const toggleOpen = () => {
		if (collapsible) {
			setIsOpen(!isOpen);
		}
	};

	return (
		<div
			className={`
        my-6 border-l-4 rounded-r-lg overflow-hidden
        ${config.bgColor} ${config.borderColor} ${className}
      `}
			role="alert"
			aria-expanded={collapsible ? isOpen : undefined}
			{...props}
		>
			{/* 标题栏 */}
			<div
				className={`
          flex items-center px-4 py-3 
          ${config.titleColor}
          ${collapsible ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" : ""}
        `}
				onClick={toggleOpen}
			>
				{/* 图标 */}
				<div className="flex-shrink-0 mr-3">{displayIcon}</div>

				{/* 标题 */}
				<h4 className="font-semibold text-sm uppercase tracking-wide">
					{displayTitle}
				</h4>

				{/* 折叠按钮 */}
				{collapsible && (
					<div className="ml-auto">
						<svg
							className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</div>
				)}
			</div>

			{/* 内容区域 */}
			{(!collapsible || isOpen) && (
				<div className={`px-4 pb-4 ${config.textColor}`}>
					<div className="prose prose-sm max-w-none">{children}</div>
				</div>
			)}
		</div>
	);
}

// 导出类型
export type { CalloutProps, CalloutType };
