"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface ScrollSyncState {
  editorScrollTop: number;
  previewScrollTop: number;
  editorScrollHeight: number;
  previewScrollHeight: number;
  isEditorScrolling: boolean;
  isPreviewScrolling: boolean;
}

export interface UseScrollSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
  syncRatio?: boolean; // Whether to sync by ratio or absolute position
}

export function useScrollSync(options: UseScrollSyncOptions = {}) {
  const { enabled = true, debounceMs = 50, syncRatio = true } = options;

  const [state, setState] = useState<ScrollSyncState>({
    editorScrollTop: 0,
    previewScrollTop: 0,
    editorScrollHeight: 0,
    previewScrollHeight: 0,
    isEditorScrolling: false,
    isPreviewScrolling: false,
  });

  const editorTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previewTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Calculate scroll position based on sync mode
  const calculateSyncPosition = useCallback(
    (
      sourceScrollTop: number,
      sourceScrollHeight: number,
      targetScrollHeight: number
    ) => {
      if (!syncRatio) {
        return sourceScrollTop;
      }

      if (sourceScrollHeight <= 0 || targetScrollHeight <= 0) {
        return 0;
      }

      const ratio = sourceScrollTop / (sourceScrollHeight - window.innerHeight);
      return ratio * (targetScrollHeight - window.innerHeight);
    },
    [syncRatio]
  );

  // Handle editor scroll
  const handleEditorScroll = useCallback(
    (scrollTop: number, scrollHeight: number) => {
      if (!enabled) return;

      setState((prev) => ({
        ...prev,
        editorScrollTop: scrollTop,
        editorScrollHeight: scrollHeight,
        isEditorScrolling: true,
      }));

      // Clear existing timeout
      if (editorTimeoutRef.current) {
        clearTimeout(editorTimeoutRef.current);
      }

      // Debounce scroll end detection
      editorTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isEditorScrolling: false }));
      }, debounceMs);

      // Calculate and set preview scroll position
      if (!state.isPreviewScrolling) {
        const syncedPosition = calculateSyncPosition(
          scrollTop,
          scrollHeight,
          state.previewScrollHeight
        );

        setState((prev) => ({
          ...prev,
          previewScrollTop: syncedPosition,
        }));
      }
    },
    [
      enabled,
      debounceMs,
      calculateSyncPosition,
      state.isPreviewScrolling,
      state.previewScrollHeight,
    ]
  );

  // Handle preview scroll
  const handlePreviewScroll = useCallback(
    (scrollTop: number, scrollHeight: number) => {
      if (!enabled) return;

      setState((prev) => ({
        ...prev,
        previewScrollTop: scrollTop,
        previewScrollHeight: scrollHeight,
        isPreviewScrolling: true,
      }));

      // Clear existing timeout
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }

      // Debounce scroll end detection
      previewTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isPreviewScrolling: false }));
      }, debounceMs);

      // Calculate and set editor scroll position
      if (!state.isEditorScrolling) {
        const syncedPosition = calculateSyncPosition(
          scrollTop,
          scrollHeight,
          state.editorScrollHeight
        );

        setState((prev) => ({
          ...prev,
          editorScrollTop: syncedPosition,
        }));
      }
    },
    [
      enabled,
      debounceMs,
      calculateSyncPosition,
      state.isEditorScrolling,
      state.editorScrollHeight,
    ]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (editorTimeoutRef.current) {
        clearTimeout(editorTimeoutRef.current);
      }
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    handleEditorScroll,
    handlePreviewScroll,
    // Expose scroll positions for manual sync
    editorScrollPosition: state.editorScrollTop,
    previewScrollPosition: state.previewScrollTop,
  };
}

export default useScrollSync;
