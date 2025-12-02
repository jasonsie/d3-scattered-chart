/**
 * Spatial indexing utilities using R-tree (Flatbush) for viewport culling
 */

import Flatbush from 'flatbush';
import type { SpatialIndex } from '../../types/canvas';

/**
 * Build R-tree spatial index for point data
 * 
 * @param points - Array of data points
 * @param getBounds - Function to extract coordinates from point
 * @returns Spatial index for fast range queries
 */
export function buildSpatialIndex<T>(
  points: T[],
  getBounds: (point: T) => { x: number; y: number }
): SpatialIndex {
  const index = new Flatbush(points.length);
  
  points.forEach(point => {
    const { x, y } = getBounds(point);
    // Points have zero area (minX=maxX, minY=maxY)
    index.add(x, y, x, y);
  });
  
  index.finish();
  
  return {
    search: (minX: number, minY: number, maxX: number, maxY: number) => {
      return index.search(minX, minY, maxX, maxY);
    }
  };
}

/**
 * Query spatial index for points in viewport
 * 
 * @param index - Spatial index
 * @param viewport - Viewport bounds in data space
 * @returns Indices of points within viewport
 */
export function queryViewport(
  index: SpatialIndex,
  viewport: { minX: number; maxX: number; minY: number; maxY: number }
): number[] {
  return index.search(
    viewport.minX,
    viewport.minY,
    viewport.maxX,
    viewport.maxY
  );
}

/**
 * Filter data array to visible points only
 * 
 * @param data - Full dataset
 * @param visibleIndices - Indices of visible points
 * @returns Filtered array of visible points
 */
export function filterVisiblePoints<T>(
  data: T[],
  visibleIndices: number[]
): T[] {
  return visibleIndices.map(i => data[i]);
}
