import * as monaco from 'monaco-editor'

export interface KeyboardShortcut {
  key: string
  description: string
  action: string
  keybinding: number
}

/**
 * Monaco Editor keyboard shortcuts for MDX editing
 */
export const monacoShortcuts: KeyboardShortcut[] = [
  {
    key: 'Ctrl+S',
    description: 'Save document',
    action: 'save-document',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
  },
  {
    key: 'Ctrl+Shift+F',
    description: 'Find and replace',
    action: 'find-replace',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF
  },
  {
    key: 'Ctrl+F',
    description: 'Find',
    action: 'find',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF
  },
  {
    key: 'Ctrl+Shift+P',
    description: 'Command palette',
    action: 'command-palette',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP
  },
  {
    key: 'Ctrl+Shift+I',
    description: 'Format document',
    action: 'format-document',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI
  },
  {
    key: 'Ctrl+/',
    description: 'Toggle comment',
    action: 'toggle-comment',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash
  },
  {
    key: 'Ctrl+D',
    description: 'Select next occurrence',
    action: 'select-next',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD
  },
  {
    key: 'Alt+Up',
    description: 'Move line up',
    action: 'move-line-up',
    keybinding: monaco.KeyMod.Alt | monaco.KeyCode.UpArrow
  },
  {
    key: 'Alt+Down',
    description: 'Move line down',
    action: 'move-line-down',
    keybinding: monaco.KeyMod.Alt | monaco.KeyCode.DownArrow
  },
  {
    key: 'Shift+Alt+Down',
    description: 'Copy line down',
    action: 'copy-line-down',
    keybinding: monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.DownArrow
  },
  {
    key: 'Shift+Alt+Up',
    description: 'Copy line up',
    action: 'copy-line-up',
    keybinding: monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.UpArrow
  },
  {
    key: 'Ctrl+Shift+K',
    description: 'Delete line',
    action: 'delete-line',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK
  }
]

/**
 * Custom MDX-specific shortcuts
 */
export const mdxShortcuts: KeyboardShortcut[] = [
  {
    key: 'Ctrl+B',
    description: 'Insert bold text',
    action: 'insert-bold',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB
  },
  {
    key: 'Ctrl+I',
    description: 'Insert italic text',
    action: 'insert-italic',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI
  },
  {
    key: 'Ctrl+K',
    description: 'Insert link',
    action: 'insert-link',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK
  },
  {
    key: 'Ctrl+Shift+C',
    description: 'Insert code block',
    action: 'insert-code-block',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC
  },
  {
    key: 'Ctrl+Shift+L',
    description: 'Insert list',
    action: 'insert-list',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL
  },
  {
    key: 'Ctrl+Shift+H',
    description: 'Insert heading',
    action: 'insert-heading',
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyH
  }
]

/**
 * Register custom keyboard shortcuts for MDX editing
 */
export function registerMDXShortcuts(
  editor: monaco.editor.IStandaloneCodeEditor,
  callbacks: {
    onSave?: () => void
    onInsertBold?: () => void
    onInsertItalic?: () => void
    onInsertLink?: () => void
    onInsertCodeBlock?: () => void
    onInsertList?: () => void
    onInsertHeading?: () => void
  }
) {
  // Save document
  if (callbacks.onSave) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      callbacks.onSave
    )
  }

  // Format document
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI,
    () => {
      editor.getAction('editor.action.formatDocument')?.run()
    }
  )

  // MDX-specific shortcuts
  if (callbacks.onInsertBold) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
      callbacks.onInsertBold
    )
  }

  if (callbacks.onInsertItalic) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI,
      callbacks.onInsertItalic
    )
  }

  if (callbacks.onInsertLink) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
      callbacks.onInsertLink
    )
  }

  if (callbacks.onInsertCodeBlock) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC,
      callbacks.onInsertCodeBlock
    )
  }

  if (callbacks.onInsertList) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL,
      callbacks.onInsertList
    )
  }

  if (callbacks.onInsertHeading) {
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyH,
      callbacks.onInsertHeading
    )
  }
}

/**
 * Text formatting utilities for MDX
 */
export const mdxFormatters = {
  bold: (text: string) => `**${text}**`,
  italic: (text: string) => `*${text}*`,
  code: (text: string) => `\`${text}\``,
  link: (text: string, url: string = '') => `[${text}](${url})`,
  heading: (text: string, level: number = 2) => `${'#'.repeat(level)} ${text}`,
  list: (items: string[]) => items.map(item => `- ${item}`).join('\n'),
  numberedList: (items: string[]) => items.map((item, i) => `${i + 1}. ${item}`).join('\n'),
  codeBlock: (code: string, language: string = 'javascript') => 
    `\`\`\`${language}\n${code}\n\`\`\``,
  blockquote: (text: string) => text.split('\n').map(line => `> ${line}`).join('\n')
}

/**
 * Insert formatted text at cursor position
 */
export function insertFormattedText(
  editor: monaco.editor.IStandaloneCodeEditor,
  formatter: (text: string) => string,
  defaultText: string = ''
) {
  const selection = editor.getSelection()
  if (!selection) return

  const model = editor.getModel()
  if (!model) return

  const selectedText = model.getValueInRange(selection)
  const textToFormat = selectedText || defaultText
  const formattedText = formatter(textToFormat)

  editor.executeEdits('format-text', [{
    range: selection,
    text: formattedText
  }])

  // If no text was selected, position cursor between formatting characters
  if (!selectedText && defaultText) {
    const newPosition = editor.getPosition()
    if (newPosition) {
      const offset = Math.floor(formattedText.length / 2)
      editor.setPosition({
        lineNumber: newPosition.lineNumber,
        column: newPosition.column - offset
      })
    }
  }

  editor.focus()
}

export default {
  monacoShortcuts,
  mdxShortcuts,
  registerMDXShortcuts,
  mdxFormatters,
  insertFormattedText
}