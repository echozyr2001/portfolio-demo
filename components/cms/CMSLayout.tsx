'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Folder, 
  Image, 
  Settings, 
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react'

export interface CMSLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export const CMSLayout: React.FC<CMSLayoutProps> = ({
  children,
  title = 'Content Management',
  subtitle,
  actions,
  sidebar,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          {sidebar && (
            <div className="w-64 flex-shrink-0">
              {sidebar}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface CMSSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
  className?: string
}

export const CMSSidebar: React.FC<CMSSidebarProps> = ({
  activeSection = 'posts',
  onSectionChange,
  className = ''
}) => {
  const sections = [
    {
      id: 'posts',
      name: 'Blog Posts',
      icon: <FileText className="h-4 w-4" />,
      count: 12
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <Folder className="h-4 w-4" />,
      count: 8
    },
    {
      id: 'media',
      name: 'Media Library',
      icon: <Image className="h-4 w-4" />,
      count: 156
    },
    {
      id: 'users',
      name: 'Users',
      icon: <Users className="h-4 w-4" />,
      count: 1
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings className="h-4 w-4" />
    }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange?.(section.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 text-sm transition-colors
                ${activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <span>{section.name}</span>
              </div>
              
              {section.count !== undefined && (
                <Badge 
                  variant={activeSection === section.id ? "secondary" : "outline"} 
                  className="text-xs"
                >
                  {section.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}

export interface CMSHeaderActionsProps {
  onNewPost?: () => void
  onNewProject?: () => void
  onSearch?: (query: string) => void
  className?: string
}

export const CMSHeaderActions: React.FC<CMSHeaderActionsProps> = ({
  onNewPost,
  onNewProject,
  onSearch,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4" />
        Filter
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button onClick={onNewPost} size="sm">
        <Plus className="h-4 w-4" />
        New Post
      </Button>
      
      <Button onClick={onNewProject} variant="outline" size="sm">
        <Plus className="h-4 w-4" />
        New Project
      </Button>
      
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default CMSLayout
