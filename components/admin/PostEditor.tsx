'use client';

import { useState, useEffect } from 'react';
import { MDXEditor } from '@/components/editor/MDXEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PostEditorProps {
  postId?: string;
  initialData?: {
    title: string;
    slug: string;
    mdxContent: string;
    status: 'draft' | 'published';
    categoryId?: string;
  };
  onSave: (data: PostFormData) => Promise<void>;
  onCancel: () => void;
}

interface PostFormData {
  title: string;
  slug: string;
  mdxContent: string;
  status: 'draft' | 'published';
  categoryId?: string;
}

export function PostEditor({ postId, initialData, onSave, onCancel }: PostEditorProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    mdxContent: initialData?.mdxContent || '',
    status: initialData?.status || 'draft',
    categoryId: initialData?.categoryId || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 自动生成 slug
  useEffect(() => {
    if (formData.title && !postId) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, postId]);

  // 检测未保存的更改
  useEffect(() => {
    if (initialData) {
      const hasChanges = 
        formData.title !== initialData.title ||
        formData.slug !== initialData.slug ||
        formData.mdxContent !== initialData.mdxContent ||
        formData.status !== initialData.status ||
        formData.categoryId !== initialData.categoryId;
      
      setHasUnsavedChanges(hasChanges);
    } else {
      const hasChanges = 
        formData.title.trim() !== '' ||
        formData.slug.trim() !== '' ||
        formData.mdxContent.trim() !== '';
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, initialData]);

  const handleSave = async (status?: 'draft' | 'published') => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        status: status || formData.status,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMDXChange = (content: string) => {
    setFormData(prev => ({ ...prev, mdxContent: content }));
  };

  const handleAutoSave = async () => {
    if (hasUnsavedChanges && formData.title.trim()) {
      await handleSave('draft');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {postId ? '编辑文章' : '新建文章'}
          </h1>
          {hasUnsavedChanges && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              有未保存的更改
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            取消
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={isSaving || !formData.title.trim()}
          >
            {isSaving ? '保存中...' : '保存草稿'}
          </Button>
          
          <Button
            onClick={() => handleSave('published')}
            disabled={isSaving || !formData.title.trim() || !formData.mdxContent.trim()}
          >
            {isSaving ? '发布中...' : '发布'}
          </Button>
        </div>
      </div>

      {/* 表单 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧：基本信息 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入文章标题"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL 别名 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  用于生成文章链接
                </p>
              </div>
              
              <div>
                <Label htmlFor="status">状态</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                  className="mt-1"
                >
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">分类</Label>
                <Select
                  id="category"
                  value={formData.categoryId || ''}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, categoryId: value }))
                  }
                  className="mt-1"
                >
                  <SelectItem value="">选择分类</SelectItem>
                  <SelectItem value="tech">技术</SelectItem>
                  <SelectItem value="life">生活</SelectItem>
                  <SelectItem value="thoughts">思考</SelectItem>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：MDX 编辑器 */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">内容编辑</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                支持 MDX 语法，可以使用 Markdown 和 React 组件
              </p>
            </div>
            
            <div className="p-4">
              <MDXEditor
                initialContent={formData.mdxContent}
                onChange={handleMDXChange}
                onSave={handleAutoSave}
                isLoading={isSaving}
                height="60vh"
                autoSaveDelay={5000}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 使用示例组件
export function PostEditorExample() {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (data: PostFormData) => {
    console.log('保存文章数据:', data);
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('文章保存成功！');
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (confirm('确定要取消编辑吗？未保存的更改将丢失。')) {
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">文章编辑器示例</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          这是一个完整的文章编辑界面，集成了 MDX 编辑器
        </p>
        <Button onClick={() => setIsEditing(true)}>
          开始编辑文章
        </Button>
      </div>
    );
  }

  return (
    <PostEditor
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}