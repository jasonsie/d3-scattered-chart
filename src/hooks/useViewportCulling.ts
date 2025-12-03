/**
 * Custom hook for viewport culling using spatial index
 */

import { useMemo } from 'react';
import { queryViewport, filterVisiblePoints } from '@/utils/canvas/spatialIndex';
import type { Viewport, SpatialIndex } from '@/types/canvas';

/**
 * Hook for filtering data to only visible items in viewport
 * 
 * @param allItems - Full dataset
 * @param viewport - Current viewport bounds
 * @param spatialIndex - Spatial index for queries
 * @param getBounds - Function to extract coordinates from item
 * @returns Filtered array of visible items
 */
export function useViewportCulling<T>(
  allItems: T[],
  viewport: Viewport | null,
  spatialIndex: SpatialIndex | null,
  getBounds: (item: T) => { x: number; y: number }
): T[] {
  return useMemo(() => {
    // Fallback: return all items if no viewport or index
    if (!viewport || !spatialIndex || allItems.length === 0) {
      return allItems;
    }

    // Query spatial index for visible items
    const visibleIndices = queryViewport(spatialIndex, viewport);
    return filterVisiblePoints(allItems, visibleIndices);
  }, [allItems, viewport, spatialIndex, getBounds]);
}
