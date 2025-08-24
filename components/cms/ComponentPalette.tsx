'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  Video
} from 'lucide-react'

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  template: string
  insertText: string
}

export interface ComponentPaletteProps {
  onInsertComponent: (template: string) => void
  className?: string
}

const componentTemplates: ComponentTemplate[] = [
  // Layout Components
  {
    id: 'codeblock',
    name: 'Code Block',
    description: 'Syntax highlighted code block',
    icon: <Code2 className="h-4 w-4" />,
    category: 'Layout',
    template: 'CodeBlock',
    insertText: `<CodeBlock language="javascript">
// Your code here
console.log('Hello, World!')
</CodeBlock>`
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    description: 'Responsive image gallery with lightbox',
    icon: <Image className="h-4 w-4" />,
    category: 'Layout',
    template: 'ImageGallery',
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
]} />`
  },
  {
    id: 'project-card',
    name: 'Project Card',
    description: 'Showcase project with details and links',
    icon: <Folder className="h-4 w-4" />,
    category: 'Layout',
    template: 'ProjectCard',
    insertText: `<ProjectCard
  title="Project Title"
  description="Brief description of your project and its key features."
  technologies={["React", "TypeScript", "Next.js"]}
  projectUrl="https://example.com"
  githubUrl="https://github.com/username/repo"
  image="/images/project-screenshot.jpg"
/>`
  },
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    description: 'Display technology stack with icons',
    icon: <Layout className="h-4 w-4" />,
    category: 'Layout',
    template: 'TechStack',
    insertText: `<TechStack technologies={[
  "React",
  "TypeScript", 
  "Next.js",
  "Tailwind CSS",
  "Node.js"
]} />`
  },
  
  // Content Components
  {
    id: 'callout',
    name: 'Callout',
    description: 'Highlighted information box',
    icon: <Quote className="h-4 w-4" />,
    category: 'Content',
    template: 'Callout',
    insertText: `<Callout type="info">
This is an important note or tip for readers.
</Callout>`
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Tabbed content sections',
    icon: <FileText className="h-4 w-4" />,
    category: 'Content',
    template: 'Tabs',
    insertText: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab2">
    Content for tab 2
  </TabsContent>
</Tabs>`
  },
  
  // Markdown Elements
  {
    id: 'heading',
    name: 'Heading',
    description: 'Section heading',
    icon: <Hash className="h-4 w-4" />,
    category: 'Markdown',
    template: 'Heading',
    insertText: `## Your Heading Here`
  },
  {
    id: 'list',
    name: 'List',
    description: 'Bulleted or numbered list',
    icon: <List className="h-4 w-4" />,
    category: 'Markdown',
    template: 'List',
    insertText: `- First item
- Second item
- Third item`
  },
  {
    id: 'link',
    name: 'Link',
    description: 'External or internal link',
    icon: <Link className="h-4 w-4" />,
    category: 'Markdown',
    template: 'Link',
    insertText: `[Link text](https://example.com)`
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Data table with headers',
    icon: <Table className="h-4 w-4" />,
    category: 'Markdown',
    template: 'Table',
    insertText: `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`
  },
  {
    id: 'blockquote',
    name: 'Blockquote',
    description: 'Quoted text or citation',
    icon: <Quote className="h-4 w-4" />,
    category: 'Markdown',
    template: 'Blockquote',
    insertText: `> This is a blockquote. It can span multiple lines
> and is great for highlighting important quotes or citations.`
  }
]

const categories = Array.from(new Set(componentTemplates.map(t => t.category)))

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  onInsertComponent,
  className = ''
}) => {
  const handleInsertComponent = (template: ComponentTemplate) => {
    onInsertComponent(template.insertText)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Component Palette
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  {category}
                </h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {componentTemplates
                    .filter(template => template.category === category)
                    .map((template) => (
                      <Button
                        key={template.id}
                        variant="ghost"
                        className="h-auto p-3 justify-start text-left"
                        onClick={() => handleInsertComponent(template)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            {template.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {template.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {template.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
                
                {category !== categories[categories.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default ComponentPalette