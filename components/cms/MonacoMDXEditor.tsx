"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  defaultEditorConfig,
  themes,
  type ThemeOption,
} from "@/lib/monaco-config";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center p-4 text-center">
      Loading Monaco Editor...
    </div>
  ),
});

// Dynamically import monaco-editor only on client side
const getMonaco = () => {
  if (typeof window !== "undefined") {
    return import("monaco-editor");
  }
  return null;
};
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Settings,
  Maximize2,
  Minimize2,
  Search,
  FileText,
  Code,
  ImageIcon,
  FolderOpen,
} from "lucide-react";

export interface MonacoMDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  height?: string | number;
  readOnly?: boolean;
  showToolbar?: boolean;
  showMinimap?: boolean;
  theme?: ThemeOption;
  onThemeChange?: (theme: ThemeOption) => void;
  className?: string;
}

export interface EditorActions {
  formatDocument: () => void;
  findAndReplace: () => void;
  insertComponent: (component: string) => void;
  undo: () => void;
  redo: () => void;
  save: () => void;
}

export const MonacoMDXEditor: React.FC<MonacoMDXEditorProps> = ({
  value,
  onChange,
  onSave,
  height = "600px",
  readOnly = false,
  showToolbar = true,
  showMinimap = true,
  theme = "dark",
  onThemeChange,
  className = "",
}) => {
  const editorRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(theme);
  const [minimapEnabled, setMinimapEnabled] = useState(showMinimap);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Initialize Monaco with MDX support
  useEffect(() => {
    const initMonaco = async () => {
      const monacoModule = await getMonaco();
      if (monacoModule) {
        const { initializeMonacoMDX } = await import("@/lib/monaco-config");
        initializeMonacoMDX();
      }
    };
    initMonaco();
  }, []);

  // Handle editor mount
  const handleEditorDidMount = useCallback(
    async (editor: any) => {
      editorRef.current = editor;
      setIsEditorReady(true);

      // Get monaco module for keyboard shortcuts
      const monacoModule = await getMonaco();
      if (!monacoModule) return;

      const monaco = monacoModule.default || monacoModule;

      // Set up keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave?.();
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        editor.getAction("actions.find")?.run();
      });

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
        () => {
          editor.getAction("editor.action.startFindReplaceAction")?.run();
        }
      );

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
        () => {
          editor.getAction("editor.action.quickCommand")?.run();
        }
      );

      // Auto-format on paste
      editor.onDidPaste(() => {
        setTimeout(() => {
          editor.getAction("editor.action.formatDocument")?.run();
        }, 100);
      });
    },
    [onSave]
  );

  // Editor actions
  const editorActions: EditorActions = {
    formatDocument: () => {
      editorRef.current?.getAction("editor.action.formatDocument")?.run();
    },
    findAndReplace: () => {
      editorRef.current
        ?.getAction("editor.action.startFindReplaceAction")
        ?.run();
    },
    insertComponent: async (component: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      const position = editor.getPosition();
      if (position) {
        const monacoModule = await getMonaco();
        if (monacoModule) {
          const monaco = monacoModule.default || monacoModule;
          editor.executeEdits("insert-component", [
            {
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
              text: component,
            },
          ]);
          editor.focus();
        }
      }
    },
    undo: () => {
      editorRef.current?.getAction("undo")?.run();
    },
    redo: () => {
      editorRef.current?.getAction("redo")?.run();
    },
    save: () => {
      onSave?.();
    },
  };

  // Handle theme change
  const handleThemeChange = (newTheme: ThemeOption) => {
    setCurrentTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  // Handle minimap toggle
  const handleMinimapToggle = (enabled: boolean) => {
    setMinimapEnabled(enabled);
    editorRef.current?.updateOptions({
      minimap: { enabled },
    });
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Insert component templates
  const insertCodeBlock = () => {
    editorActions.insertComponent(`
<CodeBlock language="javascript">
// Your code here
</CodeBlock>
`);
  };

  const insertImageGallery = () => {
    editorActions.insertComponent(`
<ImageGallery images={[
  {
    src: "/path/to/image.jpg",
    alt: "Image description",
    caption: "Optional caption"
  }
]} />
`);
  };

  const insertProjectCard = () => {
    editorActions.insertComponent(`
<ProjectCard
  title="Project Title"
  description="Project description"
  technologies={["React", "TypeScript"]}
  projectUrl="https://example.com"
  githubUrl="https://github.com/user/repo"
  image="/path/to/image.jpg"
/>
`);
  };

  const editorOptions: any = {
    ...defaultEditorConfig.options,
    readOnly,
    minimap: { enabled: minimapEnabled },
    theme: themes[currentTheme],
  };

  return (
    <div
      className={`flex flex-col ${className} ${
        isFullscreen ? "fixed inset-0 z-50 bg-background" : "relative"
      }`}
    >
      {showToolbar && (
        <div className="flex flex-col gap-3 border-b p-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-5 w-5" />
              MDX Editor
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={editorActions.save}
                disabled={!isEditorReady}
                title="Save (Ctrl+S)"
              >
                <Save className="mr-1.5 h-4 w-4" />
                Save
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={editorActions.formatDocument}
                disabled={!isEditorReady}
                title="Format document"
              >
                <Settings className="mr-1.5 h-4 w-4" />
                Format
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={editorActions.findAndReplace}
                disabled={!isEditorReady}
                title="Find & Replace (Ctrl+Shift+F)"
              >
                <Search className="mr-1.5 h-4 w-4" />
                Find
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Component insertion buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={insertCodeBlock}
                disabled={!isEditorReady}
                title="Insert code block"
              >
                <Code className="mr-1.5 h-4 w-4" />
                Code
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={insertImageGallery}
                disabled={!isEditorReady}
                title="Insert image gallery"
              >
                <ImageIcon className="mr-1.5 h-4 w-4" />
                Gallery
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={insertProjectCard}
                disabled={!isEditorReady}
                title="Insert project card"
              >
                <FolderOpen className="mr-1.5 h-4 w-4" />
                Project
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Settings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="theme-select" className="text-sm">
                  Theme
                </Label>
                <Select value={currentTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme-select" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="high-contrast">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="minimap-toggle"
                  checked={minimapEnabled}
                  onCheckedChange={handleMinimapToggle}
                />
                <Label htmlFor="minimap-toggle" className="text-sm">
                  Minimap
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex-grow">
        <Editor
          height={isFullscreen ? "calc(100vh - 110px)" : height}
          language="mdx"
          theme={themes[currentTheme]}
          value={value}
          onChange={(newValue) => onChange(newValue || "")}
          onMount={handleEditorDidMount}
          options={editorOptions}
          loading={
            <div className="flex h-full items-center justify-center">
              <div className="text-muted-foreground">Loading editor...</div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MonacoMDXEditor;