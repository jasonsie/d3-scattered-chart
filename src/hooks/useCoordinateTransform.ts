/**
 * Custom hook for coordinate transformation between data and screen space
 */

import { useMemo } from 'react';
import * as d3 from 'd3';
import type { CoordinateTransform, Viewport, DataX, DataY, ScreenX, ScreenY } from '@/types/canvas';

/**
 * Hook for creating and managing coordinate transformations
 * 
 * @param dataDomain - Data space domain bounds
 * @param screenRange - Screen space range (canvas dimensions)
 * @param viewport - Current viewport state (for pan/zoom)
 * @returns Coordinate transformation utilities
 */
export function useCoordinateTransform(
  dataDomain: { x: [number, number]; y: [number, number] },
  screenRange: { x: [number, number]; y: [number, number] },
  viewport: Viewport | null
): CoordinateTransform | null {
  return useMemo(() => {
    if (!viewport) return null;

    // Create D3 scales with viewport bounds
    const xScale = d3.scaleLinear()
      .domain([viewport.minX, viewport.maxX])
      .range(screenRange.x);

    const yScale = d3.scaleLinear()
      .domain([viewport.minY, viewport.maxY])
      .range(screenRange.y);

    return {
      toScreen: (dataPoint: { x: DataX; y: DataY }) => ({
        x: xScale(dataPoint.x) as ScreenX,
        y: yScale(dataPoint.y) as ScreenY,
      }),
      toData: (screenPoint: { x: ScreenX; y: ScreenY }) => ({
        x: xScale.invert(screenPoint.x) as DataX,
        y: yScale.invert(screenPoint.y) as DataY,
      }),
      xScale,
      yScale,
    };
  }, [dataDomain, screenRange, viewport]);
}
