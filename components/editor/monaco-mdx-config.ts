import type { Monaco } from "@monaco-editor/react";

export function configureMDXLanguage(monaco: Monaco) {
	// 注册 MDX 语言
	monaco.languages.register({ id: "mdx" });

	// 设置 MDX 语言配置
	monaco.languages.setLanguageConfiguration("mdx", {
		comments: {
			blockComment: ["{/*", "*/}"],
		},
		brackets: [
			["{", "}"],
			["[", "]"],
			["(", ")"],
			["<", ">"],
		],
		autoClosingPairs: [
			{ open: "{", close: "}" },
			{ open: "[", close: "]" },
			{ open: "(", close: ")" },
			{ open: "<", close: ">", notIn: ["string"] },
			{ open: "`", close: "`", notIn: ["string"] },
			{ open: '"', close: '"', notIn: ["string"] },
			{ open: "'", close: "'", notIn: ["string", "comment"] },
			{ open: "**", close: "**" },
			{ open: "*", close: "*" },
		],
		surroundingPairs: [
			{ open: "{", close: "}" },
			{ open: "[", close: "]" },
			{ open: "(", close: ")" },
			{ open: "<", close: ">" },
			{ open: "`", close: "`" },
			{ open: '"', close: '"' },
			{ open: "'", close: "'" },
			{ open: "**", close: "**" },
			{ open: "*", close: "*" },
		],
		folding: {
			markers: {
				start: new RegExp("^\\s*<!--\\s*#region\\b.*-->"),
				end: new RegExp("^\\s*<!--\\s*#endregion\\b.*-->"),
			},
		},
	});

	// 设置 MDX 语法高亮
	monaco.languages.setMonarchTokensProvider("mdx", {
		defaultToken: "",
		tokenPostfix: ".mdx",

		// 控制字符
		control: /[\\`*_\[\]{}()#+\-\.!]/,
		noncontrol: /[^\\`*_\[\]{}()#+\-\.!]/,
		escapes: /\\(?:@control)/,

		// JSX 相关
		jsxKeywords: [
			"import",
			"export",
			"default",
			"from",
			"as",
			"const",
			"let",
			"var",
			"function",
			"return",
			"if",
			"else",
			"for",
			"while",
			"do",
			"break",
			"continue",
			"switch",
			"case",
			"try",
			"catch",
			"finally",
			"throw",
			"new",
			"this",
			"typeof",
			"instanceof",
			"in",
			"of",
			"class",
			"extends",
			"super",
			"static",
			"public",
			"private",
			"protected",
			"readonly",
			"abstract",
			"interface",
			"type",
			"namespace",
			"module",
			"declare",
		],

		tokenizer: {
			root: [
				// Frontmatter
				[/^---$/, { token: "meta.separator", next: "@frontmatter" }],

				// JSX/React 组件
				[/<[A-Z][a-zA-Z0-9]*/, { token: "tag.open", next: "@jsxTag" }],
				[/<\/[A-Z][a-zA-Z0-9]*>/, "tag.close"],

				// JavaScript 表达式
				[/\{/, { token: "delimiter.curly", next: "@jsExpression" }],

				// Markdown 标题
				[/^(\s{0,3})(#{1,6}\s)/, ["white", "keyword"]],

				// 代码块
				[/^\s*```\s*([\w\-]+)?\s*$/, { token: "string", next: "@codeblock" }],

				// 行内代码
				[/`[^`]*`/, "string.code"],

				// 链接
				[/\[([^\]]*)\]\(([^)]*)\)/, ["string.link", "string.url"]],

				// 图片
				[/!\[([^\]]*)\]\(([^)]*)\)/, ["string.image", "string.url"]],

				// 粗体
				[/\*\*([^*]+)\*\*/, "strong"],
				[/__([^_]+)__/, "strong"],

				// 斜体
				[/\*([^*]+)\*/, "emphasis"],
				[/_([^_]+)_/, "emphasis"],

				// 删除线
				[/~~([^~]+)~~/, "strikethrough"],

				// 列表
				[/^\s*[\*\-\+]\s/, "keyword"],
				[/^\s*\d+\.\s/, "keyword"],

				// 引用
				[/^\s*>\s/, "quote"],

				// 分割线
				[/^\s*[-*_]{3,}\s*$/, "meta.separator"],

				// HTML 标签
				[/<\/?[a-z][\w\-]*[^>]*>/i, "tag"],

				// 普通文本
				[/./, "text"],
			],

			frontmatter: [
				[/^---$/, { token: "meta.separator", next: "@pop" }],
				[/^(\w+)(\s*:\s*)(.*)$/, ["variable.name", "operator", "string"]],
				[/./, "meta.content"],
			],

			jsxTag: [
				[/\s+/, "white"],
				[/(\w+)(=)/, ["attribute.name", "operator"]],
				[/"([^"]*)"/, "attribute.value"],
				[/'([^']*)'/, "attribute.value"],
				[/\{/, { token: "delimiter.curly", next: "@jsExpression" }],
				[/>/, { token: "tag.open", next: "@pop" }],
				[/\/>/, { token: "tag.self-close", next: "@pop" }],
			],

			jsExpression: [
				[/\{/, { token: "delimiter.curly", next: "@jsExpression" }],
				[/\}/, { token: "delimiter.curly", next: "@pop" }],
				[
					/\b(?:import|export|default|from|as|const|let|var|function|return|if|else|for|while|do|break|continue|switch|case|try|catch|finally|throw|new|this|typeof|instanceof|in|of|class|extends|super|static|public|private|protected|readonly|abstract|interface|type|namespace|module|declare)\b/,
					"keyword",
				],
				[/[a-zA-Z_$][\w$]*/, "identifier"],
				[/\d+/, "number"],
				[/"([^"\\]|\\.)*"/, "string"],
				[/'([^'\\]|\\.)*'/, "string"],
				[/\/\/.*$/, "comment"],
				[/\/\*/, { token: "comment", next: "@jsComment" }],
				[/./, "text"],
			],

			jsComment: [
				[/\*\//, { token: "comment", next: "@pop" }],
				[/./, "comment"],
			],

			codeblock: [
				[/^\s*```\s*$/, { token: "string", next: "@pop" }],
				[/./, "string.code"],
			],
		},
	});

	// 设置自动补全
	monaco.languages.registerCompletionItemProvider("mdx", {
		provideCompletionItems: () => {
			const suggestions = [
				// Markdown 语法
				{
					label: "heading1",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: "# ${1:标题}",
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "一级标题",
					range: undefined,
				},
				{
					label: "heading2",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: "## ${1:标题}",
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "二级标题",
					range: undefined,
				},
				{
					label: "heading3",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: "### ${1:标题}",
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "三级标题",
					range: undefined,
				},
				{
					label: "link",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: "[${1:链接文本}](${2:https://example.com})",
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "插入链接",
					range: undefined,
				},
				{
					label: "image",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: "![${1:图片描述}](${2:image-url})",
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "插入图片",
					range: undefined,
				},
				{
					label: "codeblock",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: "```${1:javascript}\n${2:// 代码}\n```",
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "代码块",
					range: undefined,
				},
				{
					label: "table",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText:
						"| ${1:标题1} | ${2:标题2} | ${3:标题3} |\n| --- | --- | --- |\n| ${4:内容1} | ${5:内容2} | ${6:内容3} |",
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "插入表格",
					range: undefined,
				},

				// MDX 组件
				{
					label: "Image",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText:
						'<Image\n  id="${1:media-id}"\n  alt="${2:图片描述}"\n  width={${3:800}}\n  height={${4:600}}\n/>',
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "MDX 图片组件",
					range: undefined,
				},
				{
					label: "CodeBlock",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText:
						'<CodeBlock language="${1:javascript}">\n${2:// 代码}\n</CodeBlock>',
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "MDX 代码块组件",
					range: undefined,
				},
				{
					label: "Callout",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText: '<Callout type="${1:info}">\n${2:提示内容}\n</Callout>',
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "MDX 提示框组件",
					range: undefined,
				},

				// Frontmatter
				{
					label: "frontmatter",
					kind: monaco.languages.CompletionItemKind.Snippet,
					insertText:
						'---\ntitle: "${1:标题}"\ndescription: "${2:描述}"\npublishedAt: "${3:2024-01-01}"\ntags: [${4:"tag1", "tag2"}]\nfeatured: ${5:false}\n---\n\n${6:内容开始}',
					insertTextRules:
						monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: "Frontmatter 模板",
					range: undefined,
				},
			];

			return { suggestions };
		},
	});

	// 设置格式化
	monaco.languages.registerDocumentFormattingEditProvider("mdx", {
		provideDocumentFormattingEdits: (model) => {
			const text = model.getValue();
			const lines = text.split("\n");
			const edits: monaco.languages.TextEdit[] = [];

			// 简单的格式化规则
			lines.forEach((line, index) => {
				const trimmedLine = line.trim();

				// 标题后添加空行
				if (trimmedLine.match(/^#{1,6}\s/) && index < lines.length - 1) {
					const nextLine = lines[index + 1];
					if (nextLine.trim() !== "") {
						edits.push({
							range: {
								startLineNumber: index + 2,
								startColumn: 1,
								endLineNumber: index + 2,
								endColumn: 1,
							},
							text: "\n",
						});
					}
				}
			});

			return edits;
		},
	});
}
