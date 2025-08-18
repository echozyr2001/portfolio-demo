"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewPostPage() {
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
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
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
    setFormData(prev => ({
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
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/posts");
      } else {
        const error = await response.json();
        alert(`创建失败: ${error.message || error.error || "未知错误"}`);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">创建新文章</h1>
          <p className="mt-2 text-gray-600">填写文章信息并发布</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="自动生成或手动输入"
                className="mt-1"
              />
            </div>
          </div>

          {/* 内容 */}
          <div>
            <Label htmlFor="mdxContent">内容</Label>
            <Textarea
              id="mdxContent"
              value={formData.mdxContent}
              onChange={(e) => setFormData(prev => ({ ...prev, mdxContent: e.target.value }))}
              placeholder="输入文章内容（支持MDX格式）"
              rows={10}
              className="mt-1"
              required
            />
          </div>

          {/* 摘要 */}
          <div>
            <Label htmlFor="excerpt">摘要</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="输入文章摘要"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 状态 */}
            <div>
              <Label htmlFor="status">状态</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as "draft" | "published" | "archived" 
                }))}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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

          {/* SEO 设置 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO 设置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="metaTitle">Meta 标题</Label>
                <Input
                  id="metaTitle"
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO标题（建议60字符以内）"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta 描述</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO描述（建议160字符以内）"
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/posts")}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "创建中..." : "创建文章"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}