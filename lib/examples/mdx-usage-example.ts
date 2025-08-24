/**
 * MDX 处理系统使用示例
 * 展示如何使用我们实现的 MDX 处理核心服务
 */

import { 
  MDXProcessor, 
  validateMDX, 
  processMDX, 
  extractFrontmatter,
  createMDXProcessor,
  getDefaultProcessor 
} from '../mdx';
import { MDXErrorHandler, safeMDXProcess } from '../mdx-error-handler';
import { getMDXConfig } from '../mdx-config';

// 示例 MDX 内容
const sampleMDXContent = `---
title: "我的第一篇博客文章"
author: "张三"
publishedAt: "2024-01-15"
tags: ["技术", "MDX", "React"]
---

# 欢迎使用 MDX

这是一篇使用 **MDX** 格式编写的文章，支持 Markdown 语法和 React 组件。

## 代码示例

<CodeBlock language="javascript">
const greeting = "Hello, MDX!";
console.log(greeting);
</CodeBlock>

## 技术栈展示

<TechStack technologies={["React", "Next.js", "TypeScript", "MDX"]} />

## 项目卡片

<ProjectCard 
  title="我的项目"
  description="这是一个很棒的项目"
  technologies={["React", "Node.js"]}
  projectUrl="https://example.com"
  githubUrl="https://github.com/example/project"
/>

## 图片画廊

<ImageGallery images={[
  { src: "/image1.jpg", alt: "图片1", caption: "美丽的风景" },
  { src: "/image2.jpg", alt: "图片2", caption: "城市夜景" }
]} />

这就是 MDX 的强大之处！
`;

// 包含安全问题的示例内容
const unsafeMDXContent = `---
title: "不安全的内容"
---

# 危险内容示例

<script>alert('XSS攻击!');</script>

[点击这里](javascript:alert('危险链接'))

<div onclick="alert('事件处理器')">点击我</div>
`;

/**
 * 基本使用示例
 */
export async function basicUsageExample() {
  console.log('=== 基本使用示例 ===\n');

  // 1. 提取 frontmatter
  console.log('1. 提取 frontmatter:');
  const frontmatter = extractFrontmatter(sampleMDXContent);
  console.log(JSON.stringify(frontmatter, null, 2));

  // 2. 使用默认处理器编译 MDX
  console.log('\n2. 编译 MDX 内容:');
  try {
    const result = await processMDX(sampleMDXContent);
    console.log('✅ 编译成功');
    console.log(`   - 标题: ${result.frontmatter.title}`);
    console.log(`   - 作者: ${result.frontmatter.author}`);
    console.log(`   - 内容长度: ${result.content.length} 字符`);
    if (result.readingTime) {
      console.log(`   - 阅读时间: ${result.readingTime.text}`);
    }
  } catch (error) {
    console.error('❌ 编译失败:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * 自定义处理器示例
 */
export async function customProcessorExample() {
  console.log('\n=== 自定义处理器示例 ===\n');

  // 创建自定义处理器
  const processor = createMDXProcessor();

  // 注册自定义组件
  console.log('1. 注册自定义组件:');
  processor.registerComponent({
    name: 'CustomAlert',
    component: ({ type, children }: { type: string; children: string }) => null,
    description: '自定义警告组件',
    allowedProps: ['type', 'children']
  });

  const components = processor.getRegisteredComponents();
  console.log(`✅ 已注册 ${components.length} 个组件`);
  components.forEach(comp => {
    console.log(`   - ${comp.name}: ${comp.description}`);
  });

  // 使用自定义配置编译
  console.log('\n2. 使用自定义配置编译:');
  const customContent = `# 测试\n\n<CustomAlert type="info">这是一个自定义组件</CustomAlert>`;
  
  try {
    const result = await processor.compile(customContent, {
      sanitizeContent: true,
      enableSyntaxHighlighting: true
    });
    console.log('✅ 自定义编译成功');
  } catch (error) {
    console.error('❌ 自定义编译失败:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * 验证功能示例
 */
export async function validationExample() {
  console.log('\n=== 验证功能示例 ===\n');

  const processor = getDefaultProcessor();

  // 验证正常内容
  console.log('1. 验证正常内容:');
  const validResult = await validateMDX(sampleMDXContent, processor);
  console.log(`✅ 验证结果: ${validResult.isValid ? '通过' : '失败'}`);
  if (validResult.warnings.length > 0) {
    console.log('⚠️  警告:');
    validResult.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  // 验证不安全内容
  console.log('\n2. 验证不安全内容:');
  const unsafeResult = await validateMDX(unsafeMDXContent, processor);
  console.log(`❌ 验证结果: ${unsafeResult.isValid ? '通过' : '失败'}`);
  if (unsafeResult.errors.length > 0) {
    console.log('🚨 发现安全问题:');
    unsafeResult.errors.forEach(error => {
      console.log(`   - ${error.type}: ${error.message}`);
      if (error.suggestion) {
        console.log(`     建议: ${error.suggestion}`);
      }
    });
  }
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  console.log('\n=== 错误处理示例 ===\n');

  // 使用安全处理函数
  console.log('1. 安全处理正常内容:');
  const safeResult = await safeMDXProcess(async () => {
    return await processMDX(sampleMDXContent);
  });

  if (safeResult.success) {
    console.log('✅ 安全处理成功');
    console.log(`   标题: ${safeResult.data.frontmatter.title}`);
  } else {
    console.log('❌ 安全处理失败:', safeResult.error);
  }

  // 处理错误内容
  console.log('\n2. 处理包含错误的内容:');
  const errorContent = `# 测试\n\n<UnknownComponent />`;
  
  const errorResult = await safeMDXProcess(async () => {
    const processor = createMDXProcessor();
    return await processor.compile(errorContent);
  });

  if (!errorResult.success) {
    console.log('❌ 预期的错误处理:', errorResult.error);
  }
}

/**
 * 配置管理示例
 */
export function configurationExample() {
  console.log('\n=== 配置管理示例 ===\n');

  // 获取不同环境的配置
  console.log('1. 环境配置:');
  const devConfig = getMDXConfig('development');
  const prodConfig = getMDXConfig('production');

  console.log('开发环境配置:');
  console.log(`   - 内容清理: ${devConfig.sanitizeContent}`);
  console.log(`   - 语法高亮: ${devConfig.enableSyntaxHighlighting}`);

  console.log('生产环境配置:');
  console.log(`   - 内容清理: ${prodConfig.sanitizeContent}`);
  console.log(`   - 语法高亮: ${prodConfig.enableSyntaxHighlighting}`);
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 MDX 处理系统使用示例\n');
  
  await basicUsageExample();
  await customProcessorExample();
  await validationExample();
  await errorHandlingExample();
  configurationExample();
  
  console.log('\n🎉 所有示例运行完成！');
  console.log('\n📚 更多功能:');
  console.log('   • 组件注册和管理');
  console.log('   • 内容安全验证');
  console.log('   • 语法错误检测');
  console.log('   • 性能优化配置');
  console.log('   • 灵活的错误处理');
}

// 如果直接运行此文件，执行所有示例
if (typeof window === 'undefined' && require.main === module) {
  runAllExamples().catch(console.error);
}