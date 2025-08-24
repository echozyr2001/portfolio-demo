'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  Image, 
  File, 
  X, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Download, 
  Trash2, 
  Eye, 
  Copy, 
  Check,
  AlertCircle,
  FileImage,
  FileVideo,
  FileText
} from 'lucide-react'

export interface MediaFile {
  id: string
  filename: string
  originalFilename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  url: string
  thumbnailUrl?: string
  alt?: string
  caption?: string
  createdAt: string
  updatedAt: string
}

export interface MediaManagerProps {
  // Data
  files?: MediaFile[]
  selectedFiles?: MediaFile[]
  
  // Configuration
  multiple?: boolean
  accept?: string[]
  maxFileSize?: number
  maxFiles?: number
  
  // Callbacks
  onFileSelect?: (files: MediaFile[]) => void
  onFileUpload?: (files: File[]) => Promise<MediaFile[]>
  onFileDelete?: (file: MediaFile) => Promise<void>
  onFileUpdate?: (file: MediaFile, updates: Partial<MediaFile>) => Promise<void>
  
  // UI
  view?: 'grid' | 'list'
  className?: string
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  files = [],
  selectedFiles = [],
  multiple = false,
  accept = ['image/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  onFileSelect,
  onFileUpload,
  onFileDelete,
  onFileUpdate,
  view: initialView = 'grid',
  className = ''
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [view, setView] = useState(initialView)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(selectedFiles.map(f => f.id))
  )
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Filter and search files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.alt?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'images' && file.mimeType.startsWith('image/')) ||
                         (filterType === 'videos' && file.mimeType.startsWith('video/')) ||
                         (filterType === 'documents' && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'))
    
    return matchesSearch && matchesFilter
  })

  // File selection
  const handleFileSelect = useCallback((file: MediaFile) => {
    if (multiple) {
      const newSelection = new Set(selectedFileIds)
      if (newSelection.has(file.id)) {
        newSelection.delete(file.id)
      } else {
        newSelection.add(file.id)
      }
      setSelectedFileIds(newSelection)
      
      const selectedFiles = files.filter(f => newSelection.has(f.id))
      onFileSelect?.(selectedFiles)
    } else {
      setSelectedFileIds(new Set([file.id]))
      onFileSelect?.([file])
    }
  }, [multiple, selectedFileIds, files, onFileSelect])

  // File upload
  const handleFileUpload = useCallback(async (uploadFiles: File[]) => {
    if (!onFileUpload) return

    setIsUploading(true)
    try {
      const validFiles = uploadFiles.filter(file => {
        const isValidType = accept.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1))
          }
          return file.type === type
        })
        const isValidSize = file.size <= maxFileSize
        return isValidType && isValidSize
      })

      if (validFiles.length !== uploadFiles.length) {
        console.warn('Some files were filtered out due to type or size restrictions')
      }

      if (validFiles.length === 0) {
        return
      }

      // Simulate upload progress
      validFiles.forEach((file, index) => {
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const progress = (prev[file.name] || 0) + 10
            if (progress >= 100) {
              clearInterval(progressInterval)
              return { ...prev, [file.name]: 100 }
            }
            return { ...prev, [file.name]: progress }
          })
        }, 100)
      })

      const uploadedFiles = await onFileUpload(validFiles)
      
      // Clear progress
      setUploadProgress({})
      
      if (uploadedFiles.length > 0) {
        // Auto-select uploaded files
        const newSelection = new Set(uploadedFiles.map(f => f.id))
        setSelectedFileIds(newSelection)
        onFileSelect?.(uploadedFiles)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadProgress({})
    } finally {
      setIsUploading(false)
    }
  }, [accept, maxFileSize, onFileUpload, onFileSelect])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  // File input handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileUpload])

  // Copy URL to clipboard
  const copyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }, [])

  // File type icon
  const getFileIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-4 w-4" />
    } else {
      return <FileText className="h-4 w-4" />
    }
  }, [])

  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Image className="h-5 w-5" />
            Media Library
          </h3>
          
          {selectedFileIds.size > 0 && (
            <Badge variant="secondary">
              {selectedFileIds.size} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Files</option>
          <option value="images">Images</option>
          <option value="videos">Videos</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      {/* Upload Progress */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uploading Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{filename}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        `}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Max file size: {formatFileSize(maxFileSize)} • 
          Accepted types: {accept.join(', ')}
        </p>
      </div>

      {/* File Grid/List */}
      <div className="min-h-[400px]">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`
                  relative group border rounded-lg overflow-hidden cursor-pointer transition-all
                  ${selectedFileIds.has(file.id) ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}
                `}
                onClick={() => handleFileSelect(file)}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {file.mimeType.startsWith('image/') ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      {getFileIcon(file.mimeType)}
                    </div>
                  )}
                </div>
                
                <div className="p-2">
                  <p className="text-xs font-medium truncate" title={file.originalFilename}>
                    {file.originalFilename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.filesize)}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingFile(file)
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyUrl(file.url)
                    }}
                  >
                    {copiedUrl === file.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  {onFileDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileDelete(file)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Selection Indicator */}
                {selectedFileIds.has(file.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`
                  flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedFileIds.has(file.id) ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}
                `}
                onClick={() => handleFileSelect(file)}
              >
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  {file.mimeType.startsWith('image/') ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || file.filename}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file.mimeType)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.originalFilename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.filesize)} • {file.mimeType}
                  </p>
                  {file.width && file.height && (
                    <p className="text-xs text-muted-foreground">
                      {file.width} × {file.height}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingFile(file)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyUrl(file.url)
                    }}
                  >
                    {copiedUrl === file.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  {onFileDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileDelete(file)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {selectedFileIds.has(file.id) && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple && files.length < maxFiles}
        accept={accept.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* File Edit Dialog */}
      {editingFile && (
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Media File</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {editingFile.mimeType.startsWith('image/') ? (
                  <img
                    src={editingFile.url}
                    alt={editingFile.alt || editingFile.filename}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                    {getFileIcon(editingFile.mimeType)}
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>File: {editingFile.originalFilename}</p>
                  <p>Size: {formatFileSize(editingFile.filesize)}</p>
                  <p>Type: {editingFile.mimeType}</p>
                  {editingFile.width && editingFile.height && (
                    <p>Dimensions: {editingFile.width} × {editingFile.height}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    value={editingFile.alt || ''}
                    onChange={(e) => setEditingFile({ ...editingFile, alt: e.target.value })}
                    placeholder="Describe this image..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={editingFile.caption || ''}
                    onChange={(e) => setEditingFile({ ...editingFile, caption: e.target.value })}
                    placeholder="Optional caption..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>File URL</Label>
                  <div className="flex gap-2">
                    <Input value={editingFile.url} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyUrl(editingFile.url)}
                    >
                      {copiedUrl === editingFile.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      onFileUpdate?.(editingFile, {
                        alt: editingFile.alt,
                        caption: editingFile.caption
                      })
                      setEditingFile(null)
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingFile(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default MediaManager
