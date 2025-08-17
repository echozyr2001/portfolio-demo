"use client";

import { useState } from "react";
import { MDXEditorWithPreview } from "./MDXEditorWithPreview";
import { MDXPreviewPanel } from "./MDXPreviewPanel";

const DEMO_CONTENT = `# MDX 实时预览演示

欢迎使用 **MDX 编辑器**的实时预览功能！

## 基础 Markdown 语法

### 文本格式化
- **粗体文本**
- *斜体文本*
- ~~删除线~~
- \`行内代码\`

### 列表演示
1. 第一项
2. 第二项
   - 嵌套项目 A
   - 嵌套项目 B
3. 第三项

### 引用块
> 这是一个引用块的示例
> 可以包含多行内容

---

## 代码高亮演示

\`\`\`javascript
function greetUser(name) {
  console.log('Hello, ' + name + '!');
  return 'Welcome ' + name;
}

greetUser('Developer');
\`\`\`

## 表格演示

| 功能 | 状态 | 描述 |
|------|------|------|
| 实时预览 | ✅ | 编辑时立即显示效果 |
| 语法高亮 | ✅ | 支持多种编程语言 |
| 错误处理 | ✅ | 友好的错误提示 |

## 图片演示

![示例图片](https://picsum.photos/600/300?random=1)

## 预览模式

使用顶部的按钮切换不同的预览模式：
- **编辑模式** - 只显示编辑器
- **预览模式** - 只显示预览
- **并排模式** - 同时显示编辑器和预览

**提示**：尝试修改内容，观察预览的实时变化！`;

export function MDXEditorPreviewDemo() {
	const [content, setContent] = useState(DEMO_CONTENT);
	const [isSaving, setIsSaving] = useState(false);
	const [demoMode, setDemoMode] = useState<"integrated" | "separate">(
		"integrated",
	);

	const handleSave = async () => {
		setIsSaving(true);

		// 模拟保存操作
		await new Promise((resolve) => setTimeout(resolve, 1000));

		console.log("保存内容:", content);
		alert("内容已保存！（这只是一个演示）");

		setIsSaving(false);
	};

	const handleChange = (newContent: string) => {
		setContent(newContent);
	};

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* 标题和说明 */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					MDX 实时预览演示
				</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
					体验强大的MDX编辑器实时预览功能，支持多种预览模式和丰富的MDX特性。
				</p>

				{/* 演示模式切换 */}
				<div className="flex items-center space-x-4 mb-4">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
						演示模式：
					</span>
					<div className="flex space-x-2">
						<button
							onClick={() => setDemoMode("integrated")}
							className={`px-3 py-1 text-sm rounded-md transition-colors ${
								demoMode === "integrated"
									? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
									: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
							}`}
						>
							集成模式
						</button>
						<button
							onClick={() => setDemoMode("separate")}
							className={`px-3 py-1 text-sm rounded-md transition-colors ${
								demoMode === "separate"
									? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
									: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
							}`}
						>
							分离模式
						</button>
					</div>
				</div>
			</div>

			{/* 集成模式 - 使用 MDXEditorWithPreview */}
			{demoMode === "integrated" && (
				<div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
					<MDXEditorWithPreview
						initialContent={content}
						onChange={handleChange}
						onSave={handleSave}
						isLoading={isSaving}
						height="70vh"
						autoSaveDelay={3000}
						initialPreviewMode="split"
						className="w-full"
					/>
				</div>
			)}

			{/* 分离模式 - 独立的编辑器和预览面板 */}
			{demoMode === "separate" && (
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					{/* 编辑器区域 */}
					<div className="xl:col-span-2">
						<div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
							<div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-medium text-gray-900 dark:text-white">
									MDX 编辑器
								</h3>
							</div>
							<div className="p-4">
								{/* 这里可以放置独立的 MDXEditor */}
								<textarea
									value={content}
									onChange={(e) => handleChange(e.target.value)}
									className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="在此输入MDX内容..."
								/>
							</div>
						</div>
					</div>

					{/* 预览面板区域 */}
					<div className="xl:col-span-1">
						<MDXPreviewPanel
							mdxContent={content}
							title="实时预览"
							height="500px"
							showToolbar={true}
							collapsible={true}
							className="sticky top-6"
						/>
					</div>
				</div>
			)}

			{/* 功能说明 */}
			<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
					<h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
						🔄 实时预览
					</h3>
					<p className="text-blue-700 dark:text-blue-300 text-sm">
						编辑内容时立即看到渲染效果，无需手动刷新或等待。
					</p>
				</div>

				<div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
					<h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
						🎨 多种模式
					</h3>
					<p className="text-green-700 dark:text-green-300 text-sm">
						支持编辑、预览、并排三种模式，适应不同的工作流程。
					</p>
				</div>

				<div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
					<h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
						🛡️ 错误处理
					</h3>
					<p className="text-purple-700 dark:text-purple-300 text-sm">
						智能错误检测和友好的错误提示，帮助快速定位问题。
					</p>
				</div>
			</div>

			{/* 使用提示 */}
			<div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
				<h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
					💡 使用提示
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
					<div>
						<h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
							编辑技巧：
						</h4>
						<ul className="space-y-1 list-disc list-inside">
							<li>使用快捷键提高编辑效率</li>
							<li>利用工具栏快速插入格式</li>
							<li>支持拖拽调整面板大小</li>
							<li>自动保存防止数据丢失</li>
						</ul>
					</div>
					<div>
						<h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
							预览特性：
						</h4>
						<ul className="space-y-1 list-disc list-inside">
							<li>实时渲染MDX内容</li>
							<li>支持自定义React组件</li>
							<li>代码语法高亮</li>
							<li>响应式设计适配</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
