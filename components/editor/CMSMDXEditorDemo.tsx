"use client";

import { useState } from "react";
import { CMSMDXEditor } from "./CMSMDXEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const sampleContent = `---
title: "示例博客文章"
description: "这是一个展示 MDX 编辑器功能的示例文章"
publishedAt: "2024-01-01"
tags: ["MDX", "编辑器", "示例"]
featured: false
---

# 欢迎使用 MDX 编辑器

这是一个功能强大的 MDX 编辑器，专为 CMS 系统设计。

## 功能特性

### 基础 Markdown 支持

- **粗体文本** 和 *斜体文本*
- \`行内代码\` 和代码块
- [链接](https://example.com) 和图片
- 列表和引用

### MDX 组件支持

<Callout type="info">
这是一个信息提示框组件，展示了 MDX 的强大功能。
</Callout>

### 代码高亮

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

### 图片组件

<Image 
  id="sample-image" 
  alt="示例图片" 
  width={600} 
  height={400} 
/>

## 编辑器功能

1. **语法高亮** - 支持 MDX 语法高亮
2. **自动补全** - 智能代码补全
3. **实时验证** - 语法错误检查
4. **快捷键** - 丰富的键盘快捷键
5. **统计信息** - 实时文档统计
6. **预览模式** - 即将推出

### 快捷键列表

| 快捷键 | 功能 |
|--------|------|
| Ctrl+S | 保存文档 |
| Ctrl+B | 粗体 |
| Ctrl+I | 斜体 |
| Ctrl+K | 插入链接 |
| Ctrl+Shift+C | 代码块 |
| Ctrl+F | 查找替换 |

> 这是一个引用块，用于突出显示重要信息。

---

感谢使用我们的 MDX 编辑器！
`;

export function CMSMDXEditorDemo() {
	const [content, setContent] = useState(sampleContent);
	const [isSaving, setIsSaving] = useState(false);
	const [saveCount, setSaveCount] = useState(0);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			// 模拟保存操作
			await new Promise(resolve => setTimeout(resolve, 1000));
			setSaveCount(prev => prev + 1);
			toast.success("内容已保存");
		} catch (error) {
			toast.error("保存失败");
		} finally {
			setIsSaving(false);
		}
	};

	const handleError = (error: Error) => {
		console.error("编辑器错误:", error);
		toast.error(`编辑器错误: ${error.message}`);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>CMS MDX 编辑器演示</CardTitle>
						<div className="flex items-center space-x-2">
							<Badge variant="secondary">
								保存次数: {saveCount}
							</Badge>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setContent(sampleContent)}
							>
								重置内容
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<CMSMDXEditor
						initialContent={content}
						onChange={setContent}
						onSave={handleSave}
						isLoading={isSaving}
						autoSaveDelay={3000}
						height="500px"
						theme="dark"
						onError={handleError}
						showHelp={true}
						showStats={true}
						className="border rounded-lg"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>编辑器特性</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div className="space-y-2">
							<h4 className="font-medium">语法支持</h4>
							<ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
								<li>✅ Markdown 语法</li>
								<li>✅ JSX 组件</li>
								<li>✅ Frontmatter</li>
								<li>✅ 代码高亮</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium">编辑功能</h4>
							<ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
								<li>✅ 自动补全</li>
								<li>✅ 语法验证</li>
								<li>✅ 快捷键</li>
								<li>✅ 自动保存</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium">界面功能</h4>
							<ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
								<li>✅ 统计信息</li>
								<li>✅ 错误提示</li>
								<li>✅ 设置面板</li>
								<li>🔄 实时预览 (下个任务)</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}