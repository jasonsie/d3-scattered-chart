/**
 * Canvas-specific type definitions for coordinate systems and rendering
 */

// Nominal types for coordinate system safety (prevents mixing data/screen coords)
export type DataX = number & { __brand: 'DataX' };
export type DataY = number & { __brand: 'DataY' };
export type ScreenX = number & { __brand: 'ScreenX' };
export type ScreenY = number & { __brand: 'ScreenY' };

// Viewport state for pan/zoom
export interface Viewport {
  minX: DataX;
  maxX: DataX;
  minY: DataY;
  maxY: DataY;
  scale: number;
  translateX: number;
  translateY: number;
}

// Canvas layer configuration
export interface CanvasLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  zIndex: number;
  clearOnRender: boolean;
  devicePixelRatio: number;
  dirtyRects: DOMRect[];
}

export type DataPointsLayer = CanvasLayer & { zIndex: 0 };
export type PolygonOverlayLayer = CanvasLayer & { zIndex: 1 };

// Coordinate transformation interface
export interface CoordinateTransform {
  toScreen(dataPoint: { x: DataX; y: DataY }): { x: ScreenX; y: ScreenY };
  toData(screenPoint: { x: ScreenX; y: ScreenY }): { x: DataX; y: DataY };
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

// Spatial index for viewport culling
export interface SpatialIndex {
  search(minX: number, minY: number, maxX: number, maxY: number): number[];
}

// Polygon point in screen coordinates
export interface PolygonPoint {
  x: ScreenX;
  y: ScreenY;
}
