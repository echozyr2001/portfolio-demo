"use client";

import { useState, useCallback } from "react";
import { MDXPreview } from "./MDXPreview";

interface MDXPreviewPanelProps {
	/** MDX内容 */
	mdxContent: string;
	/** 自定义组件 */
	components?: Record<string, React.ComponentType>;
	/** 容器样式类名 */
	className?: string;
	/** 面板标题 */
	title?: string;
	/** 是否显示工具栏 */
	showToolbar?: boolean;
	/** 是否可折叠 */
	collapsible?: boolean;
	/** 初始折叠状态 */
	initialCollapsed?: boolean;
	/** 面板高度 */
	height?: string;
}

/**
 * MDX预览面板组件
 *
 * 功能特性：
 * - 独立的预览面板，可嵌入任何布局
 * - 可折叠的面板设计
 * - 错误状态显示
 * - 工具栏操作
 * - 响应式设计
 */
export function MDXPreviewPanel({
	mdxContent,
	components,
	className = "",
	title = "预览",
	showToolbar = true,
	collapsible = true,
	initialCollapsed = false,
	height = "600px",
}: MDXPreviewPanelProps) {
	const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
	const [hasError, setHasError] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	// 切换折叠状态
	const toggleCollapsed = useCallback(() => {
		if (collapsible) {
			setIsCollapsed(!isCollapsed);
		}
	}, [collapsible, isCollapsed]);

	// 切换全屏模式
	const toggleFullscreen = useCallback(() => {
		setIsFullscreen(!isFullscreen);
	}, [isFullscreen]);

	// 复制内容到剪贴板
	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(mdxContent);
			// 可以添加成功提示
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
		}
	}, [mdxContent]);

	// 处理预览错误
	const handlePreviewError = useCallback((error: Error) => {
		setHasError(true);
		console.error("Preview error:", error);
	}, []);

	// 处理预览成功
	const handlePreviewSuccess = useCallback(() => {
		setHasError(false);
	}, []);

	return (
		<div
			className={`
        mdx-preview-panel bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
        ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""}
        ${className}
      `}
		>
			{/* 工具栏 */}
			{showToolbar && (
				<div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center space-x-3">
						{/* 折叠按钮 */}
						{collapsible && (
							<button
								onClick={toggleCollapsed}
								className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
								title={isCollapsed ? "展开预览" : "折叠预览"}
							>
								<svg
									className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>
						)}

						{/* 标题 */}
						<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{title}
						</h3>

						{/* 状态指示器 */}
						<div className="flex items-center space-x-2">
							{hasError ? (
								<div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
									<svg
										className="w-3 h-3"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="text-xs">错误</span>
								</div>
							) : (
								<div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
									<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
									<span className="text-xs">实时</span>
								</div>
							)}
						</div>
					</div>

					{/* 工具按钮 */}
					<div className="flex items-center space-x-1">
						{/* 复制按钮 */}
						<button
							onClick={copyToClipboard}
							className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
							title="复制MDX内容"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
						</button>

						{/* 全屏按钮 */}
						<button
							onClick={toggleFullscreen}
							className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
							title={isFullscreen ? "退出全屏" : "全屏预览"}
						>
							{isFullscreen ? (
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							) : (
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			)}

			{/* 预览内容 */}
			{!isCollapsed && (
				<div
					className="overflow-auto"
					style={{ height: isFullscreen ? "calc(100vh - 120px)" : height }}
				>
					<div className="p-6">
						<MDXPreview
							mdxContent={mdxContent}
							components={components}
							onError={handlePreviewError}
							onSuccess={handlePreviewSuccess}
							className="max-w-none"
						/>
					</div>
				</div>
			)}

			{/* 折叠状态提示 */}
			{isCollapsed && (
				<div className="p-4 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						预览已折叠，点击上方按钮展开
					</p>
				</div>
			)}

			{/* 全屏模式背景遮罩 */}
			{isFullscreen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={toggleFullscreen}
				/>
			)}
		</div>
	);
}
