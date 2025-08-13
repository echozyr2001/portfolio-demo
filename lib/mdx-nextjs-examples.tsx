/**
 * Next.js MDX 集成示例
 * 基于 Shiki 官方 Next.js 集成文档
 */

import { MDXRemote } from "next-mdx-remote";
import { mdxProcessor } from "./mdx-processor";
import { codeToHtml, codeToHast } from "shiki";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import type { JSX } from "react";
import type { BundledLanguage } from "shiki";

/**
 * 服务器组件示例 - 使用 MDX Processor
 */
export async function ServerMDXExample({ mdxContent }: { mdxContent: string }) {
	// 使用我们的 MDX 处理器进行完整处理
	const result = await mdxProcessor.serialize(mdxContent, {
		enableCodeHighlight: true,
		shikiTheme: "github-dark",
	});

	return (
		<article className="prose prose-invert max-w-none">
			<div className="mb-4 text-sm text-gray-400">
				<span>阅读时间: {result.readingTime} 分钟</span>
				<span className="mx-2">•</span>
				<span>字数: {result.wordCount}</span>
			</div>

			<div className="mb-6 text-gray-300">{result.excerpt}</div>

			<MDXRemote {...result.mdxSource} components={customComponents} />
		</article>
	);
}

/**
 * 直接使用 Shiki 的服务器组件示例
 */
interface CodeBlockProps {
	children: string;
	lang: BundledLanguage;
}

async function DirectShikiCodeBlock({ children, lang }: CodeBlockProps) {
	// 直接使用 Shiki 的 codeToHtml API
	const html = await codeToHtml(children, {
		lang,
		theme: "github-dark",
	});

	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * 使用 HAST 的自定义组件示例
 */
async function CustomShikiCodeBlock({ children, lang }: CodeBlockProps) {
	// 使用 codeToHast 获取 AST，然后渲染自定义组件
	const hast = await codeToHast(children, {
		lang,
		theme: "github-dark",
	});

	return toJsxRuntime(hast, {
		Fragment,
		jsx,
		jsxs,
		components: {
			// 自定义 pre 元素
			pre: (props) => (
				<pre
					{...props}
					className="bg-gray-900 rounded-lg p-4 overflow-x-auto"
					data-custom-codeblock
				/>
			),
			// 自定义 code 元素
			code: (props) => <code {...props} className="text-sm font-mono" />,
		},
	}) as JSX.Element;
}

/**
 * 页面组件示例
 */
export default async function BlogPostPage({
	params,
}: {
	params: { slug: string };
}) {
	// 假设从数据库或文件系统获取 MDX 内容
	const post = await getPostBySlug(params.slug);

	return (
		<div className="container mx-auto px-4 py-8">
			<header className="mb-8">
				<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
				<div className="flex items-center gap-4 text-gray-600">
					<time>{post.publishedAt}</time>
					<span>•</span>
					<span>{post.readingTime} 分钟阅读</span>
					<span>•</span>
					<span>{post.wordCount} 字</span>
				</div>
			</header>

			{/* 使用 MDX Processor */}
			<ServerMDXExample mdxContent={post.mdxContent} />

			{/* 或者直接使用 Shiki */}
			<div className="mt-8">
				<h2 className="text-2xl font-bold mb-4">代码示例</h2>
				<DirectShikiCodeBlock lang="typescript">
					{`interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};`}
				</DirectShikiCodeBlock>
			</div>
		</div>
	);
}

/**
 * 客户端组件示例（用于动态高亮）
 */
("use client");

import { useState, useLayoutEffect } from "react";

interface ClientCodeBlockProps {
	initial?: JSX.Element;
	code: string;
	lang: BundledLanguage;
}

export function ClientCodeBlock({ initial, code, lang }: ClientCodeBlockProps) {
	const [nodes, setNodes] = useState(initial);

	useLayoutEffect(() => {
		// 动态导入 Shiki Web Bundle
		import("shiki/bundle/web").then(async ({ codeToHast }) => {
			const hast = await codeToHast(code, {
				lang,
				theme: "github-dark",
			});

			const jsx = toJsxRuntime(hast, {
				Fragment,
				jsx,
				jsxs,
			}) as JSX.Element;

			setNodes(jsx);
		});
	}, [code, lang]);

	return nodes ?? <p className="text-gray-500">Loading...</p>;
}

/**
 * 自定义 MDX 组件
 */
const customComponents = {
	// 自定义标题
	h1: ({ children }: { children: React.ReactNode }) => (
		<h1 className="text-4xl font-bold mb-6 text-white">{children}</h1>
	),
	h2: ({ children }: { children: React.ReactNode }) => (
		<h2 className="text-3xl font-semibold mb-4 text-white">{children}</h2>
	),
	h3: ({ children }: { children: React.ReactNode }) => (
		<h3 className="text-2xl font-medium mb-3 text-white">{children}</h3>
	),

	// 自定义段落
	p: ({ children }: { children: React.ReactNode }) => (
		<p className="mb-4 text-gray-300 leading-relaxed">{children}</p>
	),

	// 自定义链接
	a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
		<a
			href={href}
			className="text-blue-400 hover:text-blue-300 underline"
			target={href?.startsWith("http") ? "_blank" : undefined}
			rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
		>
			{children}
		</a>
	),

	// 自定义列表
	ul: ({ children }: { children: React.ReactNode }) => (
		<ul className="mb-4 list-disc list-inside text-gray-300">{children}</ul>
	),
	li: ({ children }: { children: React.ReactNode }) => (
		<li className="mb-1">{children}</li>
	),

	// 自定义引用
	blockquote: ({ children }: { children: React.ReactNode }) => (
		<blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-400">
			{children}
		</blockquote>
	),

	// 自定义行内代码
	code: ({ children }: { children: React.ReactNode }) => (
		<code className="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-300">
			{children}
		</code>
	),
};

/**
 * 模拟数据获取函数
 */
async function getPostBySlug(slug: string) {
	// 这里应该从数据库或文件系统获取数据
	return {
		slug,
		title: "MDX with Next.js and Shiki",
		publishedAt: "2024-01-15",
		readingTime: 5,
		wordCount: 1200,
		mdxContent: `---
title: "MDX with Next.js and Shiki"
description: "Learn how to integrate MDX with Next.js using Shiki for syntax highlighting"
tags: ["nextjs", "mdx", "shiki"]
---

# MDX with Next.js and Shiki

This is an example of MDX content with **bold text** and *italic text*.

## Code Example

Here's some TypeScript code:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};
\`\`\`

## Features

- ✅ Server-side rendering
- ✅ Syntax highlighting with Shiki
- ✅ Custom components
- ✅ TypeScript support

> This is a blockquote with some important information.

Visit [Next.js](https://nextjs.org) for more information.
`,
	};
}

/**
 * API 路由示例
 */
export async function POST(request: Request) {
	try {
		const { mdxContent } = await request.json();

		// 验证 MDX 内容
		const validation = await mdxProcessor.validateMDX(mdxContent);
		if (!validation.isValid) {
			return Response.json(
				{ error: "Invalid MDX content", details: validation.error },
				{ status: 400 },
			);
		}

		// 提取元数据
		const metadata = mdxProcessor.extractMetadata(mdxContent);

		// 这里可以保存到数据库
		// await savePost({ mdxContent, ...metadata });

		return Response.json({
			success: true,
			metadata: {
				title: metadata.frontmatter.title,
				readingTime: metadata.readingTime,
				wordCount: metadata.wordCount,
				excerpt: metadata.excerpt,
			},
		});
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return Response.json(
			{ error: "Failed to process MDX content", details: errorMessage },
			{ status: 500 },
		);
	}
}
