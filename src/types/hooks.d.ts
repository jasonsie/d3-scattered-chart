import type { CanvasLayer, CoordinateTransform } from './canvas';

export interface CanvasRendererResult {
  context: CanvasRenderingContext2D | null;
  render: (renderFn: RenderFunction) => void;
  clear: () => void;
  invalidateRect: (rect: DOMRect) => void;
  layer: CanvasLayer | null;
}

export type RenderFunction = (ctx: CanvasRenderingContext2D) => void;

export interface CoordinateTransformResult extends CoordinateTransform {}

export interface PolygonSelectionResult {
  [polygonId: string]: number[];
}

export interface SpatialIndexResult {
  search: (minX: number, minY: number, maxX: number, maxY: number) => number[];
  insert: (index: number, x: number, y: number) => void;
  rebuild: (points: Array<{ x: number; y: number }>) => void;
}
