/**
 * Canvas rendering configuration
 */
export const CANVAS_CONSTANTS = {
  DEFAULT_DPR: 1,
  POINT_RADIUS: 1,
  POINT_RADIUS_HOVERED: 2,
  CLEAR_ON_RENDER: true,
} as const;

export enum CanvasLayerId {
  DataPoints = 'dataPoints',
  PolygonOverlay = 'polygonOverlay',
}
