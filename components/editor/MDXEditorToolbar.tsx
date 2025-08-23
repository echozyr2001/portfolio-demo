"use client";

import {
	Bold,
	Italic,
	Strikethrough,
	Code,
	Link,
	Image,
	Table,
	List,
	ListOrdered,
	Quote,
	Minus,
	Save,
	Type,
	AlignJustify,
	ChevronDown,
	Settings,
	Search,
	Eye,
	EyeOff,
	Maximize2,
	Minimize2,
	Undo2,
	Redo2,
	MousePointer,
	Calendar,
	Clock,
} from "lucide-react";
import { useState } from "react";

interface MDXEditorToolbarProps {
	actions: {
		onBold: () => void;
		onItalic: () => void;
		onStrikethrough: () => void;
		onCode: () => void;
		onLink: () => void;
		onImage: () => void;
		onCodeBlock: () => void;
		onTable: () => void;
		onHeading: (level: number) => void;
		onList: () => void;
		onOrderedList: () => void;
		onQuote: () => void;
		onHorizontalRule: () => void;
		onFormat: () => void;
		// 新增的操作
		onSettings?: () => void;
		onFindReplace?: () => void;
		onPreviewToggle?: () => void;
		onFullscreen?: () => void;
		onUndo?: () => void;
		onRedo?: () => void;
		onSelectAll?: () => void;
		onInsertDate?: () => void;
		onInsertTimestamp?: () => void;
	};
	isSaving: boolean;
	lastSaved: Date | null;
	onSave: () => void;
	disabled?: boolean;
	showPreview?: boolean;
	isFullscreen?: boolean;
}

export function MDXEditorToolbar({
	actions,
	isSaving,
	lastSaved,
	onSave,
	disabled = false,
	showPreview = false,
	isFullscreen = false,
}: MDXEditorToolbarProps) {
	const [showHeadingMenu, setShowHeadingMenu] = useState(false);

	const ToolbarButton = ({
		onClick,
		icon: Icon,
		title,
		disabled: buttonDisabled = false,
		className = "",
	}: {
		onClick: () => void;
		icon: React.ComponentType<{ size?: number }>;
		title: string;
		disabled?: boolean;
		className?: string;
	}) => (
		<button
			onClick={onClick}
			disabled={disabled || buttonDisabled}
			title={title}
			className={`
        p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
		>
			<Icon size={16} />
		</button>
	);

	const HeadingDropdown = () => (
		<div className="relative">
			<button
				onClick={() => setShowHeadingMenu(!showHeadingMenu)}
				disabled={disabled}
				title="标题"
				className="
          flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
			>
				<Type size={16} />
				<ChevronDown size={12} className="ml-1" />
			</button>

			{showHeadingMenu && (
				<div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
					{[1, 2, 3, 4, 5, 6].map((level) => (
						<button
							key={level}
							onClick={() => {
								actions.onHeading(level);
								setShowHeadingMenu(false);
							}}
							className="
                w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700
                first:rounded-t-lg last:rounded-b-lg
                transition-colors duration-200
              "
							style={{ fontSize: `${20 - level * 2}px` }}
						>
							H{level} 标题
						</button>
					))}
				</div>
			)}
		</div>
	);

	return (
		<div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-lg">
			<div className="flex items-center space-x-1">
				{/* 文本格式 */}
				<div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
					<ToolbarButton
						onClick={actions.onBold}
						icon={Bold}
						title="粗体 (Ctrl+B)"
					/>
					<ToolbarButton
						onClick={actions.onItalic}
						icon={Italic}
						title="斜体 (Ctrl+I)"
					/>
					<ToolbarButton
						onClick={actions.onStrikethrough}
						icon={Strikethrough}
						title="删除线"
					/>
					<ToolbarButton
						onClick={actions.onCode}
						icon={Code}
						title="行内代码 (Ctrl+`)"
					/>
				</div>

				{/* 标题 */}
				<div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
					<HeadingDropdown />
				</div>

				{/* 链接和媒体 */}
				<div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
					<ToolbarButton
						onClick={actions.onLink}
						icon={Link}
						title="链接 (Ctrl+K)"
					/>
					<ToolbarButton onClick={actions.onImage} icon={Image} title="图片" />
				</div>

				{/* 列表和引用 */}
				<div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
					<ToolbarButton
						onClick={actions.onList}
						icon={List}
						title="无序列表"
					/>
					<ToolbarButton
						onClick={actions.onOrderedList}
						icon={ListOrdered}
						title="有序列表"
					/>
					<ToolbarButton onClick={actions.onQuote} icon={Quote} title="引用" />
				</div>

				{/* 高级元素 */}
				<div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
					<ToolbarButton
						onClick={actions.onCodeBlock}
						icon={AlignJustify}
						title="代码块 (Ctrl+Shift+C)"
					/>
					<ToolbarButton onClick={actions.onTable} icon={Table} title="表格" />
					<ToolbarButton
						onClick={actions.onHorizontalRule}
						icon={Minus}
						title="分割线"
					/>
				</div>

				{/* 编辑操作 */}
				<div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
					{actions.onUndo && (
						<ToolbarButton
							onClick={actions.onUndo}
							icon={Undo2}
							title="撤销 (Ctrl+Z)"
						/>
					)}
					{actions.onRedo && (
						<ToolbarButton
							onClick={actions.onRedo}
							icon={Redo2}
							title="重做 (Ctrl+Y)"
						/>
					)}
					<ToolbarButton
						onClick={actions.onFormat}
						icon={AlignJustify}
						title="格式化文档 (Shift+Alt+F)"
					/>
				</div>

				{/* 工具操作 */}
				<div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
					{actions.onFindReplace && (
						<ToolbarButton
							onClick={actions.onFindReplace}
							icon={Search}
							title="查找替换 (Ctrl+F)"
						/>
					)}
					{actions.onInsertDate && (
						<ToolbarButton
							onClick={actions.onInsertDate}
							icon={Calendar}
							title="插入日期 (Ctrl+Shift+D)"
						/>
					)}
					{actions.onInsertTimestamp && (
						<ToolbarButton
							onClick={actions.onInsertTimestamp}
							icon={Clock}
							title="插入时间戳 (Ctrl+Shift+T)"
						/>
					)}
				</div>

				{/* 视图操作 */}
				<div className="flex items-center space-x-1">
					{actions.onPreviewToggle && (
						<ToolbarButton
							onClick={actions.onPreviewToggle}
							icon={showPreview ? EyeOff : Eye}
							title={showPreview ? "隐藏预览" : "显示预览 (Ctrl+Shift+P)"}
							className={showPreview ? "bg-blue-100 dark:bg-blue-900" : ""}
						/>
					)}
					{actions.onFullscreen && (
						<ToolbarButton
							onClick={actions.onFullscreen}
							icon={isFullscreen ? Minimize2 : Maximize2}
							title={isFullscreen ? "退出全屏" : "全屏模式 (F11)"}
							className={isFullscreen ? "bg-blue-100 dark:bg-blue-900" : ""}
						/>
					)}
					{actions.onSettings && (
						<ToolbarButton
							onClick={actions.onSettings}
							icon={Settings}
							title="编辑器设置 (Ctrl+,)"
						/>
					)}
				</div>
			</div>

			{/* 保存按钮和状态 */}
			<div className="flex items-center space-x-3">
				{isSaving && (
					<div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
						保存中...
					</div>
				)}

				{lastSaved && !isSaving && (
					<span className="text-sm text-gray-500 dark:text-gray-400">
						已保存 {lastSaved.toLocaleTimeString()}
					</span>
				)}

				<button
					onClick={onSave}
					disabled={disabled || isSaving}
					className="
            flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
            disabled:bg-gray-400 disabled:cursor-not-allowed
            text-white rounded text-sm font-medium
            transition-colors duration-200
          "
				>
					<Save size={14} className="mr-1" />
					保存
				</button>
			</div>
		</div>
	);
}
