/**
 * Polygon geometry utilities for selection and validation
 */

import * as d3 from 'd3';

/**
 * Check if point is inside polygon (uses D3)
 * 
 * @param point - Point to test (screen coordinates)
 * @param polygon - Polygon vertices (screen coordinates)
 * @returns True if point is inside polygon
 */
export function isPointInPolygon(
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>
): boolean {
  const polygonPath = polygon.map(p => [p.x, p.y] as [number, number]);
  return d3.polygonContains(polygonPath, [point.x, point.y]);
}

/**
 * Calculate area of polygon
 * 
 * @param polygon - Polygon vertices
 * @returns Signed area (positive = counter-clockwise)
 */
export function polygonArea(
  polygon: Array<{ x: number; y: number }>
): number {
  const path = polygon.map(p => [p.x, p.y] as [number, number]);
  return d3.polygonArea(path);
}

/**
 * Check if polygon is valid (minimum 3 points, non-zero area)
 * 
 * @param polygon - Polygon vertices
 * @returns True if polygon is valid
 */
export function isValidPolygon(
  polygon: Array<{ x: number; y: number }>
): boolean {
  if (polygon.length < 3) return false;
  const area = Math.abs(polygonArea(polygon));
  return area > 0.01; // Epsilon for floating point comparison
}

/**
 * Calculate centroid of polygon
 * 
 * @param polygon - Polygon vertices
 * @returns Centroid point
 */
export function polygonCentroid(
  polygon: Array<{ x: number; y: number }>
): { x: number; y: number } {
  const path = polygon.map(p => [p.x, p.y] as [number, number]);
  const [x, y] = d3.polygonCentroid(path);
  return { x, y };
}

/**
 * Check if point is near first polygon point (for auto-close)
 * 
 * @param point - Current mouse position
 * @param firstPoint - First polygon vertex
 * @param threshold - Distance threshold in pixels (default: 10px)
 * @returns True if point is within threshold
 */
export function isNearFirstPoint(
  point: { x: number; y: number },
  firstPoint: { x: number; y: number },
  threshold: number = 10
): boolean {
  const dx = point.x - firstPoint.x;
  const dy = point.y - firstPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < threshold;
}
