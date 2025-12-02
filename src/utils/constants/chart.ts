/**
 * Chart-specific configuration values
 */
export const CHART_CONSTANTS = {
  DATA_DOMAIN_X: [200, 1000] as const,
  DATA_DOMAIN_Y: [0, 1000] as const,
  AXIS_LABELS: {
    X: 'CD45-KrO',
    Y: 'SS INT LIN',
  },
  TICK_VALUES_X: [200, 400, 600, 800, 1000] as const,
  TICK_VALUES_Y: [0, 200, 400, 600, 800, 1000] as const,
} as const;

export const LAYER_Z_INDEX = {
  DATA_POINTS: 0,
  POLYGON_OVERLAY: 1,
  INTERACTION: 2,
  AXES: 3,
} as const;

export type LayerType = keyof typeof LAYER_Z_INDEX;
