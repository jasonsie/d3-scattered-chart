/**
 * Custom hook for dirty rectangle tracking
 */

import { useRef, useCallback } from 'react';
import { mergeOverlappingRects, renderWithClip } from '@/utils/canvas/dirtyRectTracking';

interface DirtyRectTracker {
  invalidate: (rect: DOMRect) => void;
  getDirtyRects: () => DOMRect[];
  clear: () => void;
  mergeOverlapping: (rects: DOMRect[]) => DOMRect[];
}

/**
 * Hook for tracking dirty rectangles for partial Canvas updates
 * 
 * @returns Dirty rectangle tracking utilities
 */
export function useDirtyRectTracking(): DirtyRectTracker {
  const dirtyRectsRef = useRef<DOMRect[]>([]);

  const invalidate = useCallback((rect: DOMRect) => {
    dirtyRectsRef.current.push(rect);
  }, []);

  const getDirtyRects = useCallback(() => {
    return dirtyRectsRef.current;
  }, []);

  const clear = useCallback(() => {
    dirtyRectsRef.current = [];
  }, []);

  const mergeOverlapping = useCallback((rects: DOMRect[]) => {
    return mergeOverlappingRects(rects);
  }, []);

  return {
    invalidate,
    getDirtyRects,
    clear,
    mergeOverlapping,
  };
}
