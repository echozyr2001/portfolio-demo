import React, { useState } from "react";

/**
 * 代码块组件属性接口
 */
interface CodeBlockProps {
	/** 代码内容 */
	children: string;
	/** 编程语言 */
	language?: string;
	/** 文件名或标题 */
	filename?: string;
	/** 是否显示行号 */
	showLineNumbers?: boolean;
	/** 高亮的行号 */
	highlightLines?: number[];
	/** 是否启用复制功能 */
	enableCopy?: boolean;
	/** 自定义样式类名 */
	className?: string;
	/** 最大高度 */
	maxHeight?: string;
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			return true;
		} else {
			// 回退方案：使用传统的document.execCommand
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			const result = document.execCommand("copy");
			textArea.remove();
			return result;
		}
	} catch (error) {
		console.error("Failed to copy to clipboard:", error);
		return false;
	}
}

/**
 * 获取语言显示名称
 */
function getLanguageDisplayName(language: string): string {
	const languageMap: Record<string, string> = {
		js: "JavaScript",
		jsx: "JSX",
		ts: "TypeScript",
		tsx: "TSX",
		py: "Python",
		rb: "Ruby",
		go: "Go",
		rs: "Rust",
		cpp: "C++",
		c: "C",
		java: "Java",
		php: "PHP",
		sh: "Shell",
		bash: "Bash",
		zsh: "Zsh",
		fish: "Fish",
		ps1: "PowerShell",
		sql: "SQL",
		html: "HTML",
		css: "CSS",
		scss: "SCSS",
		sass: "Sass",
		less: "Less",
		json: "JSON",
		yaml: "YAML",
		yml: "YAML",
		toml: "TOML",
		xml: "XML",
		md: "Markdown",
		mdx: "MDX",
		dockerfile: "Dockerfile",
		docker: "Docker",
		nginx: "Nginx",
		apache: "Apache",
		vim: "Vim",
		lua: "Lua",
		r: "R",
		matlab: "MATLAB",
		swift: "Swift",
		kotlin: "Kotlin",
		scala: "Scala",
		clojure: "Clojure",
		haskell: "Haskell",
		elm: "Elm",
		dart: "Dart",
		vue: "Vue",
		svelte: "Svelte",
		astro: "Astro",
	};

	return languageMap[language.toLowerCase()] || language.toUpperCase();
}

/**
 * 代码块组件
 *
 * 功能特性：
 * - 支持多种编程语言
 * - 语法高亮（通过Shiki在MDX处理时完成）
 * - 代码复制功能
 * - 行号显示
 * - 文件名显示
 * - 响应式设计
 * - 暗色主题支持
 * - 滚动条优化
 *
 * 注意：实际的语法高亮由Shiki在MDX序列化时处理，
 * 这个组件主要提供UI增强功能
 */
export function CodeBlock({
	children,
	language = "text",
	filename,
	showLineNumbers = false,
	highlightLines = [],
	enableCopy = true,
	className = "",
	maxHeight = "500px",
	...props
}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);

	// 处理复制操作
	const handleCopy = async () => {
		const success = await copyToClipboard(children);
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	// 处理展开/收起
	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	// 计算代码行数
	const lines = children.split("\n");
	const lineCount = lines.length;
	const shouldShowExpandButton = lineCount > 20;

	return (
		<div className={`relative group my-6 ${className}`}>
			{/* 代码块头部 */}
			{(filename || language || enableCopy) && (
				<div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
					<div className="flex items-center space-x-2">
						{/* 文件名 */}
						{filename && (
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{filename}
							</span>
						)}

						{/* 语言标签 */}
						{language && (
							<span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
								{getLanguageDisplayName(language)}
							</span>
						)}

						{/* 行数信息 */}
						<span className="text-xs text-gray-500 dark:text-gray-400">
							{lineCount} {lineCount === 1 ? "line" : "lines"}
						</span>
					</div>

					{/* 操作按钮 */}
					<div className="flex items-center space-x-2">
						{/* 展开/收起按钮 */}
						{shouldShowExpandButton && (
							<button
								onClick={toggleExpanded}
								className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
								title={isExpanded ? "收起代码" : "展开代码"}
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									{isExpanded ? (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 15l7-7 7 7"
										/>
									) : (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									)}
								</svg>
							</button>
						)}

						{/* 复制按钮 */}
						{enableCopy && (
							<button
								onClick={handleCopy}
								className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
								title="复制代码"
							>
								{copied ? (
									<svg
										className="w-4 h-4 text-green-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
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
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								)}
							</button>
						)}
					</div>
				</div>
			)}

			{/* 代码内容容器 */}
			<div
				className={`
          relative overflow-auto bg-gray-50 dark:bg-gray-900 
          ${filename || language || enableCopy ? "rounded-b-lg" : "rounded-lg"}
          ${!isExpanded && shouldShowExpandButton ? "max-h-96" : ""}
        `}
				style={{
					maxHeight: isExpanded || !shouldShowExpandButton ? "none" : maxHeight,
				}}
			>
				{/* 代码块 - 这里的pre和code标签会被Shiki处理 */}
				<pre
					className={`
            p-4 text-sm leading-relaxed overflow-x-auto
            ${showLineNumbers ? "pl-12" : ""}
          `}
					{...props}
				>
					{showLineNumbers && (
						<div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col text-xs text-gray-500 dark:text-gray-400">
							{lines.map((_, index) => (
								<div
									key={index + 1}
									className={`
                    px-2 py-0.5 text-right select-none
                    ${highlightLines.includes(index + 1) ? "bg-yellow-200 dark:bg-yellow-800" : ""}
                  `}
								>
									{index + 1}
								</div>
							))}
						</div>
					)}

					<code className={`language-${language}`}>{children}</code>
				</pre>

				{/* 渐变遮罩（当内容被截断时） */}
				{!isExpanded && shouldShowExpandButton && (
					<div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
				)}
			</div>

			{/* 复制成功提示 */}
			{copied && (
				<div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded shadow-lg">
					已复制!
				</div>
			)}
		</div>
	);
}

// 导出类型
export type { CodeBlockProps };
