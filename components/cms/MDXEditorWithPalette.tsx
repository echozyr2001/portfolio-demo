'use client'

import React, { useState } from 'react'
import { MonacoMDXEditor } from './MonacoMDXEditor'
import { ComponentPalette } from './ComponentPalette'
import { useMonacoEditor } from '@/lib/hooks/useMonacoEditor'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  PanelLeftOpen, 
  PanelLeftClose,
  Save,
  RotateCcw,
  Clock
} from 'lucide-react'
import { type ThemeOption } from '@/lib/monaco-config'

export interface MDXEditorWithPaletteProps {
  initialValue?: string
  onSave?: (content: string) => void
  onChange?: (content: string) => void
  height?: string | number
  readOnly?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  theme?: ThemeOption
  onThemeChange?: (theme: ThemeOption) => void
  className?: string
}

export const MDXEditorWithPalette: React.FC<MDXEditorWithPaletteProps> = ({
  initialValue = '',
  onSave,
  onChange,
  height = '600px',
  readOnly = false,
  autoSave = false,
  autoSaveDelay = 2000,
  theme = 'dark',
  onThemeChange,
  className = ''
}) => {
  const [showPalette, setShowPalette] = useState(true)
  
  const { state, actions, setEditorInstance } = useMonacoEditor({
    initialValue,
    initialTheme: theme,
    autoSave,
    autoSaveDelay,
    onSave,
    onChange
  })

  const handleEditorMount = (editor: any) => {
    setEditorInstance(editor)
  }

  const handleInsertComponent = (template: string) => {
    actions.insertText(template)
  }

  const handleSave = async () => {
    try {
      await actions.save()
    } catch (error) {
      console.error('Failed to save:', error)
      // You could add toast notification here
    }
  }

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

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Main Editor */}
      <div className="flex-1">
        <Card>
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-4">
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
              
              <Separator orientation="vertical" className="h-4" />
              
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
          
          {/* Editor */}
          <MonacoMDXEditor
            value={state.content}
            onChange={actions.updateContent}
            onSave={handleSave}
            height={height}
            readOnly={readOnly}
            showToolbar={false} // We have our own toolbar
            theme={state.theme}
            onThemeChange={(newTheme) => {
              actions.setTheme(newTheme)
              onThemeChange?.(newTheme)
            }}
            className="border-0"
          />
        </Card>
      </div>
      
      {/* Component Palette Sidebar */}
      {showPalette && (
        <div className="w-80 flex-shrink-0">
          <ComponentPalette
            onInsertComponent={handleInsertComponent}
          />
        </div>
      )}
    </div>
  )
}

export default MDXEditorWithPalette