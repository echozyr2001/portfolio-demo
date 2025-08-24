// Monaco will be imported dynamically to avoid SSR issues

export interface EditorConfig {
  language: 'markdown' | 'mdx'
  theme: 'vs-dark' | 'vs-light' | 'hc-black'
  options: any // Will be typed properly when monaco is loaded
}

/**
 * Default Monaco Editor configuration for MDX editing
 */
export const defaultEditorConfig: EditorConfig = {
  language: 'markdown', // We'll use markdown as base and enhance it
  theme: 'vs-dark',
  options: {
    minimap: { enabled: true },
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    autoIndent: 'full',
    formatOnPaste: true,
    formatOnType: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,
    renderWhitespace: 'selection',
    renderControlCharacters: false,
    renderLineHighlight: 'line',
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    mouseWheelZoom: true,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    bracketPairColorization: {
      enabled: true
    },
    guides: {
      bracketPairs: true,
      indentation: true
    }
  }
}

/**
 * MDX language configuration for Monaco Editor
 */
export function configureMDXLanguage(monaco: any) {
  // Register MDX as a language variant of markdown
  monaco.languages.register({ id: 'mdx' })
  
  // Set language configuration
  monaco.languages.setLanguageConfiguration('mdx', {
    comments: {
      blockComment: ['{/*', '*/}']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
      ['<', '>']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '<', close: '>', notIn: ['string'] },
      { open: '`', close: '`', notIn: ['string'] },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '<', close: '>' },
      { open: '`', close: '`' },
      { open: '"', close: '"' },
      { open: "'", close: "'" }
    ]
  })
  
  // Set tokenization rules for MDX
  monaco.languages.setMonarchTokensProvider('mdx', {
    tokenizer: {
      root: [
        // JSX tags
        [/<\/?[a-zA-Z][\w]*/, 'tag'],
        [/<\/?[a-zA-Z][\w]*\s*\/?>/, 'tag'],
        
        // JSX expressions
        [/\{[^}]*\}/, 'delimiter'],
        
        // Markdown headers
        [/^#{1,6}\s.*$/, 'header'],
        
        // Markdown bold
        [/\*\*[^*]+\*\*/, 'strong'],
        [/__[^_]+__/, 'strong'],
        
        // Markdown italic
        [/\*[^*]+\*/, 'emphasis'],
        [/_[^_]+_/, 'emphasis'],
        
        // Markdown code
        [/`[^`]+`/, 'string'],
        
        // Markdown links
        [/\[([^\]]+)\]\(([^)]+)\)/, 'string'],
        
        // Markdown lists
        [/^\s*[-*+]\s/, 'keyword'],
        [/^\s*\d+\.\s/, 'keyword'],
        
        // Code blocks
        [/^```[\s\S]*?^```$/m, 'string'],
        
        // Comments
        [/\{\/\*[\s\S]*?\*\/\}/, 'comment']
      ]
    }
  })
}

/**
 * Custom completion provider for MDX components
 */
export function registerMDXCompletionProvider(monaco: any) {
  monaco.languages.registerCompletionItemProvider('mdx', {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
      
      const suggestions: any[] = [
        {
          label: 'CodeBlock',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<CodeBlock language="${1:javascript}">\n${2:// Your code here}\n</CodeBlock>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a code block with syntax highlighting',
          range
        },
        {
          label: 'ImageGallery',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<ImageGallery images={[\n  {\n    src: "${1:/path/to/image.jpg}",\n    alt: "${2:Image description}",\n    caption: "${3:Optional caption}"\n  }\n]} />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert an image gallery component',
          range
        },
        {
          label: 'ProjectCard',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<ProjectCard\n  title="${1:Project Title}"\n  description="${2:Project description}"\n  technologies={["${3:React}", "${4:TypeScript}"]}\n  projectUrl="${5:https://example.com}"\n  githubUrl="${6:https://github.com/user/repo}"\n  image="${7:/path/to/image.jpg}"\n/>',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a project card component',
          range
        },
        {
          label: 'TechStack',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '<TechStack technologies={["${1:React}", "${2:TypeScript}", "${3:Next.js}"]} />',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Insert a technology stack component',
          range
        }
      ]
      
      return { suggestions }
    }
  })
}

/**
 * Initialize Monaco Editor with MDX support
 */
export async function initializeMonacoMDX() {
  if (typeof window === 'undefined') return
  
  const monaco = await import('monaco-editor')
  configureMDXLanguage(monaco)
  registerMDXCompletionProvider(monaco)
}

/**
 * Theme configurations
 */
export const themes = {
  dark: 'vs-dark',
  light: 'vs-light',
  'high-contrast': 'hc-black'
} as const

export type ThemeOption = keyof typeof themes