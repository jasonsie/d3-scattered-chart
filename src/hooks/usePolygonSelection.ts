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
import type { DataPropertyName } from '@/types/state';
import { isValidDataPoint } from '@/utils/data/validateData';

export interface PolygonData {
  id: string;
  points: Array<{ x: number; y: number }>;
  isVisible: boolean;
}

export interface SelectionMap {
  [polygonId: string]: number[]; // polygon ID -> array of data point indices
}

/**
 * Hook for calculating polygon selection (T022)
 *
 * @param data - Full dataset
 * @param polygons - Array of polygons with screen coordinates
 * @param coordinateTransform - Transform for converting data to screen coords
 * @param xProperty - X-axis property name (for dynamic axis support)
 * @param yProperty - Y-axis property name (for dynamic axis support)
 * @returns Selection map with polygon ID -> point indices mapping
 */
export function usePolygonSelection<T extends Record<string, number>>(
  data: T[],
  polygons: PolygonData[],
  coordinateTransform: CoordinateTransform | null,
  xProperty: DataPropertyName,
  yProperty: DataPropertyName
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

      // Test each data point (T022 - filter invalid points, use dynamic properties)
      data.forEach((point, index) => {
        // Skip invalid points
        if (!isValidDataPoint(point as any, xProperty, yProperty)) {
          return;
        }

        // Convert data point to screen coordinates using dynamic axis properties
        const screenPos = coordinateTransform.toScreen({
          x: point[xProperty] as DataX,
          y: point[yProperty] as DataY
        });

        // Test if point is inside polygon
        if (d3.polygonContains(polygonPath, [screenPos.x, screenPos.y])) {
          selectedIndices.push(index);
        }
      });

      selectionMap[polygon.id] = selectedIndices;
    });

    return selectionMap;
  }, [data, polygons, coordinateTransform, xProperty, yProperty]);
}
