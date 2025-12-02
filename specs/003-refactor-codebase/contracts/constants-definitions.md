# Constants Definitions Contract

**Date**: 2025-12-02  
**Version**: 1.0.0

## Purpose

Defines all extracted magic numbers and strings as named constants and enums. Ensures single source of truth for values used across components.

---

## Shared Constants

### Colors (`/src/utils/constants/colors.ts`)

**Purpose**: Centralize color values used across multiple components

```typescript
export const COLORS = {
  // Point rendering colors
  POINT_UNSELECTED: 'white',
  POINT_UNSELECTED_ALPHA: 0.89,
  POINT_SELECTED_ALPHA: 0.4,
  
  // Polygon colors  
  POLYGON_DEFAULT: '#808080',
  POLYGON_FILL_ALPHA: 0.2,
  
  // UI colors
  TEXT_PRIMARY: '#666',
  AXIS_LINE: '#ccc',
} as const;

// Type for autocomplete
export type ColorKey = keyof typeof COLORS;
```

**Usage**:
```typescript
import { COLORS } from '@/utils/constants/colors';

ctx.fillStyle = COLORS.POINT_UNSELECTED;
ctx.globalAlpha = COLORS.POINT_UNSELECTED_ALPHA;
```

---

### Dimensions (`/src/utils/constants/dimensions.ts`)

**Purpose**: Default chart dimensions and layout constants

```typescript
export const CHART_DIMENSIONS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MARGINS: { 
    top: 20, 
    right: 20, 
    bottom: 50, 
    left: 60 
  },
} as const;

export const FONT_SIZES = {
  AXIS_LABEL: 14,
  TICK_LABEL: 12,
  TITLE: 16,
} as const;
```

**Usage**:
```typescript
import { CHART_DIMENSIONS } from '@/utils/constants/dimensions';

const margin = CHART_DIMENSIONS.MARGINS;
const defaultWidth = CHART_DIMENSIONS.DEFAULT_WIDTH;
```

---

### Performance (`/src/utils/constants/performance.ts`)

**Purpose**: Performance thresholds and timing constants

```typescript
export const PERFORMANCE = {
  // Render budgets (from constitution)
  MAX_RENDER_TIME_MS: 500,        // Scatter plot render budget
  SELECTION_FEEDBACK_MS: 100,     // Polygon selection feedback
  STATS_UPDATE_MS: 200,           // Statistics calculation budget
  
  // Debounce/throttle values
  RESIZE_DEBOUNCE_MS: 150,
  PAN_THROTTLE_MS: 16,            // ~60fps
  
  // Canvas optimization
  DEVICE_PIXEL_RATIO_DEFAULT: 1,
  VIEWPORT_CULL_BUFFER: 50,       // Extra pixels around viewport
} as const;
```

**Usage**:
```typescript
import { PERFORMANCE } from '@/utils/constants/performance';

const throttledPan = throttle(handlePan, PERFORMANCE.PAN_THROTTLE_MS);
```

---

## Component-Specific Constants

### Chart Constants (`/src/utils/constants/chart.ts`)

**Purpose**: Chart-specific configuration values

```typescript
export const CHART_CONSTANTS = {
  // Data domains (from CD45_pos.csv analysis)
  DATA_DOMAIN_X: [200, 1000] as const,
  DATA_DOMAIN_Y: [0, 1000] as const,
  
  // Axis configuration
  AXIS_LABELS: {
    X: 'CD45-KrO',
    Y: 'SS INT LIN',
  },
  
  TICK_VALUES_X: [200, 400, 600, 800, 1000] as const,
  TICK_VALUES_Y: [0, 200, 400, 600, 800, 1000] as const,
} as const;

// Layer z-index values
export const LAYER_Z_INDEX = {
  DATA_POINTS: 0,
  POLYGON_OVERLAY: 1,
  INTERACTION: 2,
  AXES: 3,
} as const;

export type LayerType = keyof typeof LAYER_Z_INDEX;
```

**Usage**:
```typescript
import { CHART_CONSTANTS, LAYER_Z_INDEX } from '@/utils/constants/chart';

const xScale = d3.scaleLinear()
  .domain(CHART_CONSTANTS.DATA_DOMAIN_X)
  .range([0, innerWidth]);

<canvas style={{ zIndex: LAYER_Z_INDEX.DATA_POINTS }} />
```

---

### Polygon Constants (`/src/utils/constants/polygon.ts`)

**Purpose**: Polygon-specific limits and styling

```typescript
export const POLYGON_CONSTANTS = {
  // Limits
  MAX_POLYGONS: 50,               // Maximum allowed polygons (T139)
  MIN_POINTS: 3,                  // Minimum points to form valid polygon
  
  // Styling defaults
  DEFAULT_LINE_WIDTH: 2,
  DEFAULT_LINE_STYLE: 'solid' as const,
  
  // Interaction
  SELECTION_FEEDBACK_MS: 100,     // Visual feedback delay
  HOVER_HIGHLIGHT_ALPHA: 0.3,
} as const;

// Polygon state enum
export enum PolygonState {
  Idle = 'idle',
  Drawing = 'drawing',
  Selected = 'selected',
  Hovered = 'hovered',
}

// Line style type
export type LineStyle = 'solid' | 'dashed' | 'dotted';
```

**Usage**:
```typescript
import { POLYGON_CONSTANTS, PolygonState } from '@/utils/constants/polygon';

// Enforce polygon limit
const limitedPolygons = polygons.slice(0, POLYGON_CONSTANTS.MAX_POLYGONS);

// Check state
if (polygon.state === PolygonState.Selected) {
  // ...
}
```

---

### Canvas Constants (`/src/utils/constants/canvas.ts`)

**Purpose**: Canvas rendering configuration

```typescript
export const CANVAS_CONSTANTS = {
  // Device pixel ratio handling
  DEFAULT_DPR: 1,
  
  // Clear flags
  CLEAR_ON_RENDER: true,
  PRESERVE_DRAWING_BUFFER: false,
  
  // Render settings
  POINT_RADIUS: 1,                // Data point circle radius
  POINT_RADIUS_HOVERED: 2,        // Hovered point radius
  
  // Optimization
  DIRTY_RECT_ENABLED: true,
  SPATIAL_INDEX_CELL_SIZE: 50,
} as const;

// Canvas layer identifiers
export enum CanvasLayerId {
  DataPoints = 'dataPoints',
  PolygonOverlay = 'polygonOverlay',
}
```

**Usage**:
```typescript
import { CANVAS_CONSTANTS, CanvasLayerId } from '@/utils/constants/canvas';

ctx.arc(x, y, CANVAS_CONSTANTS.POINT_RADIUS, 0, Math.PI * 2);
```

---

## Validation Rules

1. **Immutability**: All constant objects use `as const` assertion
2. **Naming**: SCREAMING_SNAKE_CASE for constant objects, PascalCase for enums
3. **Type Safety**: Derive types from constants using `typeof` and `keyof`
4. **No Computation**: Constants must be static values (no function calls)
5. **Documentation**: Each constant file has JSDoc explaining purpose

---

## Migration Checklist

Per component refactoring:

- [ ] Identify all magic numbers (dimensions, colors, alphas, z-indexes)
- [ ] Identify all magic strings (labels, enum values, CSS properties)
- [ ] Determine if value is shared or component-specific
- [ ] Extract to appropriate constants file
- [ ] Import constant in component
- [ ] Replace inline value with named constant
- [ ] Verify functionality unchanged (manual testing)
- [ ] Run ESLint to catch unused constants

---

## Type Exports

```typescript
// Auto-derived types for type safety
export type ColorKey = keyof typeof COLORS;
export type LayerType = keyof typeof LAYER_Z_INDEX;
export type PolygonStateType = PolygonState;
export type LineStyle = 'solid' | 'dashed' | 'dotted';
```

---

## Success Criteria

- ✅ Zero magic numbers in component logic (SC-009)
- ✅ Zero magic strings in component logic (SC-009)
- ✅ All constants documented with JSDoc
- ✅ Constants organized by domain (shared vs component-specific)
- ✅ Type-safe constant usage (TypeScript autocomplete works)
