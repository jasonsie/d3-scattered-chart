/**
 * Custom hook for polygon-based point selection
 * 
 * Calculates which data points fall within polygon boundaries
 * using point-in-polygon testing with coordinate transformation
 */

import { useMemo } from 'react';
import * as d3 from 'd3';
import type { CoordinateTransform } from '@/types/canvas';
import type { DataX, DataY } from '@/types/canvas';

export interface PolygonData {
  id: number;
  points: Array<{ x: number; y: number }>;
  isVisible: boolean;
}

export interface SelectionMap {
  [polygonId: number]: number[]; // polygon ID -> array of data point indices
}

/**
 * Hook for calculating polygon selection
 * 
 * @param data - Full dataset
 * @param polygons - Array of polygons with screen coordinates
 * @param coordinateTransform - Transform for converting data to screen coords
 * @returns Selection map with polygon ID -> point indices mapping
 */
export function usePolygonSelection<T extends { x: number; y: number }>(
  data: T[],
  polygons: PolygonData[],
  coordinateTransform: CoordinateTransform | null
): SelectionMap {
  return useMemo(() => {
    // Early return if no transform or no data
    if (!coordinateTransform || data.length === 0) {
      return {};
    }

    const selectionMap: SelectionMap = {};

    // Filter visible polygons with at least 3 points
    const validPolygons = polygons.filter(
      p => p.isVisible && p.points && p.points.length >= 3
    );

    // For each polygon, find all points inside it
    validPolygons.forEach(polygon => {
      const selectedIndices: number[] = [];

      // Convert polygon points to array format for D3
      const polygonPath = polygon.points.map(p => [p.x, p.y] as [number, number]);

      // Test each data point
      data.forEach((point, index) => {
        // Convert data point to screen coordinates
        const screenPos = coordinateTransform.toScreen({
          x: point.x as DataX,
          y: point.y as DataY
        });

        // Test if point is inside polygon
        if (d3.polygonContains(polygonPath, [screenPos.x, screenPos.y])) {
          selectedIndices.push(index);
        }
      });

      selectionMap[polygon.id] = selectedIndices;
    });

    return selectionMap;
  }, [data, polygons, coordinateTransform]);
}
