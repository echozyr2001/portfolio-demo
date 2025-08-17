import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MDXEditor } from "@/components/editor/MDXEditor";
import { useAutoSave } from "@/components/editor/hooks/useAutoSave";

// Mock Monaco Editor
vi.mock("@monaco-editor/react", () => ({
	default: ({ onChange, onMount, value }: any) => {
		// 模拟编辑器挂载
		if (onMount) {
			const mockEditor = {
				updateOptions: vi.fn(),
				getSelection: vi.fn(() => ({
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: 1,
					endColumn: 1,
				})),
				getModel: vi.fn(() => ({
					getValueInRange: vi.fn(() => "selected text"),
				})),
				executeEdits: vi.fn(),
				setPosition: vi.fn(),
				focus: vi.fn(),
				getPosition: vi.fn(() => ({ lineNumber: 1, column: 1 })),
				getAction: vi.fn(() => ({ run: vi.fn() })),
				addCommand: vi.fn(() => ({ dispose: vi.fn() })),
			};

			const mockMonaco = {
				KeyMod: { CtrlCmd: 1, Shift: 2, Alt: 4 },
				KeyCode: { KeyS: 1, KeyB: 2, KeyI: 3 },
				languages: {
					register: vi.fn(),
					setLanguageConfiguration: vi.fn(),
					setMonarchTokensProvider: vi.fn(),
					registerCompletionItemProvider: vi.fn(),
					registerDocumentFormattingEditProvider: vi.fn(),
					CompletionItemKind: { Snippet: 1 },
					CompletionItemInsertTextRule: { InsertAsSnippet: 1 },
				},
			};

			setTimeout(() => onMount(mockEditor, mockMonaco), 0);
		}

		return (
			<div data-testid="monaco-editor">
				<textarea
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					data-testid="editor-textarea"
				/>
			</div>
		);
	},
}));

// Mock hooks
vi.mock("@/components/editor/hooks/useAutoSave");
vi.mock("@/components/editor/hooks/useMDXEditorShortcuts", () => ({
	useMDXEditorShortcuts: vi.fn(),
}));

describe("MDXEditor", () => {
	const mockOnChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock useAutoSave hook
		(useAutoSave as any).mockReturnValue({
			isSaving: false,
			lastSaved: null,
			hasUnsavedChanges: false,
		});
	});

	it("renders the editor with initial content", () => {
		const initialContent = "# Hello World";

		render(
			<MDXEditor
				initialContent={initialContent}
				onChange={mockOnChange}
				onSave={mockOnSave}
			/>,
		);

		expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
		expect(screen.getByTestId("editor-textarea")).toHaveValue(initialContent);
	});

	it("calls onChange when content changes", async () => {
		render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
			/>,
		);

		const textarea = screen.getByTestId("editor-textarea");
		fireEvent.change(textarea, { target: { value: "# New Content" } });

		await waitFor(() => {
			expect(mockOnChange).toHaveBeenCalledWith("# New Content");
		});
	});

	it("renders toolbar with all buttons", () => {
		render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
			/>,
		);

		// 检查工具栏按钮
		expect(screen.getByTitle("粗体 (Ctrl+B)")).toBeInTheDocument();
		expect(screen.getByTitle("斜体 (Ctrl+I)")).toBeInTheDocument();
		expect(screen.getByTitle("删除线")).toBeInTheDocument();
		expect(screen.getByTitle("行内代码 (Ctrl+`)")).toBeInTheDocument();
		expect(screen.getByTitle("链接 (Ctrl+K)")).toBeInTheDocument();
		expect(screen.getByTitle("图片")).toBeInTheDocument();
		expect(screen.getByTitle("无序列表")).toBeInTheDocument();
		expect(screen.getByTitle("有序列表")).toBeInTheDocument();
		expect(screen.getByTitle("引用")).toBeInTheDocument();
		expect(screen.getByTitle("表格")).toBeInTheDocument();
		expect(screen.getByTitle("分割线")).toBeInTheDocument();
	});

	it("calls onSave when save button is clicked", () => {
		render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
			/>,
		);

		const saveButton = screen.getByRole("button", { name: /保存/ });
		fireEvent.click(saveButton);

		expect(mockOnSave).toHaveBeenCalled();
	});

	it("shows loading state correctly", () => {
		render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
				isLoading={true}
			/>,
		);

		const saveButton = screen.getByRole("button", { name: /保存/ });
		expect(saveButton).toBeDisabled();
	});

	it("shows saving state when auto-saving", () => {
		(useAutoSave as any).mockReturnValue({
			isSaving: true,
			lastSaved: null,
			hasUnsavedChanges: true,
		});

		render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
			/>,
		);

		expect(screen.getByText("保存中...")).toBeInTheDocument();
	});

	it("shows last saved time", () => {
		const lastSaved = new Date("2024-01-01T12:00:00");
		(useAutoSave as any).mockReturnValue({
			isSaving: false,
			lastSaved,
			hasUnsavedChanges: false,
		});

		render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
			/>,
		);

		expect(screen.getByText(/最后保存:/)).toBeInTheDocument();
		expect(screen.getByText(/12:00:00/)).toBeInTheDocument();
	});

	it("displays character count in status bar", () => {
		const content = "Hello World";

		render(
			<MDXEditor
				initialContent={content}
				onChange={mockOnChange}
				onSave={mockOnSave}
			/>,
		);

		expect(screen.getByText(`字符: ${content.length}`)).toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
				className="custom-editor"
			/>,
		);

		expect(
			container.querySelector(".mdx-editor.custom-editor"),
		).toBeInTheDocument();
	});

	it("uses custom height", () => {
		render(
			<MDXEditor
				initialContent=""
				onChange={mockOnChange}
				onSave={mockOnSave}
				height="400px"
			/>,
		);

		// Monaco Editor 组件应该接收到正确的 height prop
		expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
	});
});

describe("useAutoSave hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should trigger save after delay", async () => {
		const mockSave = vi.fn();
		const { rerender } = render(
			<TestComponent content="initial" onSave={mockSave} />,
		);

		// 更改内容
		rerender(<TestComponent content="updated" onSave={mockSave} />);

		// 快进时间
		vi.advanceTimersByTime(2000);

		await waitFor(() => {
			expect(mockSave).toHaveBeenCalled();
		});
	});

	it("should debounce multiple changes", async () => {
		const mockSave = vi.fn();
		const { rerender } = render(
			<TestComponent content="initial" onSave={mockSave} />,
		);

		// 快速多次更改
		rerender(<TestComponent content="change1" onSave={mockSave} />);
		vi.advanceTimersByTime(500);
		rerender(<TestComponent content="change2" onSave={mockSave} />);
		vi.advanceTimersByTime(500);
		rerender(<TestComponent content="change3" onSave={mockSave} />);

		// 只有最后一次更改应该触发保存
		vi.advanceTimersByTime(2000);

		await waitFor(() => {
			expect(mockSave).toHaveBeenCalledTimes(1);
		});
	});
});

// 测试组件
function TestComponent({
	content,
	onSave,
}: {
	content: string;
	onSave: () => void;
}) {
	const { isSaving } = useAutoSave(content, onSave, 2000);
	return <div>{isSaving ? "Saving..." : "Ready"}</div>;
}
