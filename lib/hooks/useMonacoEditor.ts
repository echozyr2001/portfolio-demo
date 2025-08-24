'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'
import { type ThemeOption } from '@/lib/monaco-config'

export interface UseMonacoEditorOptions {
  initialValue?: string
  initialTheme?: ThemeOption
  autoSave?: boolean
  autoSaveDelay?: number
  onSave?: (content: string) => void
  onChange?: (content: string) => void
}

export interface MonacoEditorState {
  content: string
  theme: ThemeOption
  isModified: boolean
  isSaving: boolean
  lastSaved: Date | null
  editorInstance: monaco.editor.IStandaloneCodeEditor | null
}

export interface MonacoEditorActions {
  updateContent: (content: string) => void
  setTheme: (theme: ThemeOption) => void
  save: () => Promise<void>
  reset: () => void
  insertText: (text: string, position?: monaco.Position) => void
  formatDocument: () => void
  findAndReplace: () => void
  undo: () => void
  redo: () => void
  focus: () => void
  getSelection: () => string
  replaceSelection: (text: string) => void
}

export function useMonacoEditor(options: UseMonacoEditorOptions = {}) {
  const {
    initialValue = '',
    initialTheme = 'dark',
    autoSave = false,
    autoSaveDelay = 2000,
    onSave,
    onChange
  } = options

  const [state, setState] = useState<MonacoEditorState>({
    content: initialValue,
    theme: initialTheme,
    isModified: false,
    isSaving: false,
    lastSaved: null,
    editorInstance: null
  })

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const initialContentRef = useRef(initialValue)

  // Update initial content when prop changes
  useEffect(() => {
    if (initialValue !== initialContentRef.current) {
      initialContentRef.current = initialValue
      setState(prev => ({
        ...prev,
        content: initialValue,
        isModified: false
      }))
    }
  }, [initialValue])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && state.isModified && !state.isSaving) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        save()
      }, autoSaveDelay)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [state.isModified, state.isSaving, autoSave, autoSaveDelay])

  const updateContent = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      content,
      isModified: content !== initialContentRef.current
    }))
    onChange?.(content)
  }, [onChange])

  const setTheme = useCallback((theme: ThemeOption) => {
    setState(prev => ({ ...prev, theme }))
  }, [])

  const save = useCallback(async () => {
    if (!state.isModified || state.isSaving) return

    setState(prev => ({ ...prev, isSaving: true }))
    
    try {
      await onSave?.(state.content)
      initialContentRef.current = state.content
      setState(prev => ({
        ...prev,
        isModified: false,
        isSaving: false,
        lastSaved: new Date()
      }))
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }))
      throw error
    }
  }, [state.content, state.isModified, state.isSaving, onSave])

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      content: initialContentRef.current,
      isModified: false
    }))
  }, [])

  const insertText = useCallback((text: string, position?: monaco.Position) => {
    const editor = state.editorInstance
    if (!editor) return

    const insertPosition = position || editor.getPosition()
    if (insertPosition) {
      editor.executeEdits('insert-text', [{
        range: new monaco.Range(
          insertPosition.lineNumber,
          insertPosition.column,
          insertPosition.lineNumber,
          insertPosition.column
        ),
        text
      }])
      editor.focus()
    }
  }, [state.editorInstance])

  const formatDocument = useCallback(() => {
    state.editorInstance?.getAction('editor.action.formatDocument')?.run()
  }, [state.editorInstance])

  const findAndReplace = useCallback(() => {
    state.editorInstance?.getAction('editor.action.startFindReplaceAction')?.run()
  }, [state.editorInstance])

  const undo = useCallback(() => {
    state.editorInstance?.getAction('undo')?.run()
  }, [state.editorInstance])

  const redo = useCallback(() => {
    state.editorInstance?.getAction('redo')?.run()
  }, [state.editorInstance])

  const focus = useCallback(() => {
    state.editorInstance?.focus()
  }, [state.editorInstance])

  const getSelection = useCallback(() => {
    const editor = state.editorInstance
    if (!editor) return ''
    
    const selection = editor.getSelection()
    if (!selection) return ''
    
    return editor.getModel()?.getValueInRange(selection) || ''
  }, [state.editorInstance])

  const replaceSelection = useCallback((text: string) => {
    const editor = state.editorInstance
    if (!editor) return

    const selection = editor.getSelection()
    if (selection) {
      editor.executeEdits('replace-selection', [{
        range: selection,
        text
      }])
      editor.focus()
    }
  }, [state.editorInstance])

  const setEditorInstance = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    setState(prev => ({ ...prev, editorInstance: editor }))
  }, [])

  const actions: MonacoEditorActions = {
    updateContent,
    setTheme,
    save,
    reset,
    insertText,
    formatDocument,
    findAndReplace,
    undo,
    redo,
    focus,
    getSelection,
    replaceSelection
  }

  return {
    state,
    actions,
    setEditorInstance
  }
}

export default useMonacoEditor