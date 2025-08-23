"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { mdxCoreProcessor } from "@/lib/mdx-core";
import { MDXComponents } from "@/lib/mdx-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
	AlertCircle, 
	CheckCircle, 
	Info, 
	RefreshCw, 
	Eye,
	EyeOff,
	Loader2,
	Clock,
	FileText,
	Hash,
	Link,
	Image as ImageIcon,
	Code
} from "lucide-react";

interface MDXLivePreviewProps {
	/** MDX 内容 */
	content: string;
	/** 预览主题 */
	theme?: "light" | "dark";
	/** 是否显示错误详情 */
	showErrorDetails?: boolean;
	/** 是否显示统计信息 */
	showStats?: boolean;
	/** 是否显示元数据 */
	showMetadata?: boolean;
	/** 自定义类名 */
	className?: string;
	/** 错误回调 */
	onError?: (error: Error) => void;
	/** 编译成功回调 */
	onCompileSuccess?: (result: any) => void;
	/** 滚动同步回调 */
	onScroll?: (scrollTop: number) => void;
}

interface PreviewState {
	mdxSource: MDXRemoteSerializeResult | null;
	isLoading: boolean;
	error: string | null;
	warnings: string[];
	metadata: any;
	stats: {
		wordCount: number;
		readingTime: number;
		characters: number;
		headings: number;
		links: number;
		images: number;
		codeBlocks: number;
	};
}

export function MDXLivePreview({
	content,
	theme = "light",
	showErrorDetails = true,
	showStats = true,
	showMetadata = true,
	className = "",
	onError,
	onCompileSuccess,
	onScroll,
}: MDXLivePreviewProps) {
	const [state, setState] = useState<PreviewState>({
		mdxSource: null,
		isLoading: false,
		error: null,
		warnings: [],
		metadata: {},
		stats: {
			wordCount: 0,
			readingTime: 0,
			characters: 0,
			headings: 0,
			links: 0,
			images: 0,
			codeBlocks: 0,
		},
	});

	const [showPreview, setShowPreview] = useState(true);
	const [lastCompileTime, setLastCompileTime] = useState<Date | null>(null);

	// 计算内容统计
	const calculateContentStats = useCallback((content: string) => {
		const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
		const characters = content.length;
		const readingTime = Math.ceil(wordCount / 200);
		
		// 统计各种元素
		const headings = (content.match(/^#{1,6}\s/gm) || []).length;
		const links = (content.match(/\[([^\]]*)\]\(([^)]*)\)/g) || []).length;
		const images = (content.match(/!\[([^\]]*)\]\(([^)]*)\)/g) || []).length;
		const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;

		return {
			wordCount,
			characters,
			readingTime,
			headings,
			links,
			images,
			codeBlocks,
		};
	}, []);

	// 编译 MDX 内容
	const compileMDX = useCallback(async (mdxContent: string) => {
		if (!mdxContent.trim()) {
			setState(prev => ({
				...prev,
				mdxSource: null,
				error: null,
				warnings: [],
				metadata: {},
				stats: calculateContentStats(""),
			}));
			return;
		}

		setState(prev => ({ ...prev, isLoading: true, error: null }));

		try {
			// 使用 MDX 核心处理器编译内容
			const result = await mdxCoreProcessor.compile(mdxContent, {
				enableCodeHighlight: true,
				sanitizeContent: true,
				development: true,
			});

			// 验证内容
			const validation = await mdxCoreProcessor.validate(mdxContent);

			setState(prev => ({
				...prev,
				mdxSource: result.mdxSource,
				isLoading: false,
				error: null,
				warnings: validation.warnings.map(w => w.message),
				metadata: result.metadata,
				stats: {
					wordCount: result.wordCount,
					readingTime: result.readingTime,
					characters: calculateContentStats(mdxContent).characters,
					headings: calculateContentStats(mdxContent).headings,
					links: calculateContentStats(mdxContent).links,
					images: calculateContentStats(mdxContent).images,
					codeBlocks: calculateContentStats(mdxContent).codeBlocks,
				},
			}));

			setLastCompileTime(new Date());
			onCompileSuccess?.(result);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "编译失败";
			
			setState(prev => ({
				...prev,
				isLoading: false,
				error: errorMessage,
				mdxSource: null,
				stats: calculateContentStats(mdxContent),
			}));

			onError?.(error instanceof Error ? error : new Error(errorMessage));
		}
	}, [calculateContentStats, onError, onCompileSuccess]);

	// 防抖编译
	const debouncedCompile = useMemo(() => {
		let timeoutId: NodeJS.Timeout;
		return (content: string) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => compileMDX(content), 500);
		};
	}, [compileMDX]);

	// 监听内容变化
	useEffect(() => {
		debouncedCompile(content);
	}, [content, debouncedCompile]);

	// 处理滚动事件
	const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		const scrollTop = event.currentTarget.scrollTop;
		onScroll?.(scrollTop);
	}, [onScroll]);

	// 手动刷新预览
	const refreshPreview = useCallback(() => {
		compileMDX(content);
	}, [content, compileMDX]);

	return (
		<div className={`mdx-live-preview ${className}`}>
			{/* 预览头部 */}
			<div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
				<div className="flex items-center space-x-2">
					<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
						实时预览
					</h3>
					{state.isLoading && (
						<Loader2 size={14} className="animate-spin text-blue-500" />
					)}
					{state.error && (
						<Badge variant="destructive" className="text-xs">
							<AlertCircle size={10} className="mr-1" />
							错误
						</Badge>
					)}
					{!state.error && !state.isLoading && state.mdxSource && (
						<Badge variant="default" className="text-xs bg-green-600">
							<CheckCircle size={10} className="mr-1" />
							就绪
						</Badge>
					)}
					{state.warnings.length > 0 && (
						<Badge variant="secondary" className="text-xs">
							<Info size={10} className="mr-1" />
							{state.warnings.length} 警告
						</Badge>
					)}
				</div>

				<div className="flex items-center space-x-2">
					{lastCompileTime && (
						<span className="text-xs text-gray-500">
							<Clock size={10} className="inline mr-1" />
							{lastCompileTime.toLocaleTimeString()}
						</span>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={refreshPreview}
						disabled={state.isLoading}
						className="h-6 px-2"
					>
						<RefreshCw size={12} />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowPreview(!showPreview)}
						className="h-6 px-2"
					>
						{showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
					</Button>
				</div>
			</div>

			{showPreview && (
				<div className="flex flex-col h-full">
					{/* 统计信息和元数据 */}
					{(showStats || showMetadata) && (
						<div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
							{showStats && (
								<div className="mb-3">
									<div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
										<div className="flex items-center space-x-1">
											<FileText size={10} />
											<span>{state.stats.wordCount} 词</span>
										</div>
										<div className="flex items-center space-x-1">
											<Clock size={10} />
											<span>{state.stats.readingTime} 分钟</span>
										</div>
										<div className="flex items-center space-x-1">
											<Hash size={10} />
											<span>{state.stats.headings} 标题</span>
										</div>
										<div className="flex items-center space-x-1">
											<Link size={10} />
											<span>{state.stats.links} 链接</span>
										</div>
										<div className="flex items-center space-x-1">
											<ImageIcon size={10} />
											<span>{state.stats.images} 图片</span>
										</div>
										<div className="flex items-center space-x-1">
											<Code size={10} />
											<span>{state.stats.codeBlocks} 代码块</span>
										</div>
									</div>
								</div>
							)}

							{showMetadata && Object.keys(state.metadata).length > 0 && (
								<div>
									<Separator className="mb-2" />
									<div className="text-xs">
										<span className="font-medium text-gray-700 dark:text-gray-300">元数据:</span>
										<div className="mt-1 flex flex-wrap gap-1">
											{state.metadata.title && (
												<Badge variant="outline" className="text-xs">
													标题: {state.metadata.title}
												</Badge>
											)}
											{state.metadata.tags && Array.isArray(state.metadata.tags) && (
												<Badge variant="outline" className="text-xs">
													标签: {state.metadata.tags.join(", ")}
												</Badge>
											)}
											{state.metadata.publishedAt && (
												<Badge variant="outline" className="text-xs">
													发布: {new Date(state.metadata.publishedAt).toLocaleDateString()}
												</Badge>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{/* 错误和警告 */}
					{(state.error || state.warnings.length > 0) && (
						<div className="p-3 space-y-2">
							{state.error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>
										<div className="font-medium">编译错误</div>
										{showErrorDetails && (
											<div className="mt-1 text-sm font-mono">
												{state.error}
											</div>
										)}
									</AlertDescription>
								</Alert>
							)}

							{state.warnings.map((warning, index) => (
								<Alert key={index}>
									<Info className="h-4 w-4" />
									<AlertDescription className="text-sm">
										{warning}
									</AlertDescription>
								</Alert>
							))}
						</div>
					)}

					{/* 预览内容 */}
					<ScrollArea 
						className="flex-1 p-4" 
						onScrollCapture={handleScroll}
					>
						{state.isLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 size={24} className="animate-spin text-blue-500" />
								<span className="ml-2 text-gray-500">编译中...</span>
							</div>
						) : state.error ? (
							<div className="flex items-center justify-center py-8 text-gray-500">
								<AlertCircle size={24} className="mr-2" />
								<span>预览不可用</span>
							</div>
						) : state.mdxSource ? (
							<div className={`prose dark:prose-invert max-w-none ${theme === 'dark' ? 'prose-dark' : ''}`}>
								<MDXRemote 
									{...state.mdxSource} 
									components={MDXComponents}
								/>
							</div>
						) : (
							<div className="flex items-center justify-center py-8 text-gray-500">
								<FileText size={24} className="mr-2" />
								<span>开始输入内容以查看预览</span>
							</div>
						)}
					</ScrollArea>
				</div>
			)}
		</div>
	);
}