import { editor } from 'monaco-editor'

export interface EditorConfig {
  language: 'markdown' | 'mdx'
  theme: 'vs-dark' | 'vs-light'
  options: editor.IStandaloneEditorConstructionOptions
}

export const defaultEditorConfig: EditorConfig = {
  language: 'markdown',
  theme: 'vs-dark',
  options: {
    minimap: { enabled: false },
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    autoIndent: 'full',
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'selection',
    bracketPairColorization: {
      enabled: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    }
  }
}

// MDX language configuration for Monaco
export const mdxLanguageConfig = {
  id: 'mdx',
  extensions: ['.mdx'],
  aliases: ['MDX', 'mdx'],
  mimetypes: ['text/x-mdx'],
}

// Custom MDX tokens and syntax highlighting
export const mdxTokensProvider = {
  tokenizer: {
    root: [
      // JSX tags
      [/<\/?[a-zA-Z][\w-]*/, 'tag'],
      [/\{[^}]*\}/, 'delimiter.bracket'],
      
      // Markdown headers
      [/^#{1,6}\s.*$/, 'keyword'],
      
      // Code blocks
      [/```[\s\S]*?```/, 'string'],
      [/`[^`]*`/, 'string'],
      
      // Links
      [/\[([^\]]*)\]\(([^)]*)\)/, 'string.link'],
      
      // Bold and italic
      [/\*\*[^*]*\*\*/, 'strong'],
      [/\*[^*]*\*/, 'emphasis'],
      
      // Lists
      [/^\s*[-*+]\s/, 'keyword'],
      [/^\s*\d+\.\s/, 'keyword'],
    ]
  }
}

export const monacoThemes = {
  'vs-dark': {
    base: 'vs-dark' as const,
    inherit: true,
    rules: [
      { token: 'tag', foreground: '569cd6' },
      { token: 'delimiter.bracket', foreground: 'ffd700' },
      { token: 'keyword', foreground: '4ec9b0' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'string.link', foreground: '4fc1ff' },
      { token: 'strong', fontStyle: 'bold' },
      { token: 'emphasis', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
    }
  },
  'vs-light': {
    base: 'vs' as const,
    inherit: true,
    rules: [
      { token: 'tag', foreground: '0000ff' },
      { token: 'delimiter.bracket', foreground: 'ff8c00' },
      { token: 'keyword', foreground: '008000' },
      { token: 'string', foreground: 'a31515' },
      { token: 'string.link', foreground: '0066cc' },
      { token: 'strong', fontStyle: 'bold' },
      { token: 'emphasis', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#000000',
    }
  }
}