"use client";

import { useState, useCallback, useRef } from "react";
import { MDXEditor } from "./MDXEditor";
import { MDXLivePreview } from "./MDXLivePreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
	FileText, 
	Eye, 
	Code2, 
	Settings, 
	Save, 
	AlertCircle,
	CheckCircle,
	Info,
	Lightbulb
} from "lucide-react";
import type { editor } from "monaco-editor";

interface CMSMDXEditorProps {
	/** 初始内容 */
	initialContent?: string;
	/** 内容变化回调 */
	onChange: (content: string) => void;
	/** 保存回调 */
	onSave: () => Promise<void> | void;
	/** 是否正在加载 */
	isLoading?: boolean;
	/** 自动保存延迟 */
	autoSaveDelay?: number;
	/** 编辑器高度 */
	height?: string;
	/** 主题 */
	theme?: "light" | "dark";
	/** 错误处理回调 */
	onError?: (error: Error) => void;
	/** 自定义类名 */
	className?: string;
	/** 是否显示帮助面板 */
	showHelp?: boolean;
	/** 是否显示统计信息 */
	showStats?: boolean;
}

interface ContentStats {
	words: number;
	characters: number;
	charactersNoSpaces: number;
	paragraphs: number;
	readingTime: number;
	headings: number;
	links: number;
	images: number;
	codeBlocks: number;
}

export function CMSMDXEditor({
	initialContent = "",
	onChange,
	onSave,
	isLoading = false,
	autoSaveDelay = 2000,
	height = "600px",
	theme = "dark",
	onError,
	className = "",
	showHelp = true,
	showStats = true,
}: CMSMDXEditorProps) {
	const [currentContent, setCurrentContent] = useState(initialContent);
	const [showPreview, setShowPreview] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [activeTab, setActiveTab] = useState("editor");
	const [contentStats, setContentStats] = useState<ContentStats>({
		words: 0,
		characters: 0,
		charactersNoSpaces: 0,
		paragraphs: 0,
		readingTime: 0,
		headings: 0,
		links: 0,
		images: 0,
		codeBlocks: 0,
	});
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	// 计算内容统计
	const calculateStats = useCallback((content: string): ContentStats => {
		const words = content.trim() ? content.trim().split(/\s+/).length : 0;
		const characters = content.length;
		const charactersNoSpaces = content.replace(/\s/g, '').length;
		const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim()).length;
		const readingTime = Math.ceil(words / 200); // 假设每分钟200词
		
		// 统计 Markdown 元素
		const headings = (content.match(/^#{1,6}\s/gm) || []).length;
		const links = (content.match(/\[([^\]]*)\]\(([^)]*)\)/g) || []).length;
		const images = (content.match(/!\[([^\]]*)\]\(([^)]*)\)/g) || []).length;
		const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;

		return {
			words,
			characters,
			charactersNoSpaces,
			paragraphs,
			readingTime,
			headings,
			links,
			images,
			codeBlocks,
		};
	}, []);

	// 验证 MDX 内容
	const validateContent = useCallback((content: string) => {
		const errors: string[] = [];
		const warnings: string[] = [];
		const lines = content.split('\n');

		lines.forEach((line, index) => {
			const lineNumber = index + 1;

			// 检查未闭合的 JSX 标签
			const openTags = line.match(/<[A-Z][a-zA-Z0-9]*(?:\s[^>]*)?>(?!.*\/>)/g) || [];
			const closeTags = line.match(/<\/[A-Z][a-zA-Z0-9]*>/g) || [];
			const selfClosingTags = line.match(/<[A-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/>/g) || [];

			if (openTags.length > closeTags.length + selfClosingTags.length) {
				errors.push(`第 ${lineNumber} 行: 可能存在未闭合的 JSX 标签`);
			}

			// 检查未闭合的代码块
			if (line.trim().startsWith('```') && !line.trim().endsWith('```')) {
				const remainingLines = lines.slice(index + 1);
				const hasClosing = remainingLines.some(l => l.trim().startsWith('```'));
				if (!hasClosing) {
					errors.push(`第 ${lineNumber} 行: 未闭合的代码块`);
				}
			}

			// 检查空的链接
			if (line.match(/\[([^\]]*)\]\(\s*\)/)) {
				warnings.push(`第 ${lineNumber} 行: 链接 URL 为空`);
			}

			// 检查空的图片 alt 文本
			if (line.match(/!\[\s*\]\([^)]+\)/)) {
				warnings.push(`第 ${lineNumber} 行: 图片缺少 alt 文本`);
			}

			// 检查过长的行
			if (line.length > 120) {
				warnings.push(`第 ${lineNumber} 行: 行长度超过 120 字符，建议换行`);
			}
		});

		// 检查 frontmatter
		if (content.startsWith('---')) {
			const frontmatterEnd = content.indexOf('---', 3);
			if (frontmatterEnd === -1) {
				errors.push('Frontmatter 未正确闭合');
			}
		}

		setValidationErrors(errors);
		setValidationWarnings(warnings);
	}, []);

	// 处理内容变化
	const handleContentChange = useCallback((content: string) => {
		setCurrentContent(content);
		onChange(content);
		setContentStats(calculateStats(content));
		validateContent(content);
	}, [onChange, calculateStats, validateContent]);

	// 处理编辑器挂载
	const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
		editorRef.current = editor;
		
		// 初始化统计和验证
		const initialContent = editor.getValue();
		setContentStats(calculateStats(initialContent));
		validateContent(initialContent);
	}, [calculateStats, validateContent]);

	// 处理保存
	const handleSave = useCallback(async () => {
		try {
			await onSave();
		} catch (error) {
			onError?.(error as Error);
		}
	}, [onSave, onError]);

	// MDX 组件帮助信息
	const mdxHelp = [
		{
			title: "基础 Markdown",
			items: [
				"# 标题 - 一级标题",
				"## 标题 - 二级标题",
				"**粗体** - 粗体文本",
				"*斜体* - 斜体文本",
				"`代码` - 行内代码",
				"[链接](URL) - 链接",
				"![图片](URL) - 图片",
			]
		},
		{
			title: "MDX 组件",
			items: [
				"<Image id=\"media-id\" alt=\"描述\" /> - 图片组件",
				"<CodeBlock language=\"js\">代码</CodeBlock> - 代码块",
				"<Callout type=\"info\">提示</Callout> - 提示框",
				"<ProjectCard project={data} /> - 项目卡片",
				"<TechStack technologies={[]} /> - 技术栈",
			]
		},
		{
			title: "快捷键",
			items: [
				"Ctrl+S - 保存",
				"Ctrl+B - 粗体",
				"Ctrl+I - 斜体",
				"Ctrl+K - 插入链接",
				"Ctrl+Shift+C - 代码块",
				"Ctrl+F - 查找",
				"Shift+Alt+F - 格式化",
			]
		}
	];

	return (
		<div className={`cms-mdx-editor ${className}`}>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
					<TabsList className="grid w-auto grid-cols-3">
						<TabsTrigger value="editor" className="flex items-center space-x-2">
							<Code2 size={16} />
							<span>编辑器</span>
						</TabsTrigger>
						<TabsTrigger value="preview" className="flex items-center space-x-2">
							<Eye size={16} />
							<span>预览</span>
						</TabsTrigger>
						<TabsTrigger value="help" className="flex items-center space-x-2">
							<Lightbulb size={16} />
							<span>帮助</span>
						</TabsTrigger>
					</TabsList>

					{/* 验证状态 */}
					<div className="flex items-center space-x-2">
						{validationErrors.length > 0 && (
							<Badge variant="destructive" className="flex items-center space-x-1">
								<AlertCircle size={12} />
								<span>{validationErrors.length} 错误</span>
							</Badge>
						)}
						{validationWarnings.length > 0 && (
							<Badge variant="secondary" className="flex items-center space-x-1">
								<Info size={12} />
								<span>{validationWarnings.length} 警告</span>
							</Badge>
						)}
						{validationErrors.length === 0 && validationWarnings.length === 0 && (
							<Badge variant="default" className="flex items-center space-x-1 bg-green-600">
								<CheckCircle size={12} />
								<span>无问题</span>
							</Badge>
						)}
					</div>
				</div>

				<TabsContent value="editor" className="mt-0">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
						{/* 主编辑器 */}
						<div className="lg:col-span-3">
							<MDXEditor
								initialContent={initialContent}
								onChange={handleContentChange}
								onSave={handleSave}
								isLoading={isLoading}
								autoSaveDelay={autoSaveDelay}
								height={height}
								theme={theme}
								onEditorMount={handleEditorMount}
								onPreviewToggle={setShowPreview}
								onFullscreenToggle={setIsFullscreen}
								onError={onError}
								showPreview={showPreview}
								isFullscreen={isFullscreen}
							/>

							{/* 验证消息 */}
							{(validationErrors.length > 0 || validationWarnings.length > 0) && (
								<div className="mt-4 space-y-2">
									{validationErrors.map((error, index) => (
										<Alert key={`error-${index}`} variant="destructive">
											<AlertCircle className="h-4 w-4" />
											<AlertDescription>{error}</AlertDescription>
										</Alert>
									))}
									{validationWarnings.map((warning, index) => (
										<Alert key={`warning-${index}`}>
											<Info className="h-4 w-4" />
											<AlertDescription>{warning}</AlertDescription>
										</Alert>
									))}
								</div>
							)}
						</div>

						{/* 侧边栏 */}
						{showStats && (
							<div className="lg:col-span-1">
								<Card>
									<CardHeader>
										<CardTitle className="text-sm flex items-center space-x-2">
											<FileText size={16} />
											<span>文档统计</span>
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="grid grid-cols-2 gap-2 text-sm">
											<div>
												<span className="text-gray-500 dark:text-gray-400">字数</span>
												<div className="font-medium">{contentStats.words}</div>
											</div>
											<div>
												<span className="text-gray-500 dark:text-gray-400">字符</span>
												<div className="font-medium">{contentStats.characters}</div>
											</div>
											<div>
												<span className="text-gray-500 dark:text-gray-400">段落</span>
												<div className="font-medium">{contentStats.paragraphs}</div>
											</div>
											<div>
												<span className="text-gray-500 dark:text-gray-400">阅读时间</span>
												<div className="font-medium">{contentStats.readingTime}分钟</div>
											</div>
										</div>

										<Separator />

										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-500 dark:text-gray-400">标题</span>
												<span className="font-medium">{contentStats.headings}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500 dark:text-gray-400">链接</span>
												<span className="font-medium">{contentStats.links}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500 dark:text-gray-400">图片</span>
												<span className="font-medium">{contentStats.images}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-500 dark:text-gray-400">代码块</span>
												<span className="font-medium">{contentStats.codeBlocks}</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="preview" className="mt-0">
					<Card className="h-[600px]">
						<CardContent className="p-0 h-full">
							<MDXLivePreview
								content={currentContent}
								theme={theme}
								showErrorDetails={true}
								showStats={true}
								showMetadata={true}
								onError={onError}
								className="h-full"
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="help" className="mt-0">
					{showHelp && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{mdxHelp.map((section, index) => (
								<Card key={index}>
									<CardHeader>
										<CardTitle className="text-sm">{section.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-48">
											<div className="space-y-2">
												{section.items.map((item, itemIndex) => (
													<div key={itemIndex} className="text-sm">
														<code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
															{item}
														</code>
													</div>
												))}
											</div>
										</ScrollArea>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}