'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { MDXEditorToolbar } from './MDXEditorToolbar';
import { useMDXEditorShortcuts } from './hooks/useMDXEditorShortcuts';
import { useAutoSave } from './hooks/useAutoSave';
import { configureMDXLanguage } from './monaco-mdx-config';

interface MDXEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isLoading?: boolean;
  autoSaveDelay?: number; // 自动保存延迟（毫秒）
  className?: string;
  height?: string;
  theme?: 'light' | 'dark';
}

export function MDXEditor({
  initialContent = '',
  onChange,
  onSave,
  isLoading = false,
  autoSaveDelay = 2000,
  className = '',
  height = '600px',
  theme = 'dark'
}: MDXEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

  // 自动保存钩子
  const { isSaving, lastSaved } = useAutoSave(content, onSave, autoSaveDelay);

  // 快捷键钩子
  useMDXEditorShortcuts(editorRef.current, {
    onSave,
    onFormat: () => formatDocument(),
    onInsertLink: () => insertMarkdown('[链接文本](https://example.com)'),
    onInsertImage: () => insertMarkdown('![图片描述](image-url)'),
    onInsertCodeBlock: () => insertMarkdown('\n```javascript\n// 代码\n```\n'),
    onToggleBold: () => toggleMarkdown('**', '**'),
    onToggleItalic: () => toggleMarkdown('*', '*'),
  });

  // 编辑器挂载时的配置
  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // 配置 MDX 语言支持
    configureMDXLanguage(monaco);
    
    // 设置编辑器选项
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.6,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      folding: true,
      lineNumbers: 'on',
      renderWhitespace: 'boundary',
      bracketPairColorization: { enabled: true },
    });

    setIsEditorReady(true);
  }, []);

  // 内容变化处理
  const handleContentChange = useCallback((value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    onChange(newContent);
  }, [onChange]);

  // 格式化文档
  const formatDocument = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  // 插入 Markdown 语法
  const insertMarkdown = useCallback((markdown: string) => {
    if (!editorRef.current) return;

    const selection = editorRef.current.getSelection();
    if (selection) {
      editorRef.current.executeEdits('insert-markdown', [{
        range: selection,
        text: markdown,
      }]);
      
      // 设置光标位置
      const newPosition = {
        lineNumber: selection.startLineNumber,
        column: selection.startColumn + markdown.length,
      };
      editorRef.current.setPosition(newPosition);
      editorRef.current.focus();
    }
  }, []);

  // 切换 Markdown 格式（如粗体、斜体）
  const toggleMarkdown = useCallback((prefix: string, suffix: string) => {
    if (!editorRef.current) return;

    const selection = editorRef.current.getSelection();
    if (!selection) return;

    const selectedText = editorRef.current.getModel()?.getValueInRange(selection) || '';
    
    // 检查是否已经有格式
    const hasFormat = selectedText.startsWith(prefix) && selectedText.endsWith(suffix);
    
    let newText: string;
    if (hasFormat) {
      // 移除格式
      newText = selectedText.slice(prefix.length, -suffix.length);
    } else {
      // 添加格式
      newText = `${prefix}${selectedText}${suffix}`;
    }

    editorRef.current.executeEdits('toggle-markdown', [{
      range: selection,
      text: newText,
    }]);

    editorRef.current.focus();
  }, []);

  // 插入表格
  const insertTable = useCallback((rows: number = 3, cols: number = 3) => {
    const header = '| ' + Array(cols).fill('标题').join(' | ') + ' |';
    const separator = '| ' + Array(cols).fill('---').join(' | ') + ' |';
    const bodyRows = Array(rows - 1).fill('| ' + Array(cols).fill('内容').join(' | ') + ' |');
    
    const table = [header, separator, ...bodyRows].join('\n') + '\n';
    insertMarkdown(table);
  }, [insertMarkdown]);

  // 工具栏操作
  const toolbarActions = {
    onBold: () => toggleMarkdown('**', '**'),
    onItalic: () => toggleMarkdown('*', '*'),
    onStrikethrough: () => toggleMarkdown('~~', '~~'),
    onCode: () => toggleMarkdown('`', '`'),
    onLink: () => insertMarkdown('[链接文本](https://example.com)'),
    onImage: () => insertMarkdown('![图片描述](image-url)'),
    onCodeBlock: () => insertMarkdown('\n```javascript\n// 代码\n```\n'),
    onTable: () => insertTable(),
    onHeading: (level: number) => {
      const heading = '#'.repeat(level) + ' 标题';
      insertMarkdown(heading);
    },
    onList: () => insertMarkdown('\n- 列表项\n- 列表项\n'),
    onOrderedList: () => insertMarkdown('\n1. 列表项\n2. 列表项\n'),
    onQuote: () => insertMarkdown('\n> 引用内容\n'),
    onHorizontalRule: () => insertMarkdown('\n---\n'),
    onFormat: formatDocument,
  };

  // 同步初始内容
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent);
    }
  }, [initialContent]);

  return (
    <div className={`mdx-editor ${className}`}>
      {/* 工具栏 */}
      <MDXEditorToolbar
        actions={toolbarActions}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={onSave}
        disabled={isLoading || !isEditorReady}
      />

      {/* 编辑器 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
        <Editor
          height={height}
          language="mdx"
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          value={content}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
          options={{
            readOnly: isLoading,
            contextmenu: true,
            selectOnLineNumbers: true,
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>行: {editorRef.current?.getPosition()?.lineNumber || 1}</span>
          <span>列: {editorRef.current?.getPosition()?.column || 1}</span>
          <span>字符: {content.length}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isSaving && (
            <span className="text-blue-600 dark:text-blue-400">保存中...</span>
          )}
          {lastSaved && (
            <span>最后保存: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}