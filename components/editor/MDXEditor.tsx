"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { MDXEditorToolbar } from "./MDXEditorToolbar";
import { useMDXEditorShortcuts } from "./hooks/useMDXEditorShortcuts";
import { useAutoSave } from "./hooks/useAutoSave";
import { configureMDXLanguage } from "./monaco-mdx-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
	Settings, 
	Maximize2, 
	Minimize2, 
	Eye, 
	EyeOff, 
	RotateCcw,
	Search,
	Replace,
	Palette
} from "lucide-react";
import { MDXLivePreview } from "./MDXLivePreview";

interface MDXEditorProps {
	initialContent?: string;
	onChange: (content: string) => void;
	onSave: () => void;
	isLoading?: boolean;
	autoSaveDelay?: number; // 自动保存延迟（毫秒）
	className?: string;
	height?: string;
	theme?: "light" | "dark";
	/** 同步滚动回调 - 当编辑器滚动时调用 */
	onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
	/** 预览模式切换回调 */
	onPreviewToggle?: (showPreview: boolean) => void;
	/** 全屏模式切换回调 */
	onFullscreenToggle?: (isFullscreen: boolean) => void;
	/** 错误处理回调 */
	onError?: (error: Error) => void;
	/** 是否显示预览面板 */
	showPreview?: boolean;
	/** 是否全屏模式 */
	isFullscreen?: boolean;
	/** 自定义工具栏操作 */
	customActions?: Record<string, () => void>;
}

export function MDXEditor({
	initialContent = "",
	onChange,
	onSave,
	isLoading = false,
	autoSaveDelay = 2000,
	className = "",
	height = "600px",
	theme = "dark",
	onEditorMount,
	onPreviewToggle,
	onFullscreenToggle,
	onError,
	showPreview = false,
	isFullscreen = false,
	customActions = {},
}: MDXEditorProps) {
	const [content, setContent] = useState(initialContent);
	const [isEditorReady, setIsEditorReady] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showFindReplace, setShowFindReplace] = useState(false);
	const [editorSettings, setEditorSettings] = useState({
		fontSize: 14,
		lineHeight: 1.6,
		wordWrap: true,
		minimap: false,
		lineNumbers: true,
		folding: true,
		renderWhitespace: false,
		bracketPairColorization: true,
	});
	const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
	const [selectionInfo, setSelectionInfo] = useState({ selected: 0, total: 0 });
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

	// 自动保存钩子
	const { isSaving, lastSaved } = useAutoSave(content, onSave, autoSaveDelay);

	// 更新编辑器选项
	const updateEditorOptions = useCallback((editor: editor.IStandaloneCodeEditor) => {
		editor.updateOptions({
			fontSize: editorSettings.fontSize,
			lineHeight: editorSettings.lineHeight,
			wordWrap: editorSettings.wordWrap ? "on" : "off",
			minimap: { enabled: editorSettings.minimap },
			scrollBeyondLastLine: false,
			automaticLayout: true,
			tabSize: 2,
			insertSpaces: true,
			folding: editorSettings.folding,
			lineNumbers: editorSettings.lineNumbers ? "on" : "off",
			renderWhitespace: editorSettings.renderWhitespace ? "all" : "none",
			bracketPairColorization: { enabled: editorSettings.bracketPairColorization },
			// 增强的编辑器功能
			suggest: {
				showKeywords: true,
				showSnippets: true,
				showFunctions: true,
				showConstructors: true,
				showFields: true,
				showVariables: true,
				showClasses: true,
				showStructs: true,
				showInterfaces: true,
				showModules: true,
				showProperties: true,
				showEvents: true,
				showOperators: true,
				showUnits: true,
				showValues: true,
				showConstants: true,
				showEnums: true,
				showEnumMembers: true,
				showColors: true,
				showFiles: true,
				showReferences: true,
				showFolders: true,
				showTypeParameters: true,
			},
			quickSuggestions: {
				other: true,
				comments: true,
				strings: true,
			},
			parameterHints: {
				enabled: true,
			},
			hover: {
				enabled: true,
			},
			contextmenu: true,
			selectOnLineNumbers: true,
			roundedSelection: false,
			readOnly: isLoading,
			cursorStyle: "line",
			cursorBlinking: "blink",
			renderLineHighlight: "line",
			smoothScrolling: true,
			mouseWheelZoom: true,
		});
	}, [editorSettings, isLoading]);

	// MDX 内容验证
	const validateMDXContent = useCallback((content: string) => {
		try {
			// 基本的 MDX 语法检查
			const lines = content.split('\n');
			const errors: string[] = [];

			lines.forEach((line, index) => {
				// 检查未闭合的 JSX 标签
				const openTags = line.match(/<[A-Z][a-zA-Z0-9]*[^/>]*>/g) || [];
				const closeTags = line.match(/<\/[A-Z][a-zA-Z0-9]*>/g) || [];
				const selfClosingTags = line.match(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g) || [];
				
				if (openTags.length !== closeTags.length + selfClosingTags.length) {
					errors.push(`Line ${index + 1}: Possible unclosed JSX tag`);
				}

				// 检查未闭合的代码块
				if (line.trim().startsWith('```') && !line.trim().endsWith('```')) {
					const nextCodeBlock = lines.slice(index + 1).findIndex(l => l.trim().startsWith('```'));
					if (nextCodeBlock === -1) {
						errors.push(`Line ${index + 1}: Unclosed code block`);
					}
				}
			});

			// 如果有错误，可以在这里处理
			if (errors.length > 0) {
				console.warn('MDX validation warnings:', errors);
			}
		} catch (error) {
			console.error('MDX validation error:', error);
		}
	}, []);

	// 注册自定义命令
	const registerCustomCommands = useCallback((
		editor: editor.IStandaloneCodeEditor,
		monaco: typeof import("monaco-editor")
	) => {
		// 查找和替换命令
		editor.addCommand(
			monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
			() => setShowFindReplace(true)
		);

		// 设置面板命令
		editor.addCommand(
			monaco.KeyMod.CtrlCmd | monaco.KeyCode.Comma,
			() => setShowSettings(true)
		);

		// 预览切换命令
		editor.addCommand(
			monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
			() => onPreviewToggle?.(!showPreview)
		);

		// 全屏切换命令
		editor.addCommand(
			monaco.KeyCode.F11,
			() => onFullscreenToggle?.(!isFullscreen)
		);

		// 插入当前日期
		editor.addCommand(
			monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD,
			() => {
				const position = editor.getPosition();
				if (position) {
					const currentDate = new Date().toISOString().split('T')[0];
					editor.executeEdits('insert-date', [{
						range: {
							startLineNumber: position.lineNumber,
							startColumn: position.column,
							endLineNumber: position.lineNumber,
							endColumn: position.column,
						},
						text: currentDate,
					}]);
				}
			}
		);

		// 插入时间戳
		editor.addCommand(
			monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT,
			() => {
				const position = editor.getPosition();
				if (position) {
					const timestamp = new Date().toISOString();
					editor.executeEdits('insert-timestamp', [{
						range: {
							startLineNumber: position.lineNumber,
							startColumn: position.column,
							endLineNumber: position.lineNumber,
							endColumn: position.column,
						},
						text: timestamp,
					}]);
				}
			}
		);

		// 执行自定义操作
		Object.entries(customActions).forEach(([key, action]) => {
			// 为自定义操作注册命令（这里可以根据需要分配快捷键）
			editor.addAction({
				id: `custom-action-${key}`,
				label: `Custom Action: ${key}`,
				run: action,
			});
		});
	}, [customActions, onPreviewToggle, onFullscreenToggle, showPreview, isFullscreen]);

	// 快捷键钩子
	useMDXEditorShortcuts(editorRef.current, {
		onSave,
		onFormat: () => formatDocument(),
		onInsertLink: () => insertMarkdown("[链接文本](https://example.com)"),
		onInsertImage: () => insertMarkdown("![图片描述](image-url)"),
		onInsertCodeBlock: () => insertMarkdown("\n```javascript\n// 代码\n```\n"),
		onToggleBold: () => toggleMarkdown("**", "**"),
		onToggleItalic: () => toggleMarkdown("*", "*"),
	});

	// 编辑器挂载时的配置
	const handleEditorDidMount = useCallback(
		(
			editor: editor.IStandaloneCodeEditor,
			monaco: typeof import("monaco-editor"),
		) => {
			editorRef.current = editor;
			monacoRef.current = monaco;

			// 配置 MDX 语言支持
			configureMDXLanguage(monaco);

			// 设置编辑器选项
			updateEditorOptions(editor);

			// 监听光标位置变化
			editor.onDidChangeCursorPosition((e) => {
				setCursorPosition({
					line: e.position.lineNumber,
					column: e.position.column,
				});
			});

			// 监听选择变化
			editor.onDidChangeCursorSelection((e) => {
				const model = editor.getModel();
				if (model) {
					const selectedText = model.getValueInRange(e.selection);
					setSelectionInfo({
						selected: selectedText.length,
						total: model.getValueLength(),
					});
				}
			});

			// 监听内容变化以进行错误检查
			editor.onDidChangeModelContent(() => {
				try {
					const currentContent = editor.getValue();
					// 这里可以添加 MDX 语法验证
					validateMDXContent(currentContent);
				} catch (error) {
					onError?.(error as Error);
				}
			});

			// 添加自定义命令
			registerCustomCommands(editor, monaco);

			// 通知父组件编辑器已挂载
			onEditorMount?.(editor);

			setIsEditorReady(true);
		},
		[onEditorMount, onError],
	);

	// 内容变化处理
	const handleContentChange = useCallback(
		(value: string | undefined) => {
			const newContent = value || "";
			setContent(newContent);
			onChange(newContent);
		},
		[onChange],
	);

	// 格式化文档
	const formatDocument = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.getAction("editor.action.formatDocument")?.run();
		}
	}, []);

	// 插入 Markdown 语法
	const insertMarkdown = useCallback((markdown: string) => {
		if (!editorRef.current) return;

		const selection = editorRef.current.getSelection();
		if (selection) {
			editorRef.current.executeEdits("insert-markdown", [
				{
					range: selection,
					text: markdown,
				},
			]);

			// 设置光标位置
			const newPosition = {
				lineNumber: selection.startLineNumber,
				column: selection.startColumn + markdown.length,
			};
			editorRef.current.setPosition(newPosition);
			editorRef.current.focus();
		}
	}, []);

	// 切换 Markdown 格式（如粗体、斜体）
	const toggleMarkdown = useCallback((prefix: string, suffix: string) => {
		if (!editorRef.current) return;

		const selection = editorRef.current.getSelection();
		if (!selection) return;

		const selectedText =
			editorRef.current.getModel()?.getValueInRange(selection) || "";

		// 检查是否已经有格式
		const hasFormat =
			selectedText.startsWith(prefix) && selectedText.endsWith(suffix);

		let newText: string;
		if (hasFormat) {
			// 移除格式
			newText = selectedText.slice(prefix.length, -suffix.length);
		} else {
			// 添加格式
			newText = `${prefix}${selectedText}${suffix}`;
		}

		editorRef.current.executeEdits("toggle-markdown", [
			{
				range: selection,
				text: newText,
			},
		]);

		editorRef.current.focus();
	}, []);

	// 插入表格
	const insertTable = useCallback(
		(rows: number = 3, cols: number = 3) => {
			const header = "| " + Array(cols).fill("标题").join(" | ") + " |";
			const separator = "| " + Array(cols).fill("---").join(" | ") + " |";
			const bodyRows = Array(rows - 1).fill(
				"| " + Array(cols).fill("内容").join(" | ") + " |",
			);

			const table = [header, separator, ...bodyRows].join("\n") + "\n";
			insertMarkdown(table);
		},
		[insertMarkdown],
	);

	// 工具栏操作
	const toolbarActions = {
		onBold: () => toggleMarkdown("**", "**"),
		onItalic: () => toggleMarkdown("*", "*"),
		onStrikethrough: () => toggleMarkdown("~~", "~~"),
		onCode: () => toggleMarkdown("`", "`"),
		onLink: () => insertMarkdown("[链接文本](https://example.com)"),
		onImage: () => insertMarkdown("![图片描述](image-url)"),
		onCodeBlock: () => insertMarkdown("\n```javascript\n// 代码\n```\n"),
		onTable: () => insertTable(),
		onHeading: (level: number) => {
			const heading = "#".repeat(level) + " 标题";
			insertMarkdown(heading);
		},
		onList: () => insertMarkdown("\n- 列表项\n- 列表项\n"),
		onOrderedList: () => insertMarkdown("\n1. 列表项\n2. 列表项\n"),
		onQuote: () => insertMarkdown("\n> 引用内容\n"),
		onHorizontalRule: () => insertMarkdown("\n---\n"),
		onFormat: formatDocument,
		// 新增的工具栏操作
		onSettings: () => setShowSettings(true),
		onFindReplace: () => setShowFindReplace(true),
		onPreviewToggle: () => onPreviewToggle?.(!showPreview),
		onFullscreen: () => onFullscreenToggle?.(!isFullscreen),
		onUndo: () => editorRef.current?.trigger('keyboard', 'undo', null),
		onRedo: () => editorRef.current?.trigger('keyboard', 'redo', null),
		onSelectAll: () => editorRef.current?.trigger('keyboard', 'editor.action.selectAll', null),
		onInsertDate: () => {
			const currentDate = new Date().toISOString().split('T')[0];
			insertMarkdown(currentDate);
		},
		onInsertTimestamp: () => {
			const timestamp = new Date().toISOString();
			insertMarkdown(timestamp);
		},
	};

	// 同步初始内容
	useEffect(() => {
		if (initialContent !== content) {
			setContent(initialContent);
		}
	}, [initialContent]);

	return (
		<div className={`mdx-editor ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
			{/* 工具栏 */}
			<MDXEditorToolbar
				actions={toolbarActions}
				isSaving={isSaving}
				lastSaved={lastSaved}
				onSave={onSave}
				disabled={isLoading || !isEditorReady}
				showPreview={showPreview}
				isFullscreen={isFullscreen}
			/>

			{/* 主编辑区域 */}
			<div className="flex flex-1 relative">
				{/* 编辑器 */}
				<div className={`${showPreview ? 'w-1/2' : 'w-full'} border border-gray-200 dark:border-gray-700 ${showPreview ? 'border-r-0' : 'rounded-b-lg'} overflow-hidden`}>
					<Editor
						height={height}
						language="mdx"
						theme={theme === "dark" ? "vs-dark" : "vs-light"}
						value={content}
						onChange={handleContentChange}
						onMount={handleEditorDidMount}
						loading={
							<div className="flex items-center justify-center h-full">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							</div>
						}
						options={{
							readOnly: isLoading,
						}}
					/>
				</div>

				{/* 预览面板 */}
				{showPreview && (
					<div className="w-1/2 border border-gray-200 dark:border-gray-700 rounded-br-lg overflow-hidden">
						<MDXLivePreview
							content={content}
							theme={theme}
							showErrorDetails={true}
							showStats={false}
							showMetadata={true}
							onError={onError}
							onScroll={(scrollTop) => {
								// 这里可以实现滚动同步
								console.log('Preview scrolled to:', scrollTop);
							}}
						/>
					</div>
				)}
			</div>

			{/* 增强的状态栏 */}
			<div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
				<div className="flex items-center space-x-4">
					<span>行: {cursorPosition.line}</span>
					<span>列: {cursorPosition.column}</span>
					<span>字符: {content.length}</span>
					{selectionInfo.selected > 0 && (
						<Badge variant="secondary" className="text-xs">
							已选择: {selectionInfo.selected}
						</Badge>
					)}
					<Separator orientation="vertical" className="h-4" />
					<span>MDX</span>
					<span className={`w-2 h-2 rounded-full ${isEditorReady ? 'bg-green-500' : 'bg-red-500'}`} />
				</div>

				<div className="flex items-center space-x-4">
					{isSaving && (
						<div className="flex items-center text-blue-600 dark:text-blue-400">
							<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
							保存中...
						</div>
					)}
					{lastSaved && !isSaving && (
						<span>最后保存: {lastSaved.toLocaleTimeString()}</span>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowSettings(true)}
						className="h-6 px-2"
					>
						<Settings size={12} />
					</Button>
				</div>
			</div>

			{/* 设置面板 */}
			{showSettings && (
				<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<Card className="w-96 max-h-[80vh] overflow-y-auto">
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								编辑器设置
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowSettings(false)}
								>
									×
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">字体大小</label>
								<input
									type="range"
									min="10"
									max="24"
									value={editorSettings.fontSize}
									onChange={(e) => {
										const newSettings = { ...editorSettings, fontSize: parseInt(e.target.value) };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
									className="w-full"
								/>
								<span className="text-xs text-gray-500">{editorSettings.fontSize}px</span>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">行高</label>
								<input
									type="range"
									min="1.2"
									max="2.0"
									step="0.1"
									value={editorSettings.lineHeight}
									onChange={(e) => {
										const newSettings = { ...editorSettings, lineHeight: parseFloat(e.target.value) };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
									className="w-full"
								/>
								<span className="text-xs text-gray-500">{editorSettings.lineHeight}</span>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">自动换行</label>
								<input
									type="checkbox"
									checked={editorSettings.wordWrap}
									onChange={(e) => {
										const newSettings = { ...editorSettings, wordWrap: e.target.checked };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">显示小地图</label>
								<input
									type="checkbox"
									checked={editorSettings.minimap}
									onChange={(e) => {
										const newSettings = { ...editorSettings, minimap: e.target.checked };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">显示行号</label>
								<input
									type="checkbox"
									checked={editorSettings.lineNumbers}
									onChange={(e) => {
										const newSettings = { ...editorSettings, lineNumbers: e.target.checked };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">代码折叠</label>
								<input
									type="checkbox"
									checked={editorSettings.folding}
									onChange={(e) => {
										const newSettings = { ...editorSettings, folding: e.target.checked };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">显示空白字符</label>
								<input
									type="checkbox"
									checked={editorSettings.renderWhitespace}
									onChange={(e) => {
										const newSettings = { ...editorSettings, renderWhitespace: e.target.checked };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
								/>
							</div>

							<div className="flex items-center justify-between">
								<label className="text-sm font-medium">括号配对着色</label>
								<input
									type="checkbox"
									checked={editorSettings.bracketPairColorization}
									onChange={(e) => {
										const newSettings = { ...editorSettings, bracketPairColorization: e.target.checked };
										setEditorSettings(newSettings);
										if (editorRef.current) {
											updateEditorOptions(editorRef.current);
										}
									}}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* 查找替换面板 */}
			{showFindReplace && (
				<div className="absolute top-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-40 w-80">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-medium">查找和替换</h3>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowFindReplace(false)}
						>
							×
						</Button>
					</div>
					<div className="space-y-2">
						<input
							type="text"
							placeholder="查找..."
							className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm"
							onKeyDown={(e) => {
								if (e.key === 'Enter' && editorRef.current) {
									editorRef.current.getAction('actions.find')?.run();
								}
							}}
						/>
						<input
							type="text"
							placeholder="替换为..."
							className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm"
						/>
						<div className="flex space-x-2">
							<Button size="sm" variant="outline" className="flex-1">
								查找下一个
							</Button>
							<Button size="sm" variant="outline" className="flex-1">
								替换
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
