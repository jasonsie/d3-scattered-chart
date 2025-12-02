/**
 * Polygon-specific limits and defaults
 */
export const POLYGON_CONSTANTS = {
  MAX_POLYGONS: 50,
  MIN_POINTS: 3,
  DEFAULT_LINE_WIDTH: 2,
  SELECTION_FEEDBACK_MS: 100,
} as const;

export enum PolygonState {
  Idle = 'idle',
  Drawing = 'drawing',
  Selected = 'selected',
  Hovered = 'hovered',
}

export type LineStyle = 'solid' | 'dashed' | 'dotted';
