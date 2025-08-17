"use client";

import { useCallback, useRef, useEffect } from "react";
import type { editor } from "monaco-editor";

interface SyncScrollOptions {
	/** 是否启用同步滚动 */
	enabled?: boolean;
	/** 滚动同步的延迟（毫秒） */
	debounceDelay?: number;
}

/**
 * 同步滚动 Hook
 *
 * 实现编辑器和预览区域的滚动同步功能
 *
 * 工作原理：
 * 1. 监听编辑器的滚动事件
 * 2. 计算编辑器的滚动百分比
 * 3. 将相同的滚动百分比应用到预览区域
 * 4. 使用防抖避免过度频繁的滚动更新
 */
export function useSyncScroll(options: SyncScrollOptions = {}) {
	const { enabled = true, debounceDelay = 16 } = options; // 16ms ≈ 60fps

	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const previewRef = useRef<HTMLDivElement | null>(null);
	const isScrollingFromEditor = useRef(false);
	const isScrollingFromPreview = useRef(false);
	const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// 设置编辑器引用
	const setEditorRef = useCallback(
		(editorInstance: editor.IStandaloneCodeEditor | null) => {
			editorRef.current = editorInstance;
		},
		[],
	);

	// 设置预览区域引用
	const setPreviewRef = useCallback((previewElement: HTMLDivElement | null) => {
		previewRef.current = previewElement;
	}, []);

	// 从编辑器滚动到预览
	const syncEditorToPreview = useCallback(
		(scrollTop: number, scrollHeight: number, clientHeight: number) => {
			if (!enabled || !previewRef.current || isScrollingFromPreview.current)
				return;

			// 计算滚动百分比
			const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
			const scrollPercentage = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;

			// 应用到预览区域
			const previewElement = previewRef.current;
			const previewMaxScrollTop = Math.max(
				0,
				previewElement.scrollHeight - previewElement.clientHeight,
			);
			const targetScrollTop = previewMaxScrollTop * scrollPercentage;

			console.log("同步编辑器到预览:", {
				scrollPercentage,
				targetScrollTop,
				previewMaxScrollTop,
				previewScrollHeight: previewElement.scrollHeight,
				previewClientHeight: previewElement.clientHeight,
			});

			isScrollingFromEditor.current = true;
			previewElement.scrollTop = targetScrollTop;

			// 清除标志
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
			scrollTimeoutRef.current = setTimeout(() => {
				isScrollingFromEditor.current = false;
			}, debounceDelay * 2);
		},
		[enabled, debounceDelay],
	);

	// 从预览滚动到编辑器
	const syncPreviewToEditor = useCallback(
		(scrollTop: number, scrollHeight: number, clientHeight: number) => {
			if (!enabled || !editorRef.current || isScrollingFromEditor.current)
				return;

			// 计算滚动百分比
			const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
			const scrollPercentage = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;

			// 应用到编辑器
			const editor = editorRef.current;
			const editorScrollHeight = editor.getScrollHeight();
			const editorClientHeight = editor.getLayoutInfo().height;
			const editorMaxScrollTop = Math.max(
				0,
				editorScrollHeight - editorClientHeight,
			);
			const targetScrollTop = editorMaxScrollTop * scrollPercentage;

			isScrollingFromPreview.current = true;
			editor.setScrollTop(targetScrollTop);

			// 清除标志
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
			scrollTimeoutRef.current = setTimeout(() => {
				isScrollingFromPreview.current = false;
			}, debounceDelay * 2);
		},
		[enabled, debounceDelay],
	);

	// 监听编辑器滚动事件
	useEffect(() => {
		if (!enabled || !editorRef.current) return;

		const editor = editorRef.current;

		const handleEditorScroll = () => {
			if (isScrollingFromPreview.current) return;

			const scrollTop = editor.getScrollTop();
			const scrollHeight = editor.getScrollHeight();
			const clientHeight = editor.getLayoutInfo().height;

			console.log("编辑器滚动事件:", { scrollTop, scrollHeight, clientHeight });
			syncEditorToPreview(scrollTop, scrollHeight, clientHeight);
		};

		// 添加滚动监听器
		const disposable = editor.onDidScrollChange(handleEditorScroll);

		console.log("已添加编辑器滚动监听器");

		return () => {
			console.log("移除编辑器滚动监听器");
			disposable.dispose();
		};
	}, [enabled, syncEditorToPreview]);

	// 监听预览区域滚动事件
	useEffect(() => {
		if (!enabled || !previewRef.current) return;

		const previewElement = previewRef.current;

		const handlePreviewScroll = () => {
			if (isScrollingFromEditor.current) return;

			const scrollTop = previewElement.scrollTop;
			const scrollHeight = previewElement.scrollHeight;
			const clientHeight = previewElement.clientHeight;

			syncPreviewToEditor(scrollTop, scrollHeight, clientHeight);
		};

		// 使用防抖处理滚动事件
		let timeoutId: NodeJS.Timeout | null = null;
		const debouncedHandlePreviewScroll = () => {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(handlePreviewScroll, debounceDelay);
		};

		previewElement.addEventListener("scroll", debouncedHandlePreviewScroll, {
			passive: true,
		});

		return () => {
			previewElement.removeEventListener(
				"scroll",
				debouncedHandlePreviewScroll,
			);
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [enabled, debounceDelay, syncPreviewToEditor]);

	// 清理定时器
	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	return {
		setEditorRef,
		setPreviewRef,
		syncEditorToPreview,
		syncPreviewToEditor,
	};
}

export type { SyncScrollOptions };
