"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MDXEditorWithPreview } from "@/components/editor/MDXEditorWithPreview";
import type { Category, Tag } from "@/lib/schema";

export default function EditPostPage() {
	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		mdxContent: "",
		excerpt: "",
		status: "draft" as "draft" | "published" | "archived",
		categoryId: "",
		tagIds: [] as string[],
		metaTitle: "",
		metaDescription: "",
	});
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [categories, setCategories] = useState<Category[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [editorKey, setEditorKey] = useState(0); // 用于强制重新渲染编辑器
	const router = useRouter();
	const params = useParams();
	const postId = params.id as string;

	// 加载现有post数据
	useEffect(() => {
		const loadPost = async () => {
			try {
				const response = await fetch(`/api/admin/posts/${postId}`);
				if (response.ok) {
					const data = await response.json();
					const post = data.data;
					setFormData({
						title: post.title || "",
						slug: post.slug || "",
						mdxContent: post.mdxContent || "",
						excerpt: post.excerpt || "",
						status: post.status || "draft",
						categoryId: post.categoryId || "",
						tagIds: post.tags?.map((tag: Tag) => tag.id) || [],
						metaTitle: post.metaTitle || "",
						metaDescription: post.metaDescription || "",
					});
					// 强制编辑器重新渲染以加载新内容
					setEditorKey((prev) => prev + 1);
				} else {
					console.error("Failed to load post");
					router.push("/admin/posts");
				}
			} catch (error) {
				console.error("Error loading post:", error);
				router.push("/admin/posts");
			} finally {
				setInitialLoading(false);
			}
		};

		if (postId) {
			loadPost();
		}
	}, [postId, router]);

	// 加载categories和tags
	useEffect(() => {
		const loadData = async () => {
			try {
				// 加载categories
				const categoriesResponse = await fetch("/api/categories");
				if (categoriesResponse.ok) {
					const categoriesData = await categoriesResponse.json();
					setCategories(categoriesData.data?.categories || []);
				}

				// 加载tags
				const tagsResponse = await fetch("/api/tags");
				if (tagsResponse.ok) {
					const tagsData = await tagsResponse.json();
					setTags(tagsData.data?.tags || []);
				}
			} catch (error) {
				console.error("Error loading data:", error);
			}
		};

		loadData();
	}, []);

	// 生成slug
	const generateSlug = (title: string) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
			.replace(/^-+|-+$/g, "");
	};

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const title = e.target.value;
		setFormData((prev) => ({
			...prev,
			title,
			slug: generateSlug(title),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 基本验证
		if (!formData.title.trim()) {
			alert("请输入文章标题");
			return;
		}

		if (!formData.mdxContent.trim()) {
			alert("请输入文章内容");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(`/api/admin/posts/${postId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				router.push("/admin/posts");
			} else {
				const errorData = await response.json();
				alert(`更新失败: ${errorData.message || "未知错误"}`);
			}
		} catch (error) {
			console.error("Error updating post:", error);
			alert("更新失败，请检查网络连接");
		} finally {
			setLoading(false);
		}
	};

	const handleTagToggle = (tagId: string) => {
		setFormData((prev) => ({
			...prev,
			tagIds: prev.tagIds.includes(tagId)
				? prev.tagIds.filter((id) => id !== tagId)
				: [...prev.tagIds, tagId],
		}));
	};

	if (initialLoading) {
		return (
			<AdminLayout>
				<div className="p-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="space-y-4">
							<div className="h-10 bg-gray-200 rounded"></div>
							<div className="h-10 bg-gray-200 rounded"></div>
							<div className="h-32 bg-gray-200 rounded"></div>
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			<div className="p-6">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="flex justify-between items-center mb-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">编辑文章</h1>
							<p className="text-sm text-gray-600 mt-1">修改文章内容和设置</p>
						</div>
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/admin/posts")}
						>
							取消
						</Button>
					</div>

					{/* 左右布局 */}
					<form
						onSubmit={handleSubmit}
						className="grid grid-cols-1 lg:grid-cols-4 gap-6"
					>
						{/* 左侧：基本信息和设置 */}
						<div className="lg:col-span-1 space-y-6">
							{/* 基本信息 */}
							<div className="bg-white p-4 rounded-lg border border-gray-200">
								<h3 className="text-lg font-semibold mb-4">基本信息</h3>

								<div className="space-y-4">
									{/* 标题 */}
									<div>
										<Label htmlFor="title">标题 *</Label>
										<Input
											id="title"
											type="text"
											value={formData.title}
											onChange={handleTitleChange}
											required
											placeholder="输入文章标题"
											className="mt-1"
										/>
									</div>

									{/* Slug */}
									<div>
										<Label htmlFor="slug">URL Slug</Label>
										<Input
											id="slug"
											type="text"
											value={formData.slug}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													slug: e.target.value,
												}))
											}
											placeholder="自动生成或手动输入"
											className="mt-1"
										/>
										<p className="text-xs text-gray-500 mt-1">
											用于生成文章链接
										</p>
									</div>

									{/* 状态 */}
									<div>
										<Label htmlFor="status">状态</Label>
										<select
											id="status"
											value={formData.status}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													status: e.target.value as
														| "draft"
														| "published"
														| "archived",
												}))
											}
											className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
										>
											<option value="draft">草稿</option>
											<option value="published">已发布</option>
											<option value="archived">已归档</option>
										</select>
									</div>

									{/* 分类 */}
									<div>
										<Label htmlFor="categoryId">分类</Label>
										<select
											id="categoryId"
											value={formData.categoryId}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													categoryId: e.target.value,
												}))
											}
											className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
										>
											<option value="">选择分类</option>
											{categories.map((category) => (
												<option key={category.id} value={category.id}>
													{category.name}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>

							{/* 标签 */}
							{tags.length > 0 && (
								<div className="bg-white p-4 rounded-lg border border-gray-200">
									<h3 className="text-lg font-semibold mb-4">标签</h3>
									<div className="flex flex-wrap gap-2">
										{tags.map((tag) => (
											<label
												key={tag.id}
												className="flex items-center space-x-2 cursor-pointer"
											>
												<input
													type="checkbox"
													checked={formData.tagIds.includes(tag.id)}
													onChange={() => handleTagToggle(tag.id)}
													className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
												/>
												<span className="text-sm text-gray-700">
													{tag.name}
												</span>
											</label>
										))}
									</div>
								</div>
							)}

							{/* 摘要 */}
							<div className="bg-white p-4 rounded-lg border border-gray-200">
								<h3 className="text-lg font-semibold mb-4">摘要</h3>
								<Textarea
									id="excerpt"
									value={formData.excerpt}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											excerpt: e.target.value,
										}))
									}
									placeholder="输入文章摘要"
									rows={4}
									className="w-full"
								/>
							</div>

							{/* SEO设置 */}
							<div className="bg-white p-4 rounded-lg border border-gray-200">
								<h3 className="text-lg font-semibold mb-4">SEO设置</h3>
								<div className="space-y-4">
									{/* Meta Title */}
									<div>
										<Label htmlFor="metaTitle">Meta标题</Label>
										<Input
											id="metaTitle"
											type="text"
											value={formData.metaTitle}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													metaTitle: e.target.value,
												}))
											}
											placeholder="SEO标题（建议60字符以内）"
											className="mt-1"
										/>
									</div>

									{/* Meta Description */}
									<div>
										<Label htmlFor="metaDescription">Meta描述</Label>
										<Textarea
											id="metaDescription"
											value={formData.metaDescription}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													metaDescription: e.target.value,
												}))
											}
											placeholder="SEO描述（建议160字符以内）"
											rows={3}
											className="mt-1"
										/>
									</div>
								</div>
							</div>

							{/* 提交按钮 */}
							<div className="bg-white p-4 rounded-lg border border-gray-200">
								<div className="flex flex-col space-y-3">
									<Button
										type="submit"
										disabled={loading}
										className="w-full bg-indigo-600 hover:bg-indigo-700"
									>
										{loading ? "更新中..." : "更新文章"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => router.push("/admin/posts")}
										className="w-full"
									>
										取消
									</Button>
								</div>
							</div>
						</div>

						{/* 右侧：内容编辑器 */}
						<div className="lg:col-span-3">
							<div className="bg-white rounded-lg border border-gray-200">
								<div className="p-4 border-b border-gray-200">
									<h3 className="text-lg font-semibold">内容编辑</h3>
									<p className="text-sm text-gray-600 mt-1">
										支持 MDX 语法，可以使用 Markdown 和 React 组件
									</p>
								</div>

								<div className="p-4">
									<MDXEditorWithPreview
										key={editorKey} // 使用key强制重新渲染
										initialContent={formData.mdxContent}
										onChange={(content) =>
											setFormData((prev) => ({ ...prev, mdxContent: content }))
										}
										onSave={() => {}} // 这里不需要实现，因为我们有主要的保存按钮
										height="70vh"
										initialPreviewMode="split"
										availableModes={["edit", "split"]} // 只显示编辑和并排模式
										className="border border-gray-300 rounded-md overflow-hidden"
									/>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</AdminLayout>
	);
}
