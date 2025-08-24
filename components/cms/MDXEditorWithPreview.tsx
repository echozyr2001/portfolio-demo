'use client'

import React, { useState, useCallback } from 'react'
import { MonacoMDXEditor } from './MonacoMDXEditor'
import { MDXPreview } from './MDXPreview'
import { ComponentPalette } from './ComponentPalette'
import { useMonacoEditor } from '@/lib/hooks/useMonacoEditor'
import { useScrollSync } from '@/lib/hooks/useScrollSync'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  PanelLeftOpen, 
  PanelLeftClose,
  PanelRightOpen,
  PanelRightClose,
  Save,
  RotateCcw,
  Clock,
  Split,
  Eye,
  Code2,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { type ThemeOption } from '@/lib/monaco-config'

export interface MDXEditorWithPreviewProps {
  initialValue?: string
  onSave?: (content: string) => void
  onChange?: (content: string) => void
  readOnly?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  theme?: ThemeOption
  onThemeChange?: (theme: ThemeOption) => void
  className?: string
}

type LayoutMode = 'split' | 'editor-only' | 'preview-only'

export const MDXEditorWithPreview: React.FC<MDXEditorWithPreviewProps> = ({
  initialValue = '',
  onSave,
  onChange,
  readOnly = false,
  autoSave = false,
  autoSaveDelay = 2000,
  theme = 'dark',
  onThemeChange,
  className = ''
}) => {
  const [showPalette, setShowPalette] = useState(true)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split')
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const { state, actions, setEditorInstance } = useMonacoEditor({
    initialValue,
    initialTheme: theme,
    autoSave,
    autoSaveDelay,
    onSave,
    onChange
  })

  const {
    handleEditorScroll,
    handlePreviewScroll,
    editorScrollPosition,
    previewScrollPosition
  } = useScrollSync({
    enabled: scrollSyncEnabled,
    debounceMs: 100,
    syncRatio: true
  })

  const handleEditorMount = useCallback((editor: any) => {
    setEditorInstance(editor)
  }, [setEditorInstance])

  const handleInsertComponent = useCallback((template: string) => {
    actions.insertText(template)
  }, [actions])

  const handleSave = useCallback(async () => {
    try {
      await actions.save()
    } catch (error) {
      console.error('Failed to save:', error)
      // You could add toast notification here
    }
  }, [actions])

  const handlePreviewError = useCallback((error: Error) => {
    console.error('Preview error:', error)
    // You could add toast notification here
  }, [])

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'editor-only':
        return 'grid-cols-1'
      case 'preview-only':
        return 'grid-cols-1'
      case 'split':
      default:
        return 'grid-cols-2'
    }
  }

  return (
    <div className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="flex gap-4 h-full">
        {/* Component Palette Sidebar */}
        {showPalette && (
          <div className="w-80 flex-shrink-0">
            <ComponentPalette onInsertComponent={handleInsertComponent} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  MDX Editor & Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Layout Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPalette(!showPalette)}
                    title={showPalette ? "Hide component palette" : "Show component palette"}
                  >
                    {showPalette ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <PanelLeftOpen className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Select value={layoutMode} onValueChange={(value: LayoutMode) => setLayoutMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split">
                        <div className="flex items-center gap-2">
                          <Split className="h-3 w-3" />
                          Split
                        </div>
                      </SelectItem>
                      <SelectItem value="editor-only">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-3 w-3" />
                          Editor
                        </div>
                      </SelectItem>
                      <SelectItem value="preview-only">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          Preview
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Status Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last saved: {formatLastSaved(state.lastSaved)}
                  </div>
                  
                  {state.isModified && (
                    <div className="text-xs text-orange-500">
                      • Unsaved changes
                    </div>
                  )}
                  
                  {state.isSaving && (
                    <div className="text-xs text-blue-500">
                      Saving...
                    </div>
                  )}
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Settings */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="scroll-sync"
                      checked={scrollSyncEnabled}
                      onCheckedChange={setScrollSyncEnabled}
                    />
                    <Label htmlFor="scroll-sync" className="text-sm">Sync Scroll</Label>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={actions.reset}
                    disabled={!state.isModified}
                    title="Reset to last saved version"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={!state.isModified || state.isSaving}
                    title="Save changes (Ctrl+S)"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {state.isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Editor and Preview */}
          <div className={`grid gap-4 flex-1 ${getLayoutClasses()}`}>
            {/* Editor */}
            {(layoutMode === 'split' || layoutMode === 'editor-only') && (
              <div className="flex flex-col">
                <MonacoMDXEditor
                  value={state.content}
                  onChange={actions.updateContent}
                  onSave={handleSave}
                  height={isFullscreen ? 'calc(100vh - 200px)' : '600px'}
                  readOnly={readOnly}
                  showToolbar={false}
                  theme={state.theme}
                  onThemeChange={(newTheme) => {
                    actions.setTheme(newTheme)
                    onThemeChange?.(newTheme)
                  }}
                  className="h-full"
                />
              </div>
            )}

            {/* Preview */}
            {(layoutMode === 'split' || layoutMode === 'preview-only') && (
              <div className="flex flex-col">
                <MDXPreview
                  content={state.content}
                  onError={handlePreviewError}
                  showHeader={false}
                  enableScrollSync={scrollSyncEnabled}
                  onScroll={handlePreviewScroll}
                  scrollPosition={scrollSyncEnabled ? previewScrollPosition : undefined}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MDXEditorWithPreview