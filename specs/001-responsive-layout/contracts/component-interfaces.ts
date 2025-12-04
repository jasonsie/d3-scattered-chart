/**
 * Component Interface Contracts: Responsive Layout with Mobile Drawer
 *
 * Feature: 001-responsive-layout
 * Date: 2025-12-04
 *
 * These TypeScript interfaces define the contracts for all new and modified components.
 * These are DESIGN ARTIFACTS, not production code (do not import in src/).
 */

// ============================================================================
// Context State Interfaces
// ============================================================================

/**
 * Viewport mode enumeration
 */
export type ViewportMode = 'mobile' | 'desktop';

/**
 * Extensions to ChartState for responsive layout support
 */
export interface ChartStateResponsiveExtensions {
  /**
   * Whether the mobile drawer is currently open
   * Can only be true when viewportMode === 'mobile'
   */
  isDrawerOpen: boolean;

  /**
   * Current viewport mode based on 768px breakpoint
   * - 'mobile': width < 768px
   * - 'desktop': width >= 768px
   */
  viewportMode: ViewportMode;

  /**
   * Current window inner width in pixels
   * Range: 320px - 2560px (per SC-008)
   */
  viewportWidth: number;

  /**
   * Current window inner height in pixels
   * Used for potential future aspect ratio calculations
   */
  viewportHeight: number;
}

// ============================================================================
// Context Action Interfaces
// ============================================================================

/**
 * Toggle drawer open/close state
 * Dispatched by: DrawerToggleFab onClick
 */
export interface ToggleDrawerAction {
  type: 'TOGGLE_DRAWER';
}

/**
 * Explicitly set drawer open state
 * Dispatched by: MobileDrawer onClose callback
 */
export interface SetDrawerOpenAction {
  type: 'SET_DRAWER_OPEN';
  payload: boolean;
}

/**
 * Update viewport mode and dimensions when breakpoint crosses
 * Dispatched by: useViewport hook in page.tsx
 *
 * Side effect: Auto-closes drawer when transitioning from mobile to desktop
 */
export interface SetViewportModeAction {
  type: 'SET_VIEWPORT_MODE';
  payload: {
    mode: ViewportMode;
    width: number;
    height?: number; // Optional for backward compatibility
  };
}

/**
 * Update viewport dimensions without mode change (micro-optimization)
 * Dispatched by: Resize listener when mode unchanged
 */
export interface SetViewportDimensionsAction {
  type: 'SET_VIEWPORT_DIMENSIONS';
  payload: {
    width: number;
    height: number;
  };
}

/**
 * Union type for all responsive layout actions
 */
export type ResponsiveLayoutActions =
  | ToggleDrawerAction
  | SetDrawerOpenAction
  | SetViewportModeAction
  | SetViewportDimensionsAction;

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * Props for MobileDrawer component
 *
 * Component wraps MUI Drawer with bottom sheet configuration
 * Conditionally renders only in mobile viewport mode
 */
export interface MobileDrawerProps {
  /**
   * Drawer content (typically Sidebar component)
   */
  children: React.ReactNode;

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Optional test ID for integration tests
   */
  'data-testid'?: string;
}

/**
 * Props for DrawerToggleFab component
 *
 * Floating action button positioned at bottom-right
 * Conditionally renders only in mobile viewport mode
 */
export interface DrawerToggleFabProps {
  /**
   * Optional aria-label override
   * Default: "Toggle sidebar drawer"
   */
  'aria-label'?: string;

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Optional test ID for integration tests
   */
  'data-testid'?: string;
}

/**
 * Props for Sidebar component (modified to support responsive mode)
 *
 * Existing component - only new props listed here
 */
export interface SidebarResponsiveExtensions {
  /**
   * Whether sidebar is rendered in drawer context (mobile mode)
   * Used to adjust padding/margins for drawer appearance
   */
  isInDrawer?: boolean;
}

// ============================================================================
// Custom Hook Interfaces
// ============================================================================

/**
 * Return type for useViewport custom hook
 *
 * Hook manages viewport detection with debounced resize listener
 */
export interface ViewportHookResult {
  /**
   * Current viewport mode
   */
  viewportMode: ViewportMode;

  /**
   * Current window width in pixels
   */
  viewportWidth: number;

  /**
   * Current window height in pixels
   */
  viewportHeight: number;

  /**
   * Convenience boolean for mobile mode check
   * Equivalent to: viewportMode === 'mobile'
   */
  isMobile: boolean;

  /**
   * Convenience boolean for desktop mode check
   * Equivalent to: viewportMode === 'desktop'
   */
  isDesktop: boolean;
}

/**
 * Configuration options for useViewport hook
 */
export interface ViewportHookOptions {
  /**
   * Breakpoint threshold in pixels
   * Default: 768 (from spec)
   */
  breakpoint?: number;

  /**
   * Debounce delay in milliseconds
   * Default: 150 (from clarifications)
   */
  debounceMs?: number;

  /**
   * Whether to update viewport dimensions on every resize (even if mode unchanged)
   * Default: true
   */
  trackDimensions?: boolean;
}

// ============================================================================
// Layout Configuration Interface
// ============================================================================

/**
 * Responsive layout configuration constants
 *
 * Centralized configuration for breakpoints, drawer settings, and timing
 */
export interface LayoutConfiguration {
  /**
   * Mobile/desktop breakpoint in pixels
   * mobile: width < MOBILE_BREAKPOINT
   * desktop: width >= MOBILE_BREAKPOINT
   */
  MOBILE_BREAKPOINT: 768;

  /**
   * Drawer height as percentage of viewport height
   * Range: 60-70 (from clarifications, using 65 as middle value)
   */
  DRAWER_HEIGHT_VH: 65;

  /**
   * Border radius for drawer top corners (bottom sheet appearance)
   */
  DRAWER_BORDER_RADIUS: 16;

  /**
   * FAB position from viewport edges
   */
  FAB_POSITION: {
    bottom: 16; // pixels from bottom
    right: 16;  // pixels from right
  };

  /**
   * Resize event debounce delay in milliseconds
   * From clarifications: 150ms
   */
  RESIZE_DEBOUNCE_MS: 150;

  /**
   * Chart container margins (existing, for reference)
   */
  CHART_MARGINS: {
    top: 20;
    right: 20;
    bottom: 50;
    left: 60;
  };
}

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Type guard for ViewportMode
 */
export function isViewportMode(value: unknown): value is ViewportMode {
  return value === 'mobile' || value === 'desktop';
}

/**
 * Type guard for valid viewport dimensions
 */
export function isValidViewportDimensions(
  width: number,
  height: number
): boolean {
  return (
    width >= 320 &&
    width <= 2560 &&
    height > 0 &&
    Number.isFinite(width) &&
    Number.isFinite(height)
  );
}

/**
 * Validates drawer state consistency with viewport mode
 */
export function isValidDrawerState(
  isOpen: boolean,
  viewportMode: ViewportMode
): boolean {
  // Drawer can only be open in mobile mode
  if (isOpen && viewportMode !== 'mobile') {
    console.warn('Invalid state: Drawer cannot be open in desktop mode');
    return false;
  }
  return true;
}

// ============================================================================
// Canvas Dimension Calculation Types
// ============================================================================

/**
 * Result type for canvas dimension calculations
 */
export interface CanvasDimensions {
  /**
   * Container width in CSS pixels
   */
  containerWidth: number;

  /**
   * Container height in CSS pixels
   */
  containerHeight: number;

  /**
   * Canvas element width in device pixels (containerWidth * devicePixelRatio)
   */
  canvasWidth: number;

  /**
   * Canvas element height in device pixels (containerHeight * devicePixelRatio)
   */
  canvasHeight: number;

  /**
   * Device pixel ratio used for scaling
   */
  devicePixelRatio: number;
}

/**
 * Function signature for canvas resize handler
 */
export type CanvasResizeHandler = (
  canvas: HTMLCanvasElement,
  containerWidth: number,
  containerHeight: number
) => CanvasDimensions;

// ============================================================================
// MUI Drawer Configuration Types
// ============================================================================

/**
 * MUI Drawer props configuration for bottom sheet
 *
 * Extracted for reuse and documentation
 */
export interface MUIDrawerBottomSheetConfig {
  /**
   * Drawer anchor point
   */
  anchor: 'bottom';

  /**
   * Whether drawer is open
   */
  open: boolean;

  /**
   * Close handler callback
   */
  onClose: () => void;

  /**
   * Paper component style overrides
   */
  PaperProps: {
    sx: {
      height: string; // e.g., '65vh'
      borderTopLeftRadius: number;
      borderTopRightRadius: number;
    };
  };

  /**
   * Modal component configuration
   */
  ModalProps: {
    /**
     * Whether to keep drawer mounted when closed
     * Set to false for performance (unmount when closed)
     */
    keepMounted: false;
  };
}

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Drawer toggle event handler
 */
export type DrawerToggleHandler = () => void;

/**
 * Viewport resize event handler (debounced)
 */
export type ViewportResizeHandler = (
  width: number,
  height: number,
  mode: ViewportMode
) => void;

/**
 * Canvas redraw trigger (after resize)
 */
export type CanvasRedrawTrigger = () => void;

// ============================================================================
// Integration Points
// ============================================================================

/**
 * Interface for components that need to respond to viewport changes
 */
export interface ViewportAware {
  /**
   * Callback invoked when viewport mode changes
   */
  onViewportModeChange?: (mode: ViewportMode) => void;

  /**
   * Callback invoked when viewport dimensions change
   */
  onViewportResize?: (width: number, height: number) => void;
}

/**
 * Interface for components that need to trigger chart resize
 */
export interface ChartResizeTrigger {
  /**
   * Triggers chart canvas recalculation and redraw
   */
  triggerChartResize: () => void;
}

// ============================================================================
// Constants Export (for reference, not actual values)
// ============================================================================

/**
 * Type-only export of layout configuration
 * Actual values defined in src/constants/layout.ts
 */
export type LAYOUT_CONFIG = LayoutConfiguration;

// ============================================================================
// Export Summary
// ============================================================================

/**
 * Contract Summary:
 *
 * State Extensions:
 * - ChartStateResponsiveExtensions: 4 new state fields
 *
 * Actions:
 * - ResponsiveLayoutActions: 4 new action types
 *
 * Components:
 * - MobileDrawerProps: New drawer wrapper
 * - DrawerToggleFabProps: New FAB component
 * - SidebarResponsiveExtensions: Existing component extensions
 *
 * Hooks:
 * - ViewportHookResult: useViewport return type
 * - ViewportHookOptions: useViewport configuration
 *
 * Utilities:
 * - Type guards for validation
 * - Canvas dimension types
 * - Event handler types
 */
