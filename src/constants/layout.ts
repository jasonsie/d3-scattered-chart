/**
 * Layout configuration constants for responsive design
 * Feature: 001-responsive-layout
 */

export const LAYOUT_CONFIG = {
  // Breakpoints
  MOBILE_BREAKPOINT: 768, // pixels - viewport widths below this are considered mobile

  // Drawer settings
  DRAWER_HEIGHT_VH: 65, // 65vh (within 60-70% range from requirements)
  DRAWER_BORDER_RADIUS: 16, // pixels - top corners for bottom sheet appearance

  // FAB (Floating Action Button) settings
  FAB_POSITION: {
    bottom: 16, // pixels from bottom edge
    right: 16, // pixels from right edge
  },

  // Performance
  RESIZE_DEBOUNCE_MS: 150, // milliseconds - debounce delay for resize events

  // Chart margins (for reference, should match Chart component)
  CHART_MARGINS: {
    top: 20,
    right: 20,
    bottom: 50,
    left: 60,
  },
} as const;
