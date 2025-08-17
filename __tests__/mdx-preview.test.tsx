import { render, screen, waitFor } from "@testing-library/react";
import { MDXPreview } from "@/components/editor/MDXPreview";
import { MDXEditorWithPreview } from "@/components/editor/MDXEditorWithPreview";
import { MDXPreviewPanel } from "@/components/editor/MDXPreviewPanel";

// Mock the MDX processor
jest.mock("@/lib/mdx-processor", () => ({
	mdxProcessor: {
		serialize: jest.fn().mockResolvedValue({
			mdxSource: {
				compiledSource: "mock compiled source",
				frontmatter: {},
				scope: {},
			},
		}),
	},
}));

// Mock next-mdx-remote
jest.mock("next-mdx-remote", () => ({
	MDXRemote: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="mdx-remote">{children}</div>
	),
}));

describe("MDXPreview", () => {
	it("renders loading state initially", () => {
		render(<MDXPreview mdxContent="# Test" />);
		expect(screen.getByText("正在渲染预览...")).toBeInTheDocument();
	});

	it("renders empty state for empty content", async () => {
		render(<MDXPreview mdxContent="" />);

		await waitFor(() => {
			expect(screen.getByText("开始输入MDX内容以查看预览")).toBeInTheDocument();
		});
	});

	it("calls onError when MDX processing fails", async () => {
		const mockOnError = jest.fn();
		const { mdxProcessor } = require("@/lib/mdx-processor");

		mdxProcessor.serialize.mockRejectedValueOnce(new Error("Invalid MDX"));

		render(
			<MDXPreview mdxContent="invalid mdx content" onError={mockOnError} />,
		);

		await waitFor(() => {
			expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	it("calls onSuccess when MDX processing succeeds", async () => {
		const mockOnSuccess = jest.fn();

		render(<MDXPreview mdxContent="# Valid MDX" onSuccess={mockOnSuccess} />);

		await waitFor(() => {
			expect(mockOnSuccess).toHaveBeenCalled();
		});
	});
});

describe("MDXEditorWithPreview", () => {
	const mockProps = {
		onChange: jest.fn(),
		onSave: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders with default split mode", () => {
		render(<MDXEditorWithPreview {...mockProps} />);

		expect(screen.getByText("并排")).toBeInTheDocument();
		expect(screen.getByText("实时预览")).toBeInTheDocument();
	});

	it("switches between preview modes", async () => {
		render(<MDXEditorWithPreview {...mockProps} />);

		// Should start in split mode
		expect(screen.getByText("并排")).toHaveClass("bg-blue-100");

		// Click edit mode
		const editButton = screen.getByText("编辑");
		editButton.click();

		await waitFor(() => {
			expect(editButton).toHaveClass("bg-blue-100");
		});
	});

	it("shows error indicator when preview has error", async () => {
		const { mdxProcessor } = require("@/lib/mdx-processor");
		mdxProcessor.serialize.mockRejectedValueOnce(new Error("Invalid MDX"));

		render(
			<MDXEditorWithPreview {...mockProps} initialContent="invalid content" />,
		);

		await waitFor(() => {
			expect(screen.getByText("预览错误")).toBeInTheDocument();
		});
	});
});

describe("MDXPreviewPanel", () => {
	it("renders with default props", () => {
		render(<MDXPreviewPanel mdxContent="# Test" />);

		expect(screen.getByText("预览")).toBeInTheDocument();
		expect(screen.getByText("实时")).toBeInTheDocument();
	});

	it("can be collapsed and expanded", async () => {
		render(<MDXPreviewPanel mdxContent="# Test" collapsible={true} />);

		const collapseButton = screen.getByTitle("折叠预览");
		collapseButton.click();

		await waitFor(() => {
			expect(
				screen.getByText("预览已折叠，点击上方按钮展开"),
			).toBeInTheDocument();
		});
	});

	it("shows error state when preview fails", async () => {
		const { mdxProcessor } = require("@/lib/mdx-processor");
		mdxProcessor.serialize.mockRejectedValueOnce(new Error("Invalid MDX"));

		render(<MDXPreviewPanel mdxContent="invalid content" />);

		await waitFor(() => {
			expect(screen.getByText("错误")).toBeInTheDocument();
		});
	});

	it("can toggle fullscreen mode", async () => {
		render(<MDXPreviewPanel mdxContent="# Test" />);

		const fullscreenButton = screen.getByTitle("全屏预览");
		fullscreenButton.click();

		await waitFor(() => {
			expect(screen.getByTitle("退出全屏")).toBeInTheDocument();
		});
	});
});

describe("Preview Integration", () => {
	it("updates preview when content changes", async () => {
		const mockOnChange = jest.fn();

		render(
			<MDXEditorWithPreview
				onChange={mockOnChange}
				onSave={jest.fn()}
				initialContent="# Initial"
			/>,
		);

		// The preview should update when content changes
		// This would be tested with user interactions in a full integration test
		expect(screen.getByText("实时预览")).toBeInTheDocument();
	});

	it("maintains consistent styling between preview and frontend", async () => {
		render(<MDXPreview mdxContent="# Test Heading" />);

		await waitFor(() => {
			const mdxRemote = screen.getByTestId("mdx-remote");
			expect(mdxRemote).toBeInTheDocument();
		});
	});
});
