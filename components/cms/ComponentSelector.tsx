"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Code2,
  Image,
  Folder,
  FileText,
  Layout,
  Palette,
  Quote,
  List,
  Hash,
  Link,
  Table,
  Video,
  Search,
  Settings,
  Plus,
  X,
  Copy,
  Check,
} from "lucide-react";

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  template: string;
  insertText: string;
  configurable?: boolean;
  parameters?: ComponentParameter[];
}

export interface ComponentParameter {
  name: string;
  type: "text" | "textarea" | "select" | "boolean" | "number" | "array";
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface ComponentSelectorProps {
  onInsertComponent: (template: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

const componentTemplates: ComponentTemplate[] = [
  // Layout Components
  {
    id: "codeblock",
    name: "Code Block",
    description: "Syntax highlighted code block",
    icon: <Code2 className="h-4 w-4" />,
    category: "Layout",
    template: "CodeBlock",
    configurable: true,
    parameters: [
      {
        name: "language",
        type: "select",
        label: "Programming Language",
        required: true,
        defaultValue: "javascript",
        options: [
          { label: "JavaScript", value: "javascript" },
          { label: "TypeScript", value: "typescript" },
          { label: "Python", value: "python" },
          { label: "Java", value: "java" },
          { label: "C++", value: "cpp" },
          { label: "Rust", value: "rust" },
          { label: "Go", value: "go" },
          { label: "HTML", value: "html" },
          { label: "CSS", value: "css" },
          { label: "JSON", value: "json" },
          { label: "Markdown", value: "markdown" },
          { label: "Bash", value: "bash" },
        ],
      },
      {
        name: "code",
        type: "textarea",
        label: "Code Content",
        required: true,
        defaultValue: '// Your code here\nconsole.log("Hello, World!")',
        placeholder: "Enter your code...",
      },
      {
        name: "showLineNumbers",
        type: "boolean",
        label: "Show Line Numbers",
        defaultValue: true,
      },
      {
        name: "title",
        type: "text",
        label: "Title (Optional)",
        placeholder: "Optional title for the code block",
      },
    ],
    insertText: `<CodeBlock language="{language}" {showLineNumbers ? 'showLineNumbers' : ''} {title ? \`title="\${title}"\` : ''}>
{code}
</CodeBlock>`,
  },
  {
    id: "image-gallery",
    name: "Image Gallery",
    description: "Responsive image gallery with lightbox",
    icon: <Image className="h-4 w-4" />,
    category: "Layout",
    template: "ImageGallery",
    configurable: true,
    parameters: [
      {
        name: "images",
        type: "array",
        label: "Images",
        required: true,
        defaultValue: [
          { src: "/images/example1.jpg", alt: "Example 1", caption: "" },
          { src: "/images/example2.jpg", alt: "Example 2", caption: "" },
        ],
      },
      {
        name: "columns",
        type: "select",
        label: "Columns",
        defaultValue: "auto",
        options: [
          { label: "Auto", value: "auto" },
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
      },
    ],
    insertText: `<ImageGallery images={[
  {
    src: "/images/example1.jpg",
    alt: "Example image 1",
    caption: "Optional caption"
  },
  {
    src: "/images/example2.jpg", 
    alt: "Example image 2",
    caption: "Another caption"
  }
]} {columns !== 'auto' ? \`columns=\${columns}\` : ''} />`,
  },
  {
    id: "project-card",
    name: "Project Card",
    description: "Showcase project with details and links",
    icon: <Folder className="h-4 w-4" />,
    category: "Layout",
    template: "ProjectCard",
    configurable: true,
    parameters: [
      {
        name: "title",
        type: "text",
        label: "Project Title",
        required: true,
        defaultValue: "My Awesome Project",
      },
      {
        name: "description",
        type: "textarea",
        label: "Description",
        required: true,
        defaultValue: "Brief description of your project and its key features.",
      },
      {
        name: "technologies",
        type: "array",
        label: "Technologies",
        required: true,
        defaultValue: ["React", "TypeScript", "Next.js"],
      },
      {
        name: "projectUrl",
        type: "text",
        label: "Project URL",
        placeholder: "https://example.com",
      },
      {
        name: "githubUrl",
        type: "text",
        label: "GitHub URL",
        placeholder: "https://github.com/username/repo",
      },
      {
        name: "image",
        type: "text",
        label: "Image URL",
        placeholder: "/images/project-screenshot.jpg",
      },
    ],
    insertText: `<ProjectCard
  title="{title}"
  description="{description}"
  technologies={[{technologies}]}
  {projectUrl ? 'projectUrl="{projectUrl}"' : ''}
  {githubUrl ? 'githubUrl="{githubUrl}"' : ''}
  {image ? 'image="{image}"' : ''}
/>`,
  },
  {
    id: "tech-stack",
    name: "Tech Stack",
    description: "Display technology stack with icons",
    icon: <Layout className="h-4 w-4" />,
    category: "Layout",
    template: "TechStack",
    configurable: true,
    parameters: [
      {
        name: "technologies",
        type: "array",
        label: "Technologies",
        required: true,
        defaultValue: [
          "React",
          "TypeScript",
          "Next.js",
          "Tailwind CSS",
          "Node.js",
        ],
      },
      {
        name: "showLabels",
        type: "boolean",
        label: "Show Labels",
        defaultValue: true,
      },
    ],
    insertText: `<TechStack technologies={[{technologies}]} {!showLabels ? 'hideLabels' : ''} />`,
  },

  // Content Components
  {
    id: "callout",
    name: "Callout",
    description: "Highlighted information box",
    icon: <Quote className="h-4 w-4" />,
    category: "Content",
    template: "Callout",
    configurable: true,
    parameters: [
      {
        name: "type",
        type: "select",
        label: "Type",
        required: true,
        defaultValue: "info",
        options: [
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" },
          { label: "Success", value: "success" },
        ],
      },
      {
        name: "title",
        type: "text",
        label: "Title (Optional)",
        placeholder: "Optional title",
      },
      {
        name: "content",
        type: "textarea",
        label: "Content",
        required: true,
        defaultValue: "This is an important note or tip for readers.",
      },
    ],
    insertText: `<Callout type="{type}" {title ? \`title="\${title}"\` : ''}>
{content}
</Callout>`,
  },
  {
    id: "tabs",
    name: "Tabs",
    description: "Tabbed content sections",
    icon: <FileText className="h-4 w-4" />,
    category: "Content",
    template: "Tabs",
    configurable: true,
    parameters: [
      {
        name: "tabs",
        type: "array",
        label: "Tabs",
        required: true,
        defaultValue: [
          { label: "Tab 1", value: "tab1", content: "Content for tab 1" },
          { label: "Tab 2", value: "tab2", content: "Content for tab 2" },
        ],
      },
    ],
    insertText: `<Tabs defaultValue="{tabs[0]?.value}">
  <TabsList>
    {tabs.map(tab => \`<TabsTrigger value="\${tab.value}">\${tab.label}</TabsTrigger>\`).join('\n    ')}
  </TabsList>
  {tabs.map(tab => \`<TabsContent value="\${tab.value}">\n    \${tab.content}\n  </TabsContent>\`).join('\n  ')}
</Tabs>`,
  },

  // Markdown Elements
  {
    id: "heading",
    name: "Heading",
    description: "Section heading",
    icon: <Hash className="h-4 w-4" />,
    category: "Markdown",
    template: "Heading",
    configurable: true,
    parameters: [
      {
        name: "level",
        type: "select",
        label: "Heading Level",
        required: true,
        defaultValue: "2",
        options: [
          { label: "H1", value: "1" },
          { label: "H2", value: "2" },
          { label: "H3", value: "3" },
          { label: "H4", value: "4" },
          { label: "H5", value: "5" },
          { label: "H6", value: "6" },
        ],
      },
      {
        name: "text",
        type: "text",
        label: "Heading Text",
        required: true,
        defaultValue: "Your Heading Here",
      },
    ],
    insertText: `${"#".repeat(parseInt("{level}"))} {text}`,
  },
  {
    id: "list",
    name: "List",
    description: "Bulleted or numbered list",
    icon: <List className="h-4 w-4" />,
    category: "Markdown",
    template: "List",
    configurable: true,
    parameters: [
      {
        name: "type",
        type: "select",
        label: "List Type",
        required: true,
        defaultValue: "unordered",
        options: [
          { label: "Bulleted (Unordered)", value: "unordered" },
          { label: "Numbered (Ordered)", value: "ordered" },
        ],
      },
      {
        name: "items",
        type: "array",
        label: "List Items",
        required: true,
        defaultValue: ["First item", "Second item", "Third item"],
      },
    ],
    insertText: `{type === 'ordered' ? items.map((item, i) => \`\${i + 1}. \${item}\`).join('\n') : items.map(item => \`- \${item}\`).join('\n')}`,
  },
  {
    id: "link",
    name: "Link",
    description: "External or internal link",
    icon: <Link className="h-4 w-4" />,
    category: "Markdown",
    template: "Link",
    configurable: true,
    parameters: [
      {
        name: "text",
        type: "text",
        label: "Link Text",
        required: true,
        defaultValue: "Link text",
      },
      {
        name: "url",
        type: "text",
        label: "URL",
        required: true,
        defaultValue: "https://example.com",
      },
    ],
    insertText: `[{text}]({url})`,
  },
  {
    id: "table",
    name: "Table",
    description: "Data table with headers",
    icon: <Table className="h-4 w-4" />,
    category: "Markdown",
    template: "Table",
    configurable: true,
    parameters: [
      {
        name: "headers",
        type: "array",
        label: "Table Headers",
        required: true,
        defaultValue: ["Column 1", "Column 2", "Column 3"],
      },
      {
        name: "rows",
        type: "array",
        label: "Table Rows",
        required: true,
        defaultValue: [
          ["Row 1", "Data", "Data"],
          ["Row 2", "Data", "Data"],
        ],
      },
    ],
    insertText: `| {headers.join(' | ')} |
|{headers.map(() => '----------').join('|')}|
{rows.map(row => \`| \${row.join(' | ')} |\`).join('\n')}`,
  },
  {
    id: "blockquote",
    name: "Blockquote",
    description: "Quoted text or citation",
    icon: <Quote className="h-4 w-4" />,
    category: "Markdown",
    template: "Blockquote",
    configurable: true,
    parameters: [
      {
        name: "content",
        type: "textarea",
        label: "Quote Content",
        required: true,
        defaultValue:
          "This is a blockquote. It can span multiple lines and is great for highlighting important quotes or citations.",
      },
      {
        name: "author",
        type: "text",
        label: "Author (Optional)",
        placeholder: "Quote author",
      },
    ],
    insertText: `> {content.split('\n').join('\n> ')}{author ? \`\n> \n> — \${author}\` : ''}`,
  },
];

const categories = Array.from(
  new Set(componentTemplates.map((t) => t.category))
);

export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  onInsertComponent,
  trigger,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ComponentTemplate | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    {}
  );
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return componentTemplates;

    const query = searchQuery.toLowerCase();
    return componentTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group filtered templates by category
  const groupedTemplates = useMemo(() => {
    return categories.reduce(
      (acc, category) => {
        const templates = filteredTemplates.filter(
          (t) => t.category === category
        );
        if (templates.length > 0) {
          acc[category] = templates;
        }
        return acc;
      },
      {} as Record<string, ComponentTemplate[]>
    );
  }, [filteredTemplates]);

  const handleTemplateSelect = useCallback(
    (template: ComponentTemplate) => {
      if (template.configurable && template.parameters) {
        // Initialize parameter values with defaults
        const defaultValues = template.parameters.reduce(
          (acc, param) => {
            acc[param.name] = param.defaultValue;
            return acc;
          },
          {} as Record<string, any>
        );

        setParameterValues(defaultValues);
        setSelectedTemplate(template);
        setConfigDialogOpen(true);
        setOpen(false);
      } else {
        onInsertComponent(template.insertText);
        setOpen(false);
      }
    },
    [onInsertComponent]
  );

  const handleConfiguredInsert = useCallback(() => {
    if (!selectedTemplate) return;

    let insertText = selectedTemplate.insertText;

    // Replace template variables with actual values
    Object.entries(parameterValues).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, "g");

      if (Array.isArray(value)) {
        if (key === "technologies" || key === "items" || key === "headers") {
          insertText = insertText.replace(
            regex,
            value.map((v) => `"${v}"`).join(", ")
          );
        } else if (key === "images") {
          const imagesStr = value
            .map(
              (img) =>
                `{\n    src: "${img.src}",\n    alt: "${img.alt}",\n    caption: "${img.caption}"\n  }`
            )
            .join(",\n  ");
          insertText = insertText.replace(regex, imagesStr);
        } else if (key === "tabs") {
          const tabsList = value
            .map(
              (tab) =>
                `<TabsTrigger value="${tab.value}">${tab.label}</TabsTrigger>`
            )
            .join("\n    ");
          const tabsContent = value
            .map(
              (tab) =>
                `<TabsContent value="${tab.value}">\n    ${tab.content}\n  </TabsContent>`
            )
            .join("\n  ");
          insertText = insertText.replace(
            /\{tabs\.map.*?\).join.*?\}/g,
            tabsList
          );
          insertText = insertText.replace(
            /\{tabs\.map.*?TabsContent.*?\).join.*?\}/g,
            tabsContent
          );
        }
      } else {
        insertText = insertText.replace(regex, String(value));
      }
    });

    // Handle conditional attributes
    insertText = insertText.replace(
      /\{([^}]+)\s*\?\s*([^:]+)\s*:\s*''\}/g,
      (match, condition, attribute) => {
        const conditionResult = eval(
          condition.replace(/(\w+)/g, (varName: string) => {
            const value = parameterValues[varName];
            return typeof value === "boolean" ? value : `"${value}"`;
          })
        );
        return conditionResult ? attribute.replace(/`([^`]+)`/g, "$1") : "";
      }
    );

    onInsertComponent(insertText);
    setConfigDialogOpen(false);
    setSelectedTemplate(null);
  }, [selectedTemplate, parameterValues, onInsertComponent]);

  const copyTemplate = useCallback(async (template: string) => {
    try {
      await navigator.clipboard.writeText(template);
      setCopiedTemplate(template);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (error) {
      console.error("Failed to copy template:", error);
    }
  }, []);

  const defaultTrigger = (
    <Button variant="outline" className="w-full">
      <Palette className="h-4 w-4 mr-2" />
      Insert Component
    </Button>
  );

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search components..." />
          <CommandList>
            <CommandEmpty>No components found.</CommandEmpty>

            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <React.Fragment key={category}>
                <CommandGroup heading={category}>
                  {templates.map((template) => (
                    <CommandItem
                      key={template.id}
                      onSelect={() => handleTemplateSelect(template)}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="flex-shrink-0">{template.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                      {template.configurable && (
                        <Badge variant="secondary" className="text-xs">
                          <Settings className="h-3 w-3 mr-1" />
                          Config
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>

      {/* Configuration Dialog */}
      {selectedTemplate && (
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTemplate.icon}
                Configure {selectedTemplate.name}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                {selectedTemplate.parameters?.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name}>
                      {param.label}
                      {param.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>

                    {param.description && (
                      <p className="text-sm text-muted-foreground">
                        {param.description}
                      </p>
                    )}

                    {param.type === "text" && (
                      <Input
                        id={param.name}
                        value={parameterValues[param.name] || ""}
                        onChange={(e) =>
                          setParameterValues((prev) => ({
                            ...prev,
                            [param.name]: e.target.value,
                          }))
                        }
                        placeholder={param.placeholder}
                      />
                    )}

                    {param.type === "textarea" && (
                      <Textarea
                        id={param.name}
                        value={parameterValues[param.name] || ""}
                        onChange={(e) =>
                          setParameterValues((prev) => ({
                            ...prev,
                            [param.name]: e.target.value,
                          }))
                        }
                        placeholder={param.placeholder}
                        rows={4}
                      />
                    )}

                    {param.type === "select" && (
                      <Select
                        value={
                          parameterValues[param.name] || param.defaultValue
                        }
                        onValueChange={(value) =>
                          setParameterValues((prev) => ({
                            ...prev,
                            [param.name]: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {param.type === "boolean" && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={param.name}
                          checked={
                            parameterValues[param.name] ?? param.defaultValue
                          }
                          onCheckedChange={(checked) =>
                            setParameterValues((prev) => ({
                              ...prev,
                              [param.name]: checked,
                            }))
                          }
                        />
                        <Label htmlFor={param.name}>{param.label}</Label>
                      </div>
                    )}

                    {param.type === "number" && (
                      <Input
                        id={param.name}
                        type="number"
                        value={parameterValues[param.name] || ""}
                        onChange={(e) =>
                          setParameterValues((prev) => ({
                            ...prev,
                            [param.name]: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    )}

                    {param.type === "array" && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {(
                            parameterValues[param.name] ||
                            param.defaultValue ||
                            []
                          ).map((item: any, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {typeof item === "string"
                                ? item
                                : item.label ||
                                  item.src ||
                                  JSON.stringify(item)}
                              <button
                                onClick={() => {
                                  const newArray = [
                                    ...(parameterValues[param.name] ||
                                      param.defaultValue ||
                                      []),
                                  ];
                                  newArray.splice(index, 1);
                                  setParameterValues((prev) => ({
                                    ...prev,
                                    [param.name]: newArray,
                                  }));
                                }}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          This is a simplified array editor. You can modify the
                          values after insertion.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => copyTemplate(selectedTemplate.insertText)}
              >
                {copiedTemplate === selectedTemplate.insertText ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfigDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfiguredInsert}>
                  Insert Component
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Trigger */}
      <div className={className} onClick={() => setOpen(true)}>
        {trigger || defaultTrigger}
      </div>
    </>
  );
};

export default ComponentSelector;
