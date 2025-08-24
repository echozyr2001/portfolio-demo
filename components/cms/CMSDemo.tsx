'use client'

import React, { useState } from 'react'
import { CMSLayout, CMSSidebar, CMSHeaderActions } from './CMSLayout'
import { CMSEditPage } from './CMSEditPage'
import { MediaManager } from './MediaManager'
import type { MediaFile } from './MediaManager'

// Mock data for demonstration
const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    filename: 'hero-image.jpg',
    originalFilename: 'hero-image.jpg',
    mimeType: 'image/jpeg',
    filesize: 1024000,
    width: 1920,
    height: 1080,
    url: '/images/hero-image.jpg',
    thumbnailUrl: '/images/hero-image-thumb.jpg',
    alt: 'Hero section background image',
    caption: 'Beautiful landscape for hero section',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    filename: 'project-screenshot.png',
    originalFilename: 'project-screenshot.png',
    mimeType: 'image/png',
    filesize: 512000,
    width: 1200,
    height: 800,
    url: '/images/project-screenshot.png',
    thumbnailUrl: '/images/project-screenshot-thumb.png',
    alt: 'Project dashboard screenshot',
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  }
]

export const CMSDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState('posts')
  const [editMode, setEditMode] = useState(false)
  const [currentPost, setCurrentPost] = useState<any>(null)

  // Mock handlers
  const handleSave = async (data: any) => {
    console.log('Saving data:', data)
    // Here you would integrate with your Payload CMS API
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleMediaUpload = async (files: File[]): Promise<MediaFile[]> => {
    console.log('Uploading files:', files)
    // Mock upload - in real implementation, this would upload to your storage
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      filename: file.name,
      originalFilename: file.name,
      mimeType: file.type,
      filesize: file.size,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }

  const handleMediaDelete = async (file: MediaFile) => {
    console.log('Deleting file:', file)
    // Here you would call your API to delete the file
  }

  const handleMediaUpdate = async (file: MediaFile, updates: Partial<MediaFile>) => {
    console.log('Updating file:', file, updates)
    // Here you would call your API to update the file metadata
  }

  const handleNewPost = () => {
    setCurrentPost(null)
    setEditMode(true)
  }

  const handleNewProject = () => {
    setCurrentPost(null)
    setEditMode(true)
  }

  const renderContent = () => {
    if (editMode) {
      return (
        <CMSEditPage
          type={activeSection === 'projects' ? 'project' : 'blog'}
          isNew={!currentPost}
          onSave={handleSave}
          onPreview={() => console.log('Preview')}
          onMediaUpload={handleMediaUpload}
          onMediaDelete={handleMediaDelete}
          onMediaUpdate={handleMediaUpdate}
          availableMedia={mockMediaFiles}
        />
      )
    }

    switch (activeSection) {
      case 'posts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Blog Posts</h2>
            </div>
            
            <div className="grid gap-4">
              {/* Mock post list */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Getting Started with Next.js</h3>
                <p className="text-sm text-muted-foreground">Published on Jan 15, 2024</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Building Modern Web Applications</h3>
                <p className="text-sm text-muted-foreground">Draft</p>
              </div>
            </div>
          </div>
        )
      
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Projects</h2>
            </div>
            
            <div className="grid gap-4">
              {/* Mock project list */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Portfolio Website</h3>
                <p className="text-sm text-muted-foreground">Next.js, TypeScript, Tailwind CSS</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">E-commerce Platform</h3>
                <p className="text-sm text-muted-foreground">React, Node.js, PostgreSQL</p>
              </div>
            </div>
          </div>
        )
      
      case 'media':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Media Library</h2>
            </div>
            
            <MediaManager
              files={mockMediaFiles}
              onFileUpload={handleMediaUpload}
              onFileDelete={handleMediaDelete}
              onFileUpdate={handleMediaUpdate}
              multiple={true}
            />
          </div>
        )
      
      default:
        return (
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p>This section is under development.</p>
          </div>
        )
    }
  }

  return (
    <CMSLayout
      title="Content Management System"
      subtitle="Manage your blog posts, projects, and media"
      actions={
        <CMSHeaderActions
          onNewPost={handleNewPost}
          onNewProject={handleNewProject}
          onSearch={(query) => console.log('Search:', query)}
        />
      }
      sidebar={
        <CMSSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      }
    >
      {renderContent()}
    </CMSLayout>
  )
}

export default CMSDemo
