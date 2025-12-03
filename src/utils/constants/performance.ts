/**
 * Performance thresholds from constitution
 */
export const PERFORMANCE = {
  MAX_RENDER_TIME_MS: 500,
  SELECTION_FEEDBACK_MS: 100,
  STATS_UPDATE_MS: 200,
  RESIZE_DEBOUNCE_MS: 150,
  PAN_THROTTLE_MS: 16,  // ~60fps
} as const;
