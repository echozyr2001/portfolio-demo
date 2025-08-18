"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

/**
 * MDX错误信息接口
 */
interface MDXError {
	type: "syntax" | "component" | "runtime" | "unknown";
	message: string;
	line?: number;
	column?: number;
	suggestion?: string;
	componentStack?: string;
}

/**
 * 错误边界状态接口
 */
interface ErrorBoundaryState {
	hasError: boolean;
	error: MDXError | null;
	errorId: string | null;
}

/**
 * 错误边界属性接口
 */
interface MDXErrorBoundaryProps {
	/** 子组件 */
	children: ReactNode;
	/** 自定义错误回退组件 */
	fallback?: React.ComponentType<{ error: MDXError; retry: () => void }>;
	/** 错误回调函数 */
	onError?: (error: MDXError, errorInfo: ErrorInfo) => void;
	/** 是否在开发环境显示详细错误信息 */
	showDetailedError?: boolean;
	/** 自定义样式类名 */
	className?: string;
}

/**
 * MDX错误处理器
 */
class MDXErrorHandler {
	/**
	 * 解析和分类错误
	 */
	static parseError(error: Error, errorInfo?: ErrorInfo): MDXError {
		const errorMessage = error.message || "Unknown error occurred";
		const stack = error.stack || "";
		const componentStack = errorInfo?.componentStack || "";

		// 检测MDX语法错误
		if (
			errorMessage.includes("Expected") ||
			errorMessage.includes("Unexpected")
		) {
			return {
				type: "syntax",
				message: errorMessage,
				suggestion:
					"Please check your MDX syntax. Make sure all JSX elements are properly closed and nested.",
				componentStack,
			};
		}

		// 检测组件错误
		if (
			errorMessage.includes("Element type is invalid") ||
			errorMessage.includes("is not a function") ||
			componentStack.includes("MDX")
		) {
			return {
				type: "component",
				message: errorMessage,
				suggestion:
					"This error is likely caused by a missing or incorrectly imported component in your MDX content.",
				componentStack,
			};
		}

		// 检测运行时错误
		if (
			errorMessage.includes("Cannot read") ||
			errorMessage.includes("Cannot access") ||
			errorMessage.includes("is not defined")
		) {
			return {
				type: "runtime",
				message: errorMessage,
				suggestion:
					"This appears to be a runtime error. Check if all variables and props are properly defined.",
				componentStack,
			};
		}

		// 未知错误
		return {
			type: "unknown",
			message: errorMessage,
			suggestion:
				"An unexpected error occurred while rendering the MDX content.",
			componentStack,
		};
	}

	/**
	 * 格式化错误信息给用户
	 */
	static formatErrorForUser(error: MDXError): string {
		const typeLabels = {
			syntax: "MDX Syntax Error",
			component: "Component Error",
			runtime: "Runtime Error",
			unknown: "Rendering Error",
		};

		return `${typeLabels[error.type]}: ${error.message}`;
	}

	/**
	 * 生成错误ID
	 */
	static generateErrorId(): string {
		return `mdx-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}

/**
 * 默认错误回退组件
 */
function DefaultErrorFallback({
	error,
	retry,
	showDetailedError = false,
}: {
	error: MDXError;
	retry: () => void;
	showDetailedError?: boolean;
}) {
	const [showDetails, setShowDetails] = React.useState(false);

	const getErrorIcon = (type: MDXError["type"]) => {
		switch (type) {
			case "syntax":
				return (
					<svg
						className="w-6 h-6 text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				);
			case "component":
				return (
					<svg
						className="w-6 h-6 text-orange-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
						/>
					</svg>
				);
			case "runtime":
				return (
					<svg
						className="w-6 h-6 text-yellow-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			default:
				return (
					<svg
						className="w-6 h-6 text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
		}
	};

	return (
		<div className="my-8 p-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
			<div className="flex items-start space-x-3">
				{/* 错误图标 */}
				<div className="flex-shrink-0">{getErrorIcon(error.type)}</div>

				<div className="flex-1 min-w-0">
					{/* 错误标题 */}
					<h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
						MDX渲染错误
					</h3>

					{/* 错误消息 */}
					<p className="text-red-700 dark:text-red-300 mb-3">
						{MDXErrorHandler.formatErrorForUser(error)}
					</p>

					{/* 建议 */}
					{error.suggestion && (
						<div className="mb-4 p-3 bg-red-100 dark:bg-red-900 rounded border border-red-200 dark:border-red-700">
							<p className="text-sm text-red-800 dark:text-red-200">
								<strong>建议：</strong> {error.suggestion}
							</p>
						</div>
					)}

					{/* 操作按钮 */}
					<div className="flex items-center space-x-3">
						<button
							onClick={retry}
							className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
						>
							重试渲染
						</button>

						{(showDetailedError || process.env.NODE_ENV === "development") && (
							<button
								onClick={() => setShowDetails(!showDetails)}
								className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors"
							>
								{showDetails ? "隐藏详情" : "显示详情"}
							</button>
						)}
					</div>

					{/* 详细错误信息 */}
					{showDetails &&
						(showDetailedError || process.env.NODE_ENV === "development") && (
							<div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded border">
								<h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
									详细错误信息：
								</h4>
								<pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
									{error.message}
									{error.componentStack && (
										<>
											{"\n\n组件堆栈："}
											{error.componentStack}
										</>
									)}
								</pre>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}

/**
 * MDX错误边界组件
 *
 * 功能特性：
 * - 捕获MDX渲染过程中的所有错误
 * - 智能错误分类和处理
 * - 用户友好的错误提示
 * - 开发环境详细错误信息
 * - 错误重试功能
 * - 自定义错误回退组件支持
 * - 错误日志记录
 */
export class MDXErrorBoundary extends Component<
	MDXErrorBoundaryProps,
	ErrorBoundaryState
> {
	private retryTimeoutId: number | null = null;

	constructor(props: MDXErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorId: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		// 更新状态以显示错误UI
		return {
			hasError: true,
			errorId: MDXErrorHandler.generateErrorId(),
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// 解析错误
		const mdxError = MDXErrorHandler.parseError(error, errorInfo);

		// 更新状态
		this.setState({ error: mdxError });

		// 调用错误回调
		if (this.props.onError) {
			this.props.onError(mdxError, errorInfo);
		}

		// 在开发环境记录详细错误
		if (process.env.NODE_ENV === "development") {
			console.group("🚨 MDX Error Boundary");
			console.error("Error:", error);
			console.error("Error Info:", errorInfo);
			console.error("Parsed MDX Error:", mdxError);
			console.groupEnd();
		}

		// 生产环境错误上报（可选）
		if (process.env.NODE_ENV === "production") {
			// 这里可以集成错误监控服务，如 Sentry
			// reportError(mdxError, errorInfo);
		}
	}

	componentWillUnmount() {
		if (this.retryTimeoutId) {
			window.clearTimeout(this.retryTimeoutId);
		}
	}

	/**
	 * 重试渲染
	 */
	retry = () => {
		this.setState({
			hasError: false,
			error: null,
			errorId: null,
		});
	};

	render() {
		if (this.state.hasError && this.state.error) {
			// 使用自定义错误回退组件或默认组件
			const FallbackComponent = this.props.fallback || DefaultErrorFallback;

			return (
				<div className={this.props.className}>
					<FallbackComponent
						error={this.state.error}
						retry={this.retry}
						showDetailedError={this.props.showDetailedError}
					/>
				</div>
			);
		}

		return this.props.children;
	}
}

// 导出错误处理器和类型
export { MDXErrorHandler };
export type { MDXError, MDXErrorBoundaryProps };
