"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewProjectPage() {
	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		mdxContent: "",
		githubUrl: "",
		liveUrl: "",
		imageUrl: "",
		technologies: [] as string[],
		featured: false,
		status: "draft" as "draft" | "published" | "archived",
		tagIds: [] as string[],
	});
	const [loading, setLoading] = useState(false);
	const [tags, setTags] = useState<any[]>([]);
	const [techInput, setTechInput] = useState("");
	const router = useRouter();

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

	const addTechnology = () => {
		if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
			setFormData((prev) => ({
				...prev,
				technologies: [...prev.technologies, techInput.trim()],
			}));
			setTechInput("");
		}
	};

	const removeTechnology = (tech: string) => {
		setFormData((prev) => ({
			...prev,
			technologies: prev.technologies.filter((t) => t !== tech),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 基本验证
		if (!formData.title.trim()) {
			alert("请输入项目标题");
			return;
		}

		if (!formData.mdxContent.trim()) {
			alert("请输入项目描述");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/admin/projects", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				router.push("/admin/projects");
			} else {
				const error = await response.json();
				alert(`创建失败: ${error.message || error.error || "未知错误"}`);
			}
		} catch (error) {
			console.error("Failed to create project:", error);
			alert("创建失败，请重试");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AdminLayout>
			<div className="p-6">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900">创建新项目</h1>
					<p className="mt-2 text-gray-600">填写项目信息并发布</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* 标题 */}
						<div>
							<Label htmlFor="title">项目标题 *</Label>
							<Input
								id="title"
								type="text"
								value={formData.title}
								onChange={handleTitleChange}
								required
								placeholder="输入项目标题"
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
									setFormData((prev) => ({ ...prev, slug: e.target.value }))
								}
								placeholder="自动生成或手动输入"
								className="mt-1"
							/>
						</div>
					</div>

					{/* 项目描述 */}
					<div>
						<Label htmlFor="mdxContent">项目描述</Label>
						<Textarea
							id="mdxContent"
							value={formData.mdxContent}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, mdxContent: e.target.value }))
							}
							placeholder="输入项目描述（支持MDX格式）"
							rows={10}
							className="mt-1"
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* GitHub URL */}
						<div>
							<Label htmlFor="githubUrl">GitHub 链接</Label>
							<Input
								id="githubUrl"
								type="url"
								value={formData.githubUrl}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										githubUrl: e.target.value,
									}))
								}
								placeholder="https://github.com/username/repo"
								className="mt-1"
							/>
						</div>

						{/* Live URL */}
						<div>
							<Label htmlFor="liveUrl">在线演示链接</Label>
							<Input
								id="liveUrl"
								type="url"
								value={formData.liveUrl}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, liveUrl: e.target.value }))
								}
								placeholder="https://example.com"
								className="mt-1"
							/>
						</div>
					</div>

					{/* 项目图片 */}
					<div>
						<Label htmlFor="imageUrl">项目图片链接</Label>
						<Input
							id="imageUrl"
							type="url"
							value={formData.imageUrl}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
							}
							placeholder="https://example.com/image.jpg"
							className="mt-1"
						/>
					</div>

					{/* 技术栈 */}
					<div>
						<Label htmlFor="technologies">技术栈</Label>
						<div className="mt-1 space-y-2">
							<div className="flex gap-2">
								<Input
									type="text"
									value={techInput}
									onChange={(e) => setTechInput(e.target.value)}
									placeholder="输入技术名称"
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addTechnology();
										}
									}}
								/>
								<Button type="button" onClick={addTechnology} variant="outline">
									添加
								</Button>
							</div>
							{formData.technologies.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formData.technologies.map((tech, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
										>
											{tech}
											<button
												type="button"
												onClick={() => removeTechnology(tech)}
												className="ml-2 text-blue-600 hover:text-blue-800"
											>
												×
											</button>
										</span>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
								className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
							>
								<option value="draft">草稿</option>
								<option value="published">已发布</option>
								<option value="archived">已归档</option>
							</select>
						</div>

						{/* 是否推荐 */}
						<div className="flex items-center space-x-2 mt-6">
							<input
								type="checkbox"
								id="featured"
								checked={formData.featured}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										featured: e.target.checked,
									}))
								}
								className="rounded border-gray-300"
							/>
							<Label htmlFor="featured">推荐项目</Label>
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="flex justify-end space-x-4 pt-6 border-t">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.push("/admin/projects")}
							disabled={loading}
						>
							取消
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "创建中..." : "创建项目"}
						</Button>
					</div>
				</form>
			</div>
		</AdminLayout>
	);
}
