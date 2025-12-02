/**
 * Custom hook for building and querying spatial index
 */

import { useMemo } from 'react';
import { buildSpatialIndex } from '@/utils/canvas/spatialIndex';
import type { SpatialIndex } from '@/types/canvas';

/**
 * Hook for creating spatial index for viewport culling
 * 
 * @param data - Full dataset
 * @param getBounds - Function to extract coordinates from data item
 * @returns Spatial index for range queries
 */
export function useSpatialIndex<T>(
  data: T[],
  getBounds: (item: T) => { x: number; y: number }
): SpatialIndex | null {
  return useMemo(() => {
    if (data.length === 0) return null;
    return buildSpatialIndex(data, getBounds);
  }, [data, getBounds]);
}
