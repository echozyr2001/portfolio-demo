/**
 * Usage example for the MDX Processor
 * This file demonstrates how to use the MDXProcessor in the application
 */

import { mdxProcessor, MDXProcessor } from "./mdx-processor";

// Example MDX content that might come from a database or user input
const exampleMDXContent = `---
title: "Getting Started with Next.js and MDX"
description: "Learn how to integrate MDX with Next.js for powerful content management"
tags: ["nextjs", "mdx", "react", "typescript"]
publishedAt: "2024-01-15"
featured: true
---

# Getting Started with Next.js and MDX

MDX is a powerful format that lets you write **JSX** in your Markdown documents. This makes it perfect for creating rich, interactive content.

## Why Use MDX?

MDX combines the simplicity of Markdown with the power of React components:

- 📝 **Easy to write** - Standard Markdown syntax
- ⚛️ **React components** - Embed interactive elements
- 🎨 **Customizable** - Style with CSS-in-JS or Tailwind
- 🚀 **Performance** - Server-side rendering support

## Code Example

Here's how you can create a simple React component in MDX:

\`\`\`jsx
function WelcomeMessage({ name }) {
  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h2>Welcome, {name}!</h2>
      <p>Thanks for reading our MDX content.</p>
    </div>
  );
}

export default WelcomeMessage;
\`\`\`

## TypeScript Support

MDX also works great with TypeScript:

\`\`\`typescript
interface BlogPostProps {
  title: string;
  content: string;
  publishedAt: Date;
}

const BlogPost: React.FC<BlogPostProps> = ({ title, content, publishedAt }) => {
  return (
    <article>
      <h1>{title}</h1>
      <time>{publishedAt.toLocaleDateString()}</time>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
};
\`\`\`

## Conclusion

With MDX, you can create engaging content that combines the best of Markdown and React. Perfect for blogs, documentation, and interactive tutorials!`;

/**
 * Example: Processing MDX content for storage
 */
export async function processContentForStorage(mdxContent: string) {
	console.log("Processing MDX content for storage...");

	try {
		// Extract metadata without full serialization (faster for storage)
		const metadata = mdxProcessor.extractMetadata(mdxContent);

		console.log("Extracted metadata:", {
			title: metadata.frontmatter.title,
			readingTime: metadata.readingTime,
			wordCount: metadata.wordCount,
			excerptLength: metadata.excerpt.length,
		});

		return {
			// Store the original MDX content
			mdxContent,
			// Store extracted metadata for database indexing
			title: metadata.frontmatter.title || "",
			description: metadata.frontmatter.description || "",
			tags: metadata.frontmatter.tags || [],
			excerpt: metadata.excerpt,
			readingTime: metadata.readingTime,
			wordCount: metadata.wordCount,
			publishedAt: metadata.frontmatter.publishedAt
				? new Date(metadata.frontmatter.publishedAt)
				: null,
			featured: metadata.frontmatter.featured || false,
		};
	} catch (error) {
		console.error("Failed to process MDX content:", error);
		throw new Error(`MDX processing failed: ${error.message}`);
	}
}

/**
 * Example: Processing MDX content for rendering
 */
export async function processContentForRendering(mdxContent: string) {
	console.log("Processing MDX content for rendering...");

	try {
		// Full serialization with syntax highlighting for rendering
		const result = await mdxProcessor.serialize(mdxContent, {
			enableCodeHighlight: true,
			shikiTheme: "github-dark",
		});

		console.log("Serialization complete:", {
			hasCompiledSource: !!result.mdxSource.compiledSource,
			frontmatterKeys: Object.keys(result.frontmatter),
			readingTime: result.readingTime,
			wordCount: result.wordCount,
		});

		return result;
	} catch (error) {
		console.error("Failed to serialize MDX content:", error);
		throw new Error(`MDX serialization failed: ${error.message}`);
	}
}

/**
 * Example: Validating MDX content
 */
export async function validateMDXContent(mdxContent: string) {
	console.log("Validating MDX content...");

	const validation = await mdxProcessor.validateMDX(mdxContent);

	if (validation.isValid) {
		console.log("✅ MDX content is valid");
	} else {
		console.log("❌ MDX content is invalid:", validation.error);
	}

	return validation;
}

/**
 * Example usage in an API route
 */
export async function exampleAPIUsage() {
	console.log("\n=== Example API Usage ===");

	// 1. Validate content
	const validation = await validateMDXContent(exampleMDXContent);
	if (!validation.isValid) {
		throw new Error("Invalid MDX content");
	}

	// 2. Process for storage (extract metadata)
	const storageData = await processContentForStorage(exampleMDXContent);
	console.log("Storage data prepared:", Object.keys(storageData));

	// 3. Process for rendering (full serialization)
	const renderData = await processContentForRendering(exampleMDXContent);
	console.log("Render data prepared:", Object.keys(renderData));

	return {
		storage: storageData,
		render: renderData,
	};
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	exampleAPIUsage()
		.then(() => {
			console.log("\n🎉 Example completed successfully!");
			mdxProcessor.dispose(); // Clean up resources
		})
		.catch((error) => {
			console.error("❌ Example failed:", error);
			mdxProcessor.dispose();
		});
}
