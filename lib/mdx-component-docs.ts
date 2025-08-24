import { ComponentMetadata } from "./types/mdx-components";

/**
 * Documentation and examples for all MDX components
 */
export const componentDocs: Record<string, ComponentMetadata> = {
  CodeBlock: {
    name: "CodeBlock",
    description: "带有语法高亮和复制功能的代码块组件",
    category: "content",
    props: {
      language: {
        type: "string",
        required: false,
        description: "代码语言，用于语法高亮",
        defaultValue: "text",
      },
      children: {
        type: "string",
        required: true,
        description: "要显示的代码内容",
      },
      className: {
        type: "string",
        required: false,
        description: "自定义CSS类名",
      },
    },
    examples: [
      {
        title: "基本用法",
        code: `<CodeBlock language="javascript">
console.log('Hello World');
const greeting = 'Hello MDX!';
</CodeBlock>`,
        description: "显示带有JavaScript语法高亮的代码块",
      },
      {
        title: "TypeScript代码",
        code: `<CodeBlock language="typescript">
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  age: 30
};
</CodeBlock>`,
        description: "显示TypeScript代码",
      },
    ],
  },

  ImageGallery: {
    name: "ImageGallery",
    description: "带有灯箱效果的图片画廊组件",
    category: "media",
    props: {
      images: {
        type: "Array<{src: string, alt: string, caption?: string}>",
        required: true,
        description: "图片数组，包含源地址、替代文本和可选标题",
      },
    },
    examples: [
      {
        title: "基本图片画廊",
        code: `<ImageGallery 
  images={[
    {
      src: '/images/project1.jpg',
      alt: '项目截图1',
      caption: '主页面设计'
    },
    {
      src: '/images/project2.jpg',
      alt: '项目截图2',
      caption: '用户界面'
    }
  ]}
/>`,
        description: "创建一个包含两张图片的画廊",
      },
    ],
  },

  ProjectCard: {
    name: "ProjectCard",
    description: "用于展示项目信息的卡片组件",
    category: "content",
    props: {
      title: {
        type: "string",
        required: true,
        description: "项目标题",
      },
      description: {
        type: "string",
        required: true,
        description: "项目描述",
      },
      technologies: {
        type: "string[]",
        required: true,
        description: "使用的技术栈",
      },
      projectUrl: {
        type: "string",
        required: false,
        description: "项目演示链接",
      },
      githubUrl: {
        type: "string",
        required: false,
        description: "GitHub仓库链接",
      },
      image: {
        type: "string",
        required: false,
        description: "项目预览图片",
      },
    },
    examples: [
      {
        title: "完整项目卡片",
        code: `<ProjectCard
  title="我的作品集网站"
  description="使用Next.js和TypeScript构建的现代化作品集网站"
  technologies={['Next.js', 'TypeScript', 'Tailwind CSS']}
  projectUrl="https://myportfolio.com"
  githubUrl="https://github.com/user/portfolio"
  image="/images/portfolio-preview.jpg"
/>`,
        description: "展示一个完整的项目卡片",
      },
    ],
  },

  Callout: {
    name: "Callout",
    description: "用于突出显示重要信息的提示框组件",
    category: "layout",
    props: {
      type: {
        type: "'info' | 'warning' | 'error' | 'success'",
        required: false,
        description: "提示框类型",
        defaultValue: "info",
      },
      title: {
        type: "string",
        required: false,
        description: "提示框标题",
      },
      children: {
        type: "ReactNode",
        required: true,
        description: "提示框内容",
      },
    },
    examples: [
      {
        title: "信息提示",
        code: `<Callout type="info" title="提示">
这是一个信息提示框，用于显示一般性信息。
</Callout>`,
        description: "显示蓝色的信息提示框",
      },
      {
        title: "警告提示",
        code: `<Callout type="warning" title="注意">
这是一个警告提示框，请注意相关事项。
</Callout>`,
        description: "显示黄色的警告提示框",
      },
    ],
  },

  TabsComponent: {
    name: "TabsComponent",
    description: "用于组织内容的标签页组件",
    category: "layout",
    props: {
      defaultValue: {
        type: "string",
        required: false,
        description: "默认激活的标签页",
      },
      children: {
        type: "ReactNode",
        required: true,
        description: "Tab组件的集合",
      },
    },
    examples: [
      {
        title: "基本标签页",
        code: `<TabsComponent defaultValue="tab1">
  <Tab value="tab1" label="介绍">
    这是第一个标签页的内容。
  </Tab>
  <Tab value="tab2" label="特性">
    这是第二个标签页的内容。
  </Tab>
</TabsComponent>`,
        description: "创建一个包含两个标签页的组件",
      },
    ],
  },

  Accordion: {
    name: "Accordion",
    description: "可折叠的手风琴组件",
    category: "layout",
    props: {
      items: {
        type: "Array<{title: string, content: ReactNode}>",
        required: true,
        description: "手风琴项目数组",
      },
      type: {
        type: "'single' | 'multiple'",
        required: false,
        description: "展开模式：单个或多个",
        defaultValue: "single",
      },
    },
    examples: [
      {
        title: "常见问题",
        code: `<Accordion 
  type="single"
  items={[
    {
      title: "什么是MDX？",
      content: "MDX是一种允许在Markdown中使用JSX的格式。"
    },
    {
      title: "如何使用组件？",
      content: "直接在MDX文件中使用组件标签即可。"
    }
  ]}
/>`,
        description: "创建一个FAQ风格的手风琴",
      },
    ],
  },

  FeatureGrid: {
    name: "FeatureGrid",
    description: "用于展示特性的网格布局组件",
    category: "layout",
    props: {
      features: {
        type: "Array<{title: string, description: string, icon?: ReactNode, link?: string}>",
        required: true,
        description: "特性数组",
      },
      columns: {
        type: "2 | 3 | 4",
        required: false,
        description: "网格列数",
        defaultValue: 3,
      },
    },
    examples: [
      {
        title: "产品特性展示",
        code: `<FeatureGrid 
  columns={3}
  features={[
    {
      title: "快速",
      description: "基于现代技术栈，性能优异",
      icon: "⚡"
    },
    {
      title: "安全",
      description: "内置安全防护机制",
      icon: "🔒"
    },
    {
      title: "易用",
      description: "简洁直观的用户界面",
      icon: "🎯"
    }
  ]}
/>`,
        description: "展示产品的主要特性",
      },
    ],
  },

  Timeline: {
    name: "Timeline",
    description: "时间线组件，用于展示时间序列事件",
    category: "data",
    props: {
      items: {
        type: "Array<{date: string, title: string, description: string, icon?: ReactNode}>",
        required: true,
        description: "时间线项目数组",
      },
    },
    examples: [
      {
        title: "项目进度",
        code: `<Timeline 
  items={[
    {
      date: "2024-01",
      title: "项目启动",
      description: "完成需求分析和技术选型"
    },
    {
      date: "2024-02",
      title: "开发阶段",
      description: "核心功能开发完成"
    },
    {
      date: "2024-03",
      title: "测试上线",
      description: "完成测试并正式上线"
    }
  ]}
/>`,
        description: "展示项目的时间线",
      },
    ],
  },

  Stats: {
    name: "Stats",
    description: "统计数据展示组件",
    category: "data",
    props: {
      stats: {
        type: "Array<{label: string, value: string | number, description?: string}>",
        required: true,
        description: "统计数据数组",
      },
    },
    examples: [
      {
        title: "网站统计",
        code: `<Stats 
  stats={[
    {
      label: "用户数量",
      value: "10,000+",
      description: "活跃用户"
    },
    {
      label: "项目数量",
      value: 50,
      description: "已完成项目"
    },
    {
      label: "满意度",
      value: "98%",
      description: "客户满意度"
    }
  ]}
/>`,
        description: "展示网站的关键统计数据",
      },
    ],
  },
};

/**
 * Get component documentation by name
 */
export function getComponentDoc(name: string): ComponentMetadata | undefined {
  return componentDocs[name];
}

/**
 * Get all component names
 */
export function getComponentNames(): string[] {
  return Object.keys(componentDocs);
}

/**
 * Get components by category
 */
export function getComponentsByCategory(
  category: ComponentMetadata["category"]
): ComponentMetadata[] {
  return Object.values(componentDocs).filter(
    (doc) => doc.category === category
  );
}

/**
 * Search components by name or description
 */
export function searchComponents(query: string): ComponentMetadata[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(componentDocs).filter(
    (doc) =>
      doc.name.toLowerCase().includes(lowercaseQuery) ||
      doc.description.toLowerCase().includes(lowercaseQuery)
  );
}
