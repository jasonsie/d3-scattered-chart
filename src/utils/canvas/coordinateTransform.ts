/**
 * Coordinate transformation utilities for data ↔ screen space conversion
 */

import * as d3 from 'd3';
import type { DataX, DataY, ScreenX, ScreenY, Viewport } from '../../types/canvas';

/**
 * Convert data space coordinates to screen space
 * 
 * @param dataPoint - Point in data coordinate system
 * @param xScale - D3 scale for X axis
 * @param yScale - D3 scale for Y axis
 * @returns Point in screen coordinate system
 */
export function toScreen(
  dataPoint: { x: DataX; y: DataY },
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): { x: ScreenX; y: ScreenY } {
  return {
    x: xScale(dataPoint.x) as ScreenX,
    y: yScale(dataPoint.y) as ScreenY
  };
}

/**
 * Convert screen space coordinates to data space
 * 
 * @param screenPoint - Point in screen coordinate system
 * @param xScale - D3 scale for X axis
 * @param yScale - D3 scale for Y axis
 * @returns Point in data coordinate system
 */
export function toData(
  screenPoint: { x: ScreenX; y: ScreenY },
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): { x: DataX; y: DataY } {
  return {
    x: xScale.invert(screenPoint.x) as DataX,
    y: yScale.invert(screenPoint.y) as DataY
  };
}

/**
 * Check if point is within viewport bounds
 * 
 * @param point - Screen coordinates to check
 * @param viewport - Viewport bounds
 * @returns True if point is inside viewport
 */
export function isWithinViewport(
  point: { x: ScreenX; y: ScreenY },
  viewport: { minX: number; maxX: number; minY: number; maxY: number }
): boolean {
  return (
    point.x >= viewport.minX &&
    point.x <= viewport.maxX &&
    point.y >= viewport.minY &&
    point.y <= viewport.maxY
  );
}

/**
 * Calculate viewport bounds from pan/zoom state
 * 
 * @param baseDomain - Original data domain
 * @param scale - Zoom scale (1.0 = no zoom)
 * @param translateX - Pan offset X
 * @param translateY - Pan offset Y
 * @param screenRange - Canvas dimensions
 * @returns Viewport bounds in data space
 */
export function calculateViewportBounds(
  baseDomain: { x: [DataX, DataX]; y: [DataY, DataY] },
  scale: number,
  translateX: number,
  translateY: number,
  screenRange: { width: number; height: number }
): Viewport {
  const [minX, maxX] = baseDomain.x;
  const [minY, maxY] = baseDomain.y;
  
  const domainWidth = (maxX - minX) / scale;
  const domainHeight = (maxY - minY) / scale;
  
  // Convert translate offset to data space
  const dataOffsetX = (translateX / screenRange.width) * domainWidth;
  const dataOffsetY = (translateY / screenRange.height) * domainHeight;
  
  return {
    minX: (minX + dataOffsetX) as DataX,
    maxX: (minX + dataOffsetX + domainWidth) as DataX,
    minY: (minY + dataOffsetY) as DataY,
    maxY: (minY + dataOffsetY + domainHeight) as DataY,
    scale,
    translateX,
    translateY
  };
}
