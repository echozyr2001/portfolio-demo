"use client";

import { useState, useCallback, useMemo } from "react";
import { MDXEditor } from "./MDXEditor";
import { MDXPreview } from "./MDXPreview";
import { useSyncScroll } from "./hooks/useSyncScroll";

type PreviewMode = "edit" | "preview" | "split";

interface MDXEditorWithPreviewProps {
	/** 初始内容 */
	initialContent?: string;
	/** 内容变化回调 */
	onChange: (content: string) => void;
	/** 保存回调 */
	onSave: () => void;
	/** 是否正在加载 */
	isLoading?: boolean;
	/** 自动保存延迟 */
	autoSaveDelay?: number;
	/** 容器样式类名 */
	className?: string;
	/** 编辑器高度 */
	height?: string;
	/** 主题 */
	theme?: "light" | "dark";
	/** 初始预览模式 */
	initialPreviewMode?: PreviewMode;
	/** 自定义MDX组件 */
	components?: Record<string, React.ComponentType>;
	/** 是否启用同步滚动 */
	enableSyncScroll?: boolean;
	/** 可用的预览模式 */
	availableModes?: PreviewMode[];
}

/**
 * 带预览功能的MDX编辑器
 *
 * 功能特性：
 * - 三种预览模式：编辑、预览、并排
 * - 实时预览MDX内容
 * - 响应式布局
 * - 错误处理和友好提示
 * - 与前端渲染保持一致的样式
 */
export function MDXEditorWithPreview({
	initialContent = "",
	onChange,
	onSave,
	isLoading = false,
	autoSaveDelay = 2000,
	className = "",
	height = "600px",
	theme = "dark",
	initialPreviewMode = "split",
	components,
	enableSyncScroll = true,
	availableModes = ["edit", "preview", "split"],
}: MDXEditorWithPreviewProps) {
	const [content, setContent] = useState(initialContent);
	const [previewMode, setPreviewMode] = useState<PreviewMode>(() => {
		// 确保初始预览模式在可用模式列表中
		return availableModes.includes(initialPreviewMode)
			? initialPreviewMode
			: availableModes[0] || "edit";
	});
	const [previewError, setPreviewError] = useState<Error | null>(null);
	const [syncScrollEnabled, setSyncScrollEnabled] = useState(enableSyncScroll);

	// 同步滚动功能
	const { setEditorRef, setPreviewRef } = useSyncScroll({
		enabled: syncScrollEnabled && previewMode === "split",
	});

	// 处理内容变化
	const handleContentChange = useCallback(
		(newContent: string) => {
			setContent(newContent);
			onChange(newContent);
			// 清除之前的预览错误
			if (previewError) {
				setPreviewError(null);
			}
		},
		[onChange, previewError],
	);

	// 预览模式按钮配置
	const previewModeButtons = useMemo(() => {
		const allModes = [
			{
				mode: "edit" as const,
				label: "编辑",
				icon: (
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
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				),
			},
			{
				mode: "split" as const,
				label: "并排",
				icon: (
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
							d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
						/>
					</svg>
				),
			},
			{
				mode: "preview" as const,
				label: "预览",
				icon: (
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
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
						/>
					</svg>
				),
			},
		];
		// 只返回availableModes中指定的模式
		return allModes.filter((mode) => availableModes.includes(mode.mode));
	}, [availableModes]);

	// 计算布局样式
	const layoutStyles = useMemo(() => {
		switch (previewMode) {
			case "edit":
				return {
					container: "grid grid-cols-1",
					editor: "block",
					preview: "hidden",
				};
			case "preview":
				return {
					container: "grid grid-cols-1",
					editor: "hidden",
					preview: "block",
				};
			case "split":
			default:
				return {
					container: "grid grid-cols-1 lg:grid-cols-2 gap-4",
					editor: "block",
					preview: "block",
				};
		}
	}, [previewMode]);

	return (
		<div className={`mdx-editor-with-preview ${className}`}>
			{/* 预览模式切换栏 */}
			<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="flex items-center space-x-1">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
						预览模式:
					</span>
					{previewModeButtons.map(({ mode, label, icon }) => (
						<button
							key={mode}
							onClick={() => setPreviewMode(mode)}
							className={`
                flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                ${
									previewMode === mode
										? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
										: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
								}
              `}
							disabled={isLoading}
						>
							{icon}
							<span>{label}</span>
						</button>
					))}
				</div>

				{/* 预览状态指示器 */}
				<div className="flex items-center space-x-3">
					{/* 同步滚动开关 */}
					{previewMode === "split" && (
						<button
							onClick={() => setSyncScrollEnabled(!syncScrollEnabled)}
							className={`
                flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors
                ${
									syncScrollEnabled
										? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
										: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
								}
              `}
							title={syncScrollEnabled ? "禁用同步滚动" : "启用同步滚动"}
						>
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
								/>
							</svg>
							<span>同步</span>
						</button>
					)}

					{previewError && (
						<div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="text-xs">预览错误</span>
						</div>
					)}

					{!previewError &&
						(previewMode === "preview" || previewMode === "split") && (
							<div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-xs">预览正常</span>
							</div>
						)}
				</div>
			</div>

			{/* 编辑器和预览区域 */}
			<div className={layoutStyles.container} style={{ minHeight: height }}>
				{/* 编辑器区域 */}
				<div className={layoutStyles.editor}>
					<div className="h-full">
						<MDXEditor
							initialContent={content}
							onChange={handleContentChange}
							onSave={onSave}
							isLoading={isLoading}
							autoSaveDelay={autoSaveDelay}
							height={height}
							theme={theme}
							className="h-full"
							onEditorMount={setEditorRef}
						/>
					</div>
				</div>

				{/* 预览区域 */}
				<div className={layoutStyles.preview}>
					<div className="h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
						{/* 预览标题栏 */}
						<div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
							<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
								实时预览
							</h3>
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-green-400 rounded-full"></div>
								<span className="text-xs text-gray-500 dark:text-gray-400">
									实时
								</span>
							</div>
						</div>

						{/* 预览内容 */}
						<div
							className="overflow-auto bg-white dark:bg-gray-900 p-6"
							style={{ height: `calc(${height} - 40px)` }}
							ref={setPreviewRef}
						>
							<MDXPreview
								mdxContent={content}
								components={components}
								onError={setPreviewError}
								onSuccess={() => setPreviewError(null)}
								className="h-full"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* 响应式提示 */}
			{previewMode === "split" && (
				<div className="lg:hidden p-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
					<p className="text-sm text-yellow-800 dark:text-yellow-200">
						💡
						在大屏幕上可以同时查看编辑器和预览。在小屏幕上建议切换到&quot;编辑&quot;或&quot;预览&quot;模式。
					</p>
				</div>
			)}
		</div>
	);
}
