import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	MDXRenderer,
	MDXImage,
	CodeBlock,
	Callout,
	ImageGallery,
	MDXErrorBoundary,
} from "@/components/mdx";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

// Mock next-mdx-remote
vi.mock("next-mdx-remote", () => ({
	MDXRemote: ({ children, components }: any) => (
		<div data-testid="mdx-content">
			{children || "MDX Content"}
			{components?.TestComponent && <components.TestComponent />}
		</div>
	),
}));

// Mock fetch for media API
global.fetch = vi.fn();

describe("MDX Components", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("MDXRenderer", () => {
		const mockMDXSource: MDXRemoteSerializeResult = {
			compiledSource: "mock-compiled-source",
			frontmatter: {},
			scope: {},
		};

		it("renders MDX content correctly", () => {
			render(<MDXRenderer mdxSource={mockMDXSource} />);
			expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
		});

		it("applies custom className", () => {
			render(
				<MDXRenderer mdxSource={mockMDXSource} className="custom-class" />,
			);
			const container = screen.getByTestId("mdx-content").parentElement;
			expect(container).toHaveClass("custom-class");
		});

		it("merges custom components with default components", () => {
			const TestComponent = () => <div data-testid="test-component">Test</div>;
			const customComponents = { TestComponent };

			render(
				<MDXRenderer mdxSource={mockMDXSource} components={customComponents} />,
			);

			expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
		});

		it("wraps content with error boundary by default", () => {
			render(<MDXRenderer mdxSource={mockMDXSource} />);
			// Error boundary is present (no error thrown)
			expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
		});

		it("can disable error boundary", () => {
			render(
				<MDXRenderer mdxSource={mockMDXSource} enableErrorBoundary={false} />,
			);
			expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
		});
	});

	describe("MDXImage", () => {
		it("renders image with src prop", () => {
			render(<MDXImage src="/test-image.jpg" alt="Test image" />);
			const img = screen.getByRole("img");
			expect(img).toHaveAttribute("src", "/test-image.jpg");
			expect(img).toHaveAttribute("alt", "Test image");
		});

		it("shows loading skeleton when loading media by ID", () => {
			vi.mocked(fetch).mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						id: "test-id",
						storageType: "base64",
						base64Data: "test-base64-data",
						mimeType: "image/jpeg",
						width: 800,
						height: 600,
					}),
			} as Response);

			render(<MDXImage id="test-id" alt="Test image" />);

			// Should show loading skeleton initially
			expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
		});

		it("shows error state when media loading fails", async () => {
			vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to fetch"));

			render(<MDXImage id="invalid-id" alt="Test image" />);

			await waitFor(() => {
				expect(screen.getByText("图片加载失败")).toBeInTheDocument();
			});
		});

		it("displays figcaption when title is provided", () => {
			render(<MDXImage src="/test.jpg" alt="Test" title="Test Title" />);
			expect(screen.getByText("Test Title")).toBeInTheDocument();
		});
	});

	describe("CodeBlock", () => {
		const sampleCode = 'console.log("Hello, World!");';

		it("renders code content", () => {
			render(<CodeBlock language="javascript">{sampleCode}</CodeBlock>);
			expect(screen.getByText(sampleCode)).toBeInTheDocument();
		});

		it("displays language label", () => {
			render(<CodeBlock language="javascript">{sampleCode}</CodeBlock>);
			expect(screen.getByText("JavaScript")).toBeInTheDocument();
		});

		it("shows filename when provided", () => {
			render(
				<CodeBlock language="javascript" filename="test.js">
					{sampleCode}
				</CodeBlock>,
			);
			expect(screen.getByText("test.js")).toBeInTheDocument();
		});

		it("displays line count", () => {
			const multiLineCode = "line1\nline2\nline3";
			render(<CodeBlock language="javascript">{multiLineCode}</CodeBlock>);
			expect(screen.getByText("3 lines")).toBeInTheDocument();
		});

		it("handles copy functionality", async () => {
			// Mock clipboard API
			Object.assign(navigator, {
				clipboard: {
					writeText: vi.fn().mockResolvedValue(undefined),
				},
			});

			render(<CodeBlock language="javascript">{sampleCode}</CodeBlock>);

			const copyButton = screen.getByTitle("复制代码");
			fireEvent.click(copyButton);

			await waitFor(() => {
				expect(navigator.clipboard.writeText).toHaveBeenCalledWith(sampleCode);
			});
		});

		it("shows expand button for long code blocks", () => {
			const longCode = Array(25).fill('console.log("line");').join("\n");
			render(<CodeBlock language="javascript">{longCode}</CodeBlock>);

			expect(screen.getByTitle("展开代码")).toBeInTheDocument();
		});
	});

	describe("Callout", () => {
		it("renders with default info type", () => {
			render(<Callout>Test content</Callout>);
			expect(screen.getByText("信息")).toBeInTheDocument();
			expect(screen.getByText("Test content")).toBeInTheDocument();
		});

		it("renders different callout types", () => {
			render(<Callout type="warning">Warning content</Callout>);
			expect(screen.getByText("警告")).toBeInTheDocument();
		});

		it("uses custom title when provided", () => {
			render(<Callout title="Custom Title">Content</Callout>);
			expect(screen.getByText("Custom Title")).toBeInTheDocument();
		});

		it("handles collapsible functionality", () => {
			render(
				<Callout collapsible defaultOpen={false}>
					Collapsible content
				</Callout>,
			);

			// Content should be hidden initially
			expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();

			// Click to expand
			fireEvent.click(screen.getByText("信息"));
			expect(screen.getByText("Collapsible content")).toBeInTheDocument();
		});
	});

	describe("ImageGallery", () => {
		const mockImages = [
			{ src: "/image1.jpg", alt: "Image 1", title: "First Image" },
			{ src: "/image2.jpg", alt: "Image 2", title: "Second Image" },
		];

		it("renders image grid", () => {
			render(<ImageGallery images={mockImages} />);

			expect(screen.getByAltText("Image 1")).toBeInTheDocument();
			expect(screen.getByAltText("Image 2")).toBeInTheDocument();
		});

		it("displays gallery title and description", () => {
			render(
				<ImageGallery
					images={mockImages}
					title="Test Gallery"
					description="Gallery description"
				/>,
			);

			expect(screen.getByText("Test Gallery")).toBeInTheDocument();
			expect(screen.getByText("Gallery description")).toBeInTheDocument();
		});

		it("opens lightbox when image is clicked", () => {
			render(<ImageGallery images={mockImages} enableLightbox={true} />);

			fireEvent.click(screen.getByAltText("Image 1"));

			// Lightbox should be open
			expect(screen.getByLabelText("关闭灯箱")).toBeInTheDocument();
		});

		it("navigates between images in lightbox", () => {
			render(<ImageGallery images={mockImages} enableLightbox={true} />);

			fireEvent.click(screen.getByAltText("Image 1"));

			// Should show image counter
			expect(screen.getByText("1 / 2")).toBeInTheDocument();

			// Click next
			fireEvent.click(screen.getByLabelText("下一张图片"));
			expect(screen.getByText("2 / 2")).toBeInTheDocument();
		});
	});

	describe("MDXErrorBoundary", () => {
		// Component that throws an error
		const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
			if (shouldThrow) {
				throw new Error("Test error");
			}
			return <div>No error</div>;
		};

		it("renders children when no error occurs", () => {
			render(
				<MDXErrorBoundary>
					<ThrowError shouldThrow={false} />
				</MDXErrorBoundary>,
			);

			expect(screen.getByText("No error")).toBeInTheDocument();
		});

		it("catches and displays error", () => {
			// Suppress console.error for this test
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			render(
				<MDXErrorBoundary>
					<ThrowError shouldThrow={true} />
				</MDXErrorBoundary>,
			);

			expect(screen.getByText("MDX渲染错误")).toBeInTheDocument();
			expect(screen.getByText(/Test error/)).toBeInTheDocument();

			consoleSpy.mockRestore();
		});

		it("provides retry functionality", () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const { rerender } = render(
				<MDXErrorBoundary>
					<ThrowError shouldThrow={true} />
				</MDXErrorBoundary>,
			);

			expect(screen.getByText("MDX渲染错误")).toBeInTheDocument();

			// Click retry button
			fireEvent.click(screen.getByText("重试渲染"));

			// Re-render with no error
			rerender(
				<MDXErrorBoundary>
					<ThrowError shouldThrow={false} />
				</MDXErrorBoundary>,
			);

			expect(screen.getByText("No error")).toBeInTheDocument();

			consoleSpy.mockRestore();
		});

		it("calls onError callback when error occurs", () => {
			const onError = vi.fn();
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			render(
				<MDXErrorBoundary onError={onError}>
					<ThrowError shouldThrow={true} />
				</MDXErrorBoundary>,
			);

			expect(onError).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});
