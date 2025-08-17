"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoSaveOptions {
	enabled?: boolean;
	onError?: (error: Error) => void;
}

export function useAutoSave(
	content: string,
	onSave: () => void | Promise<void>,
	delay: number = 2000,
	options: UseAutoSaveOptions = {},
) {
	const { enabled = true, onError } = options;
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastContentRef = useRef(content);
	const isInitialMount = useRef(true);

	// 执行保存
	const performSave = useCallback(async () => {
		if (!enabled || isSaving) return;

		try {
			setIsSaving(true);
			await onSave();
			setLastSaved(new Date());
			setHasUnsavedChanges(false);
			lastContentRef.current = content;
		} catch (error) {
			console.error("Auto-save failed:", error);
			onError?.(error as Error);
		} finally {
			setIsSaving(false);
		}
	}, [content, onSave, enabled, isSaving, onError]);

	// 内容变化时触发自动保存
	useEffect(() => {
		// 跳过初始挂载
		if (isInitialMount.current) {
			isInitialMount.current = false;
			lastContentRef.current = content;
			return;
		}

		// 内容没有变化时不保存
		if (content === lastContentRef.current) {
			return;
		}

		setHasUnsavedChanges(true);

		// 如果未启用自动保存，直接返回
		if (!enabled) return;

		// 清除之前的定时器
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// 设置新的定时器
		timeoutRef.current = setTimeout(() => {
			performSave();
		}, delay);

		// 清理函数
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [content, delay, enabled, performSave]);

	// 组件卸载时清理定时器
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// 页面卸载前保存未保存的更改
	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (hasUnsavedChanges && enabled) {
				event.preventDefault();
				event.returnValue = "您有未保存的更改，确定要离开吗？";

				// 尝试同步保存（可能不会成功）
				if (typeof onSave === "function") {
					try {
						const result = onSave();
						if (result instanceof Promise) {
							// 异步保存在页面卸载时可能不会完成
							console.warn(
								"Attempting to save before page unload, but async save may not complete",
							);
						}
					} catch (error) {
						console.error("Failed to save before page unload:", error);
					}
				}
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges, enabled, onSave]);

	// 手动保存函数
	const manualSave = useCallback(async () => {
		// 清除自动保存定时器
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		await performSave();
	}, [performSave]);

	// 取消自动保存
	const cancelAutoSave = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	return {
		isSaving,
		lastSaved,
		hasUnsavedChanges,
		manualSave,
		cancelAutoSave,
	};
}
