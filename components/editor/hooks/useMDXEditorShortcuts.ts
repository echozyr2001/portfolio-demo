import { useEffect } from 'react';
import type { editor } from 'monaco-editor';

interface ShortcutActions {
  onSave: () => void;
  onFormat: () => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onInsertCodeBlock: () => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
}

export function useMDXEditorShortcuts(
  editor: editor.IStandaloneCodeEditor | null,
  actions: ShortcutActions
) {
  useEffect(() => {
    if (!editor || typeof window === 'undefined') return;

    // 获取 monaco 实例
    const monacoInstance = (window as any).monaco;
    if (!monacoInstance) return;

    // 注册快捷键
    const disposables = [
      // Ctrl+S - 保存
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
        actions.onSave();
      }),

      // Shift+Alt+F - 格式化
      editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.KeyF, () => {
        actions.onFormat();
      }),

      // Ctrl+K - 插入链接
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyK, () => {
        actions.onInsertLink();
      }),

      // Ctrl+Shift+I - 插入图片
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyI, () => {
        actions.onInsertImage();
      }),

      // Ctrl+Shift+C - 插入代码块
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyC, () => {
        actions.onInsertCodeBlock();
      }),

      // Ctrl+B - 粗体
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyB, () => {
        actions.onToggleBold();
      }),

      // Ctrl+I - 斜体
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyI, () => {
        actions.onToggleItalic();
      }),

      // Ctrl+` - 行内代码
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Backquote, () => {
        const selection = editor.getSelection();
        if (selection) {
          const selectedText = editor.getModel()?.getValueInRange(selection) || '';
          const hasBackticks = selectedText.startsWith('`') && selectedText.endsWith('`');
          const newText = hasBackticks 
            ? selectedText.slice(1, -1)
            : `\`${selectedText}\``;
          
          editor.executeEdits('toggle-code', [{
            range: selection,
            text: newText,
          }]);
        }
      }),

      // Tab - 缩进
      editor.addCommand(monacoInstance.KeyCode.Tab, () => {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          // 多行选择时，缩进所有行
          editor.getAction('editor.action.indentLines')?.run();
        } else {
          // 单行时插入 tab
          editor.trigger('keyboard', 'type', { text: '  ' });
        }
      }),

      // Shift+Tab - 取消缩进
      editor.addCommand(monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Tab, () => {
        editor.getAction('editor.action.outdentLines')?.run();
      }),

      // Ctrl+/ - 切换注释
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Slash, () => {
        const selection = editor.getSelection();
        if (selection) {
          const selectedText = editor.getModel()?.getValueInRange(selection) || '';
          const isCommented = selectedText.startsWith('{/*') && selectedText.endsWith('*/}');
          const newText = isCommented
            ? selectedText.slice(3, -3)
            : `{/*${selectedText}*/}`;
          
          editor.executeEdits('toggle-comment', [{
            range: selection,
            text: newText,
          }]);
        }
      }),

      // Ctrl+D - 复制当前行
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyD, () => {
        editor.getAction('editor.action.copyLinesDownAction')?.run();
      }),

      // Alt+Up/Down - 移动行
      editor.addCommand(monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.UpArrow, () => {
        editor.getAction('editor.action.moveLinesUpAction')?.run();
      }),

      editor.addCommand(monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.DownArrow, () => {
        editor.getAction('editor.action.moveLinesDownAction')?.run();
      }),

      // Ctrl+Shift+K - 删除行
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyK, () => {
        editor.getAction('editor.action.deleteLines')?.run();
      }),

      // Ctrl+Enter - 在下方插入新行
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
        const position = editor.getPosition();
        if (position) {
          editor.executeEdits('insert-line-below', [{
            range: {
              startLineNumber: position.lineNumber,
              startColumn: editor.getModel()?.getLineMaxColumn(position.lineNumber) || 1,
              endLineNumber: position.lineNumber,
              endColumn: editor.getModel()?.getLineMaxColumn(position.lineNumber) || 1,
            },
            text: '\n',
          }]);
          
          editor.setPosition({
            lineNumber: position.lineNumber + 1,
            column: 1,
          });
        }
      }),

      // Ctrl+Shift+Enter - 在上方插入新行
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.Enter, () => {
        const position = editor.getPosition();
        if (position) {
          editor.executeEdits('insert-line-above', [{
            range: {
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: 1,
            },
            text: '\n',
          }]);
          
          editor.setPosition({
            lineNumber: position.lineNumber,
            column: 1,
          });
        }
      }),
    ];

    // 清理函数
    return () => {
      disposables.forEach(disposable => {
        if (disposable && typeof disposable.dispose === 'function') {
          disposable.dispose();
        }
      });
    };
  }, [editor, actions]);

  // 添加全局快捷键监听（当编辑器失焦时）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 只在编辑器容器内处理
      const target = event.target as HTMLElement;
      if (!target.closest('.mdx-editor')) return;

      // 阻止浏览器默认的保存行为
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        actions.onSave();
      }

      // 阻止浏览器默认的格式化行为
      if (event.shiftKey && event.altKey && event.key === 'F') {
        event.preventDefault();
        actions.onFormat();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}