/**
 * Shared color constants used across multiple components
 */
export const COLORS = {
  POINT_UNSELECTED: 'white',
  POINT_UNSELECTED_ALPHA: 0.89,
  POINT_SELECTED_ALPHA: 0.4,
  POLYGON_DEFAULT: '#808080',
  POLYGON_FILL_ALPHA: 0.2,
  TEXT_PRIMARY: '#666',
} as const;

export type ColorKey = keyof typeof COLORS;
