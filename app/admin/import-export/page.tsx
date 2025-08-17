"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ContentImportExport } from "@/components/admin/ContentImportExport";

export default function ImportExportPage() {
	const [refreshKey, setRefreshKey] = useState(0);

	const handleImportComplete = (result: any) => {
		console.log("Import completed:", result);
		// 可以在这里添加成功提示或刷新其他组件
		setRefreshKey((prev) => prev + 1);
	};

	const handleExportComplete = () => {
		console.log("Export completed");
		// 可以在这里添加成功提示
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">内容导入导出</h1>
					<p className="mt-2 text-gray-600">
						批量导入MDX文件或导出现有内容为MDX格式
					</p>
				</div>

				<div className="bg-white shadow rounded-lg">
					<div className="p-6">
						<ContentImportExport
							onImportComplete={handleImportComplete}
							onExportComplete={handleExportComplete}
						/>
					</div>
				</div>

				{/* 使用说明 */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h3>

					<div className="space-y-4 text-sm text-blue-800">
						<div>
							<h4 className="font-medium mb-2">导入功能</h4>
							<ul className="list-disc list-inside space-y-1">
								<li>支持 .md 和 .mdx 文件格式</li>
								<li>可以批量选择多个文件进行导入</li>
								<li>支持frontmatter元数据解析（标题、标签、分类等）</li>
								<li>提供冲突处理选项：跳过、覆盖或重命名</li>
								<li>可以自动创建缺失的分类和标签</li>
								<li>内置MDX格式验证，确保内容有效性</li>
							</ul>
						</div>

						<div>
							<h4 className="font-medium mb-2">导出功能</h4>
							<ul className="list-disc list-inside space-y-1">
								<li>支持导出文章和项目内容</li>
								<li>可以按状态筛选导出内容（草稿、已发布、已归档）</li>
								<li>导出为标准MDX格式，包含完整的frontmatter</li>
								<li>生成ZIP压缩包，便于下载和备份</li>
								<li>可选择是否包含创建和修改时间等元数据</li>
							</ul>
						</div>

						<div>
							<h4 className="font-medium mb-2">Frontmatter格式示例</h4>
							<pre className="bg-white border rounded p-3 text-xs overflow-x-auto">
								{`---
title: "文章标题"
slug: "article-slug"
status: "published"
publishedAt: "2024-01-01T00:00:00.000Z"
category: "技术"
tags: ["React", "Next.js"]
# 项目特有字段
githubUrl: "https://github.com/user/repo"
liveUrl: "https://example.com"
technologies: ["React", "TypeScript"]
featured: true
---

# 文章内容

这里是MDX内容...`}
							</pre>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
