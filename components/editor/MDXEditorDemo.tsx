'use client';

import { useState } from 'react';
import { MDXEditor } from './MDXEditor';

const DEMO_CONTENT = `---
title: "示例文章"
description: "这是一个MDX编辑器的示例"
publishedAt: "2024-01-01"
tags: ["mdx", "editor", "demo"]
featured: true
---

# MDX 编辑器示例

这是一个功能完整的 **MDX 编辑器**，支持以下特性：

## 基础 Markdown 语法

### 文本格式
- **粗体文本**
- *斜体文本*
- ~~删除线~~
- \`行内代码\`

### 列表
1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项 A
- 无序列表项 B
- 无序列表项 C

### 引用
> 这是一个引用块
> 可以包含多行内容

### 代码块
\`\`\`javascript
function hello() {
  console.log('Hello, MDX Editor!');
}

hello();
\`\`\`

### 表格
| 功能 | 状态 | 描述 |
| --- | --- | --- |
| 语法高亮 | ✅ | 支持 MDX 语法高亮 |
| 自动补全 | ✅ | 智能代码补全 |
| 快捷键 | ✅ | 丰富的快捷键支持 |
| 自动保存 | ✅ | 防止数据丢失 |

---

## MDX 特性

### React 组件
<Image 
  id="demo-image"
  alt="示例图片"
  width={800}
  height={600}
/>

<Callout type="info">
这是一个信息提示框组件
</Callout>

<CodeBlock language="typescript">
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};
</CodeBlock>

### JavaScript 表达式
当前时间：{new Date().toLocaleString()}

### 导入和导出
\`\`\`javascript
import { useState } from 'react';
export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

## 快捷键说明

| 快捷键 | 功能 |
| --- | --- |
| \`Ctrl+S\` | 保存文档 |
| \`Ctrl+B\` | 粗体 |
| \`Ctrl+I\` | 斜体 |
| \`Ctrl+K\` | 插入链接 |
| \`Ctrl+\\\`\` | 行内代码 |
| \`Ctrl+Shift+C\` | 代码块 |
| \`Shift+Alt+F\` | 格式化文档 |
| \`Tab\` | 缩进 |
| \`Shift+Tab\` | 取消缩进 |

试试这些快捷键吧！`;

export function MDXEditorDemo() {
  const [content, setContent] = useState(DEMO_CONTENT);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('保存内容:', content);
    alert('内容已保存！（这只是一个演示）');
    
    setIsSaving(false);
  };

  const handleChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          MDX 编辑器演示
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          这是一个功能完整的 MDX 编辑器，支持语法高亮、自动补全、快捷键和自动保存。
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <MDXEditor
          initialContent={content}
          onChange={handleChange}
          onSave={handleSave}
          isLoading={isSaving}
          height="70vh"
          autoSaveDelay={3000}
          className="w-full"
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">使用说明：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>编辑器支持完整的 MDX 语法，包括 Markdown 和 React 组件</li>
          <li>使用工具栏按钮或快捷键快速插入格式</li>
          <li>内容会自动保存，防止数据丢失</li>
          <li>支持代码高亮和智能补全</li>
          <li>可以通过 Ctrl+S 手动保存</li>
        </ul>
      </div>
    </div>
  );
}