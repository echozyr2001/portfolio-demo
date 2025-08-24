'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MDXEditorWithPreview } from './MDXEditorWithPreview'
import { ComponentPalette } from './ComponentPalette'
import { MediaSelector } from './MediaSelector'
import type { MediaFile } from './MediaManager'
import { ComponentSelector } from './ComponentSelector'
import { 
  Save, 
  Eye, 
  EyeOff, 
  Settings, 
  FileText, 
  Image, 
  Tag, 
  Globe,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react'

export interface CMSEditPageProps {
  // Content data
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  status?: 'draft' | 'published'
  publishedAt?: string
  featuredImage?: any
  tags?: string[]
  
  // SEO data
  seoTitle?: string
  seoDescription?: string
  
  // Project-specific fields
  shortDescription?: string
  technologies?: string[]
  projectUrl?: string
  githubUrl?: string
  featured?: boolean
  order?: number
  
  // Callbacks
  onSave?: (data: any) => Promise<void>
  onPreview?: () => void
  onDelete?: () => Promise<void>
  
  // Media callbacks
  onMediaUpload?: (files: File[]) => Promise<MediaFile[]>
  onMediaDelete?: (file: MediaFile) => Promise<void>
  onMediaUpdate?: (file: MediaFile, updates: Partial<MediaFile>) => Promise<void>
  
  // Available media
  availableMedia?: MediaFile[]
  
  // Configuration
  type: 'blog' | 'project'
  isNew?: boolean
  isLoading?: boolean
  readOnly?: boolean
  className?: string
}

export const CMSEditPage: React.FC<CMSEditPageProps> = ({
  title: initialTitle = '',
  slug: initialSlug = '',
  content: initialContent = '',
  excerpt: initialExcerpt = '',
  status: initialStatus = 'draft',
  publishedAt: initialPublishedAt,
  featuredImage: initialFeaturedImage,
  tags: initialTags = [],
  seoTitle: initialSeoTitle = '',
  seoDescription: initialSeoDescription = '',
  shortDescription: initialShortDescription = '',
  technologies: initialTechnologies = [],
  projectUrl: initialProjectUrl = '',
  githubUrl: initialGithubUrl = '',
  featured: initialFeatured = false,
  order: initialOrder = 0,
  onSave,
  onPreview,
  onDelete,
  onMediaUpload,
  onMediaDelete,
  onMediaUpdate,
  availableMedia = [],
  type,
  isNew = false,
  isLoading = false,
  readOnly = false,
  className = ''
}) => {
  // Form state
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [content, setContent] = useState(initialContent)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [status, setStatus] = useState(initialStatus)
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt)
  const [featuredImage, setFeaturedImage] = useState(initialFeaturedImage)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle)
  const [seoDescription, setSeoDescription] = useState(initialSeoDescription)
  
  // Project-specific state
  const [shortDescription, setShortDescription] = useState(initialShortDescription)
  const [technologies, setTechnologies] = useState<string[]>(initialTechnologies)
  const [projectUrl, setProjectUrl] = useState(initialProjectUrl)
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl)
  const [featured, setFeatured] = useState(initialFeatured)
  const [order, setOrder] = useState(initialOrder)
  
  // UI state
  const [activeTab, setActiveTab] = useState('content')
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState('')
  const [newTech, setNewTech] = useState('')

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(generatedSlug)
    }
  }, [title, slug])

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = 
      title !== initialTitle ||
      slug !== initialSlug ||
      content !== initialContent ||
      excerpt !== initialExcerpt ||
      status !== initialStatus ||
      JSON.stringify(tags) !== JSON.stringify(initialTags) ||
      seoTitle !== initialSeoTitle ||
      seoDescription !== initialSeoDescription ||
      (type === 'project' && (
        shortDescription !== initialShortDescription ||
        JSON.stringify(technologies) !== JSON.stringify(initialTechnologies) ||
        projectUrl !== initialProjectUrl ||
        githubUrl !== initialGithubUrl ||
        featured !== initialFeatured ||
        order !== initialOrder
      ))
    
    setHasUnsavedChanges(hasChanges)
  }, [
    title, slug, content, excerpt, status, tags, seoTitle, seoDescription,
    shortDescription, technologies, projectUrl, githubUrl, featured, order,
    initialTitle, initialSlug, initialContent, initialExcerpt, initialStatus,
    initialTags, initialSeoTitle, initialSeoDescription, initialShortDescription,
    initialTechnologies, initialProjectUrl, initialGithubUrl, initialFeatured,
    initialOrder, type
  ])

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (type === 'project') {
      if (!shortDescription.trim()) {
        newErrors.shortDescription = 'Short description is required'
      }
      
      if (technologies.length === 0) {
        newErrors.technologies = 'At least one technology is required'
      }

      if (projectUrl && !projectUrl.match(/^https?:\/\/.+/)) {
        newErrors.projectUrl = 'Project URL must be a valid HTTP/HTTPS URL'
      }

      if (githubUrl && !githubUrl.match(/^https?:\/\/(www\.)?github\.com\/.+/)) {
        newErrors.githubUrl = 'GitHub URL must be a valid GitHub repository URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [title, slug, content, shortDescription, technologies, projectUrl, githubUrl, type])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      const data = {
        title,
        slug,
        content,
        excerpt,
        status,
        publishedAt: status === 'published' && !publishedAt ? new Date().toISOString() : publishedAt,
        featuredImage,
        tags,
        seo: {
          title: seoTitle,
          description: seoDescription,
        },
        ...(type === 'project' && {
          shortDescription,
          technologies: technologies.map(tech => ({ technology: tech })),
          projectUrl,
          githubUrl,
          featured,
          order,
        }),
      }

      await onSave?.(data)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save:', error)
      // Could add toast notification here
    } finally {
      setIsSaving(false)
    }
  }, [
    validateForm, title, slug, content, excerpt, status, publishedAt, featuredImage,
    tags, seoTitle, seoDescription, shortDescription, technologies, projectUrl,
    githubUrl, featured, order, type, onSave
  ])

  // Handle tag operations
  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }, [newTag, tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  // Handle technology operations
  const addTechnology = useCallback(() => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()])
      setNewTech('')
    }
  }, [newTech, technologies])

  const removeTechnology = useCallback((techToRemove: string) => {
    setTechnologies(technologies.filter(tech => tech !== techToRemove))
  }, [technologies])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

  return (
    <div className={`flex gap-6 h-screen p-6 ${className}`}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h1 className="text-2xl font-bold">
                {isNew ? `New ${type === 'blog' ? 'Post' : 'Project'}` : title || 'Untitled'}
              </h1>
            </div>
            
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
            
            <Badge variant={status === 'published' ? 'default' : 'secondary'}>
              {status === 'published' ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              disabled={!slug}
            >
              <Globe className="h-4 w-4" />
              View Live
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading || !hasUnsavedChanges}
              size="sm"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors:
              <ul className="mt-2 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="text-sm">• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 min-h-0">
              <TabsContent value="content" className="h-full mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                  <div className="lg:col-span-2 flex flex-col">
                    <Card className="flex-1 flex flex-col">
                      <CardHeader>
                        <CardTitle>Content Editor</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col min-h-0">
                        <div className="space-y-4 mb-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Enter title..."
                              className={errors.title ? 'border-destructive' : ''}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                              id="slug"
                              value={slug}
                              onChange={(e) => setSlug(e.target.value)}
                              placeholder="url-friendly-slug"
                              className={errors.slug ? 'border-destructive' : ''}
                            />
                          </div>

                          {type === 'project' && (
                            <div>
                              <Label htmlFor="shortDescription">Short Description</Label>
                              <Textarea
                                id="shortDescription"
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                placeholder="Brief description for project cards..."
                                rows={2}
                                className={errors.shortDescription ? 'border-destructive' : ''}
                              />
                            </div>
                          )}

                          {type === 'blog' && (
                            <div>
                              <Label htmlFor="excerpt">Excerpt</Label>
                              <Textarea
                                id="excerpt"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Brief excerpt for previews..."
                                rows={3}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-h-0">
                          <Label>Content (MDX)</Label>
                          <div className="mt-2 h-full">
                            <MDXEditorWithPreview
                              initialValue={content}
                              onChange={setContent}
                              onSave={handleSave}
                              autoSave={false}
                              theme="dark"
                              className="h-full"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-1 space-y-4">
                    <ComponentSelector
                      onInsertComponent={(template) => {
                        setContent(prev => prev + '\n\n' + template)
                      }}
                    />
                    
                    <ComponentPalette
                      onInsertComponent={(template) => {
                        setContent(prev => prev + '\n\n' + template)
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Publication Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {status === 'published' && (
                        <div>
                          <Label htmlFor="publishedAt">Published Date</Label>
                          <Input
                            id="publishedAt"
                            type="datetime-local"
                            value={publishedAt ? new Date(publishedAt).toISOString().slice(0, 16) : ''}
                            onChange={(e) => setPublishedAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
                          />
                        </div>
                      )}

                      {type === 'project' && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="featured"
                              checked={featured}
                              onCheckedChange={setFeatured}
                            />
                            <Label htmlFor="featured">Featured Project</Label>
                          </div>

                          <div>
                            <Label htmlFor="order">Display Order</Label>
                            <Input
                              id="order"
                              type="number"
                              value={order}
                              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addTag()
                              }
                            }}
                          />
                          <Button onClick={addTag} size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technologies (Project only) */}
                  {type === 'project' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Technologies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={newTech}
                              onChange={(e) => setNewTech(e.target.value)}
                              placeholder="Add a technology..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addTechnology()
                                }
                              }}
                              className={errors.technologies ? 'border-destructive' : ''}
                            />
                            <Button onClick={addTechnology} size="sm" variant="outline">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {technologies.map((tech) => (
                              <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                                {tech}
                                <button
                                  onClick={() => removeTechnology(tech)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Project URLs */}
                  {type === 'project' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Links</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="projectUrl">Project URL</Label>
                          <Input
                            id="projectUrl"
                            type="url"
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            placeholder="https://example.com"
                            className={errors.projectUrl ? 'border-destructive' : ''}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="githubUrl">GitHub URL</Label>
                          <Input
                            id="githubUrl"
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className={errors.githubUrl ? 'border-destructive' : ''}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <div className="space-y-6">
                  {/* Featured Image */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Featured Image
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MediaSelector
                        selectedMedia={featuredImage ? [featuredImage] : []}
                        onMediaSelect={(media) => setFeaturedImage(media[0] || null)}
                        onMediaUpload={onMediaUpload}
                        onMediaDelete={onMediaDelete}
                        onMediaUpdate={onMediaUpdate}
                        availableMedia={availableMedia}
                        accept={['image/*']}
                        placeholder="Select featured image"
                      />
                    </CardContent>
                  </Card>

                  {/* Additional Images for Projects */}
                  {type === 'project' && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Gallery</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                          Project gallery management will be implemented here.
                          <br />
                          This will allow adding multiple images for project showcases.
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Media Library */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Media Library</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MediaSelector
                        selectedMedia={[]}
                        multiple={true}
                        maxFiles={10}
                        onMediaSelect={(media) => {
                          // Insert media references into content
                          const mediaReferences = media.map(m => {
                            if (m.mimeType.startsWith('image/')) {
                              return `![${m.alt || m.filename}](${m.url})`
                            } else {
                              return `[${m.originalFilename}](${m.url})`
                            }
                          }).join('\n\n')
                          
                          if (mediaReferences) {
                            setContent(prev => prev + '\n\n' + mediaReferences)
                          }
                        }}
                        onMediaUpload={onMediaUpload}
                        onMediaDelete={onMediaDelete}
                        onMediaUpdate={onMediaUpdate}
                        availableMedia={availableMedia}
                        accept={['image/*', 'video/*', 'application/pdf']}
                        placeholder="Select media to insert"
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      SEO Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <Input
                        id="seoTitle"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Leave empty to use post title"
                        maxLength={60}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {seoTitle.length}/60 characters
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="seoDescription">Meta Description</Label>
                      <Textarea
                        id="seoDescription"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Brief description for search engines..."
                        rows={3}
                        maxLength={160}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {seoDescription.length}/160 characters
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default CMSEditPage
