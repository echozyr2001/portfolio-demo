"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "./LoadingSpinner";

interface ImportResult {
	success: boolean;
	imported: number;
	skipped: number;
	errors: Array<{ filename: string; error: string }>;
	warnings: string[];
}

interface ImportExportProps {
	onImportComplete?: (result: ImportResult) => void;
	onExportComplete?: () => void;
}

export function ContentImportExport({
	onImportComplete,
	onExportComplete,
}: ImportExportProps) {
	// Import state
	const [importLoading, setImportLoading] = useState(false);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);
	const [importConfig, setImportConfig] = useState({
		contentType: "posts" as "posts" | "projects",
		conflictResolution: "skip" as "skip" | "overwrite" | "rename",
		validateContent: true,
		createMissingCategories: true,
		createMissingTags: true,
	});

	// Export state
	const [exportLoading, setExportLoading] = useState(false);
	const [exportConfig, setExportConfig] = useState({
		includeMetadata: true,
		format: "zip" as "zip",
		contentTypes: ["posts"] as ("posts" | "projects")[],
		status: [] as ("draft" | "published" | "archived")[],
	});

	const fileInputRef = useRef<HTMLInputElement>(null);

	/**
	 * 处理文件导入
	 */
	const handleImport = async () => {
		if (!fileInputRef.current?.files?.length) {
			alert("请选择要导入的文件");
			return;
		}

		setImportLoading(true);
		setImportResult(null);

		try {
			const formData = new FormData();

			// 添加配置
			formData.append("config", JSON.stringify(importConfig));

			// 添加文件
			Array.from(fileInputRef.current.files).forEach((file) => {
				formData.append("files", file);
			});

			const response = await fetch("/api/admin/content/import", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "导入失败");
			}

			setImportResult(result.data);
			onImportComplete?.(result.data);

			// 清空文件选择
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			console.error("Import error:", error);
			alert(
				`导入失败: ${error instanceof Error ? error.message : String(error)}`,
			);
		} finally {
			setImportLoading(false);
		}
	};

	/**
	 * 处理内容导出
	 */
	const handleExport = async () => {
		if (exportConfig.contentTypes.length === 0) {
			alert("请选择要导出的内容类型");
			return;
		}

		setExportLoading(true);

		try {
			const response = await fetch("/api/admin/content/export", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(exportConfig),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "导出失败");
			}

			// 下载文件
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download =
				response.headers
					.get("Content-Disposition")
					?.split("filename=")[1]
					?.replace(/"/g, "") || "content-export.zip";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			onExportComplete?.();
		} catch (error) {
			console.error("Export error:", error);
			alert(
				`导出失败: ${error instanceof Error ? error.message : String(error)}`,
			);
		} finally {
			setExportLoading(false);
		}
	};

	/**
	 * 处理内容类型选择变化
	 */
	const handleContentTypeChange = (contentType: string, checked: boolean) => {
		setExportConfig((prev) => ({
			...prev,
			contentTypes: checked
				? [...prev.contentTypes, contentType as "posts" | "projects"]
				: prev.contentTypes.filter((type) => type !== contentType),
		}));
	};

	/**
	 * 处理状态选择变化
	 */
	const handleStatusChange = (status: string, checked: boolean) => {
		setExportConfig((prev) => ({
			...prev,
			status: checked
				? [...prev.status, status as "draft" | "published" | "archived"]
				: prev.status.filter((s) => s !== status),
		}));
	};

	return (
		<div className="space-y-8">
			{/* 导入部分 */}
			<div className="border rounded-lg p-6">
				<h3 className="text-lg font-semibold mb-4">内容导入</h3>

				<div className="space-y-4">
					{/* 文件选择 */}
					<div>
						<Label htmlFor="import-files">选择MDX文件</Label>
						<Input
							id="import-files"
							ref={fileInputRef}
							type="file"
							multiple
							accept=".md,.mdx"
							className="mt-1"
						/>
						<p className="text-sm text-gray-500 mt-1">
							支持 .md 和 .mdx 文件，可以选择多个文件
						</p>
					</div>

					{/* 导入配置 */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="import-content-type">内容类型</Label>
							<select
								id="import-content-type"
								value={importConfig.contentType}
								onChange={(e) =>
									setImportConfig((prev) => ({
										...prev,
										contentType: e.target.value as "posts" | "projects",
									}))
								}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							>
								<option value="posts">文章</option>
								<option value="projects">项目</option>
							</select>
						</div>

						<div>
							<Label htmlFor="conflict-resolution">冲突处理</Label>
							<select
								id="conflict-resolution"
								value={importConfig.conflictResolution}
								onChange={(e) =>
									setImportConfig((prev) => ({
										...prev,
										conflictResolution: e.target.value as
											| "skip"
											| "overwrite"
											| "rename",
									}))
								}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							>
								<option value="skip">跳过</option>
								<option value="overwrite">覆盖</option>
								<option value="rename">重命名</option>
							</select>
						</div>
					</div>

					{/* 导入选项 */}
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="validate-content"
								checked={importConfig.validateContent}
								onChange={(e) =>
									setImportConfig((prev) => ({
										...prev,
										validateContent: e.target.checked,
									}))
								}
							/>
							<Label htmlFor="validate-content">验证MDX内容格式</Label>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="create-categories"
								checked={importConfig.createMissingCategories}
								onChange={(e) =>
									setImportConfig((prev) => ({
										...prev,
										createMissingCategories: e.target.checked,
									}))
								}
							/>
							<Label htmlFor="create-categories">自动创建缺失的分类</Label>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="create-tags"
								checked={importConfig.createMissingTags}
								onChange={(e) =>
									setImportConfig((prev) => ({
										...prev,
										createMissingTags: e.target.checked,
									}))
								}
							/>
							<Label htmlFor="create-tags">自动创建缺失的标签</Label>
						</div>
					</div>

					{/* 导入按钮 */}
					<Button
						onClick={handleImport}
						disabled={importLoading}
						className="w-full"
					>
						{importLoading ? (
							<>
								<LoadingSpinner className="mr-2" />
								导入中...
							</>
						) : (
							"开始导入"
						)}
					</Button>

					{/* 导入结果 */}
					{importResult && (
						<div
							className={`p-4 rounded-md ${importResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
						>
							<h4 className="font-medium mb-2">导入结果</h4>
							<div className="text-sm space-y-1">
								<p>成功导入: {importResult.imported} 个文件</p>
								<p>跳过: {importResult.skipped} 个文件</p>
								<p>错误: {importResult.errors.length} 个文件</p>

								{importResult.warnings.length > 0 && (
									<div className="mt-2">
										<p className="font-medium">警告:</p>
										<ul className="list-disc list-inside">
											{importResult.warnings.map((warning, index) => (
												<li key={index} className="text-yellow-700">
													{warning}
												</li>
											))}
										</ul>
									</div>
								)}

								{importResult.errors.length > 0 && (
									<div className="mt-2">
										<p className="font-medium">错误详情:</p>
										<ul className="list-disc list-inside">
											{importResult.errors.map((error, index) => (
												<li key={index} className="text-red-700">
													{error.filename}: {error.error}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* 导出部分 */}
			<div className="border rounded-lg p-6">
				<h3 className="text-lg font-semibold mb-4">内容导出</h3>

				<div className="space-y-4">
					{/* 内容类型选择 */}
					<div>
						<Label>导出内容类型</Label>
						<div className="mt-2 space-y-2">
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="export-posts"
									checked={exportConfig.contentTypes.includes("posts")}
									onChange={(e) =>
										handleContentTypeChange("posts", e.target.checked)
									}
								/>
								<Label htmlFor="export-posts">文章</Label>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="export-projects"
									checked={exportConfig.contentTypes.includes("projects")}
									onChange={(e) =>
										handleContentTypeChange("projects", e.target.checked)
									}
								/>
								<Label htmlFor="export-projects">项目</Label>
							</div>
						</div>
					</div>

					{/* 状态筛选 */}
					<div>
						<Label>状态筛选 (留空表示导出所有状态)</Label>
						<div className="mt-2 space-y-2">
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="export-draft"
									checked={exportConfig.status.includes("draft")}
									onChange={(e) =>
										handleStatusChange("draft", e.target.checked)
									}
								/>
								<Label htmlFor="export-draft">草稿</Label>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="export-published"
									checked={exportConfig.status.includes("published")}
									onChange={(e) =>
										handleStatusChange("published", e.target.checked)
									}
								/>
								<Label htmlFor="export-published">已发布</Label>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="export-archived"
									checked={exportConfig.status.includes("archived")}
									onChange={(e) =>
										handleStatusChange("archived", e.target.checked)
									}
								/>
								<Label htmlFor="export-archived">已归档</Label>
							</div>
						</div>
					</div>

					{/* 导出选项 */}
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="include-metadata"
								checked={exportConfig.includeMetadata}
								onChange={(e) =>
									setExportConfig((prev) => ({
										...prev,
										includeMetadata: e.target.checked,
									}))
								}
							/>
							<Label htmlFor="include-metadata">包含创建和修改时间</Label>
						</div>
					</div>

					{/* 导出按钮 */}
					<Button
						onClick={handleExport}
						disabled={exportLoading || exportConfig.contentTypes.length === 0}
						className="w-full"
					>
						{exportLoading ? (
							<>
								<LoadingSpinner className="mr-2" />
								导出中...
							</>
						) : (
							"导出为ZIP文件"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
