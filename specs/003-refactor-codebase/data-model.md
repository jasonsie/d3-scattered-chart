# Data Model: Codebase Refactoring

**Date**: 2025-12-02  
**Phase**: 1 - Design & Contracts

## Overview

This refactoring maintains existing data structures while reorganizing contexts and adding CSS module entities.

---

## Entities

### 1. ChartData (Immutable Data Context)

**Purpose**: Holds CSV-loaded data points, D3 scales, and chart dimensions  
**Lifecycle**: Loaded once on mount, never mutates  
**Context**: ChartDataContext (read-only)

**Fields**:
```typescript
interface ChartData {
  points: DataPoint[];        // CSV data points (x, y, cluster, etc.)
  xScale: d3.ScaleLinear;     // D3 scale for x-axis
  yScale: d3.ScaleLinear;     // D3 scale for y-axis
  width: number;              // Chart SVG width
  height: number;             // Chart SVG height
  margins: Margins;           // Chart margins (top, right, bottom, left)
}

interface DataPoint {
  x: number;
  y: number;
  cluster: string;
  // ... other CSV columns
}

interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
```

**Validation Rules**:
- `points` must be non-empty array
- `xScale` and `yScale` must be valid D3 scale functions
- `width` and `height` must be positive numbers

---

### 2. SelectionState (Interactive State Context)

**Purpose**: Tracks user polygon selections and hover state  
**Lifecycle**: Mutates via user interactions (click, draw, delete)  
**Context**: ChartSelectionContext + ChartSelectionDispatchContext

**Fields**:
```typescript
interface SelectionState {
  selectedPolygons: Polygon[];
  hoveredPolygon: Polygon | null;
  drawingPolygon: Polygon | null;  // Polygon being drawn (incomplete)
  isDrawing: boolean;
}

interface Polygon {
  id: string;
  label: string;
  color: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  dotColor: string;
  points: Point[];  // SVG coordinates
  dataPoints: DataPoint[];  // Points contained within polygon
}

interface Point {
  x: number;
  y: number;
}
```

**State Transitions**:
- **Start Drawing**: `isDrawing: false → true`, `drawingPolygon: null → Polygon`
- **Add Point**: `drawingPolygon.points` array grows
- **Complete Polygon**: `drawingPolygon → selectedPolygons`, `isDrawing: true → false`
- **Select Polygon**: Add to `selectedPolygons` array
- **Delete Polygon**: Remove from `selectedPolygons` array
- **Hover**: Set `hoveredPolygon` (null when not hovering)

**Validation Rules**:
- Polygon `id` must be unique
- Polygon must have at least 3 points to be valid
- `color` and `dotColor` must be valid hex colors

---

### 3. UIState (UI Control State Context)

**Purpose**: Controls editor visibility, sidebar state, and drawing mode  
**Lifecycle**: Mutates via UI interactions (button clicks, mode toggles)  
**Context**: ChartUIContext + ChartUIDispatchContext

**Fields**:
```typescript
interface UIState {
  editorOpen: boolean;
  editingPolygon: Polygon | null;
  sidebarExpanded: boolean;
  drawMode: 'select' | 'draw' | 'pan';
  showLabels: boolean;
}
```

**State Transitions**:
- **Open Editor**: `editorOpen: false → true`, set `editingPolygon`
- **Close Editor**: `editorOpen: true → false`, clear `editingPolygon`
- **Toggle Sidebar**: `sidebarExpanded: !sidebarExpanded`
- **Change Draw Mode**: Update `drawMode` enum
- **Toggle Labels**: `showLabels: !showLabels`

---

### 4. CSSModule (Style Definition Entity)

**Purpose**: Maps component styles from inline objects to CSS module classes  
**Lifecycle**: Static files, loaded by Next.js CSS pipeline  
**Location**: Co-located with components (e.g., `PopupEditor.module.css`)

**Structure**:
```typescript
// Type definition (not runtime entity)
interface CSSModuleExports {
  [className: string]: string;  // CSS class name → scoped class name
}

// Example usage
import styles from './PopupEditor.module.css';
// styles = { modal: 'PopupEditor_modal__a1b2c', button: 'PopupEditor_button__d3e4f', ... }
```

**Naming Convention**:
- File: `ComponentName.module.css`
- Classes: Camel case (`.modal`, `.saveButton`, `.inputField`)
- Scoped output: `ComponentName_className__hash`

**Relationship to Components**:
```
PopupEditor.tsx → imports → PopupEditor.module.css
Chart.tsx → imports → Chart.module.css
Polygon.tsx → imports → Polygon.module.css
Sidebar.tsx → imports → Sidebar.module.css
```

---

### 5. ConstantDefinition (Named Values Entity)

**Purpose**: Centralize magic numbers and strings for reusability and maintainability  
**Lifecycle**: Static compile-time constants  
**Location**: `/src/utils/constants/`

**Structure**:
```typescript
// Shared constants (used across multiple components)
// src/utils/constants/colors.ts
export const COLORS = {
  POLYGON_DEFAULT: '#808080',
  POINT_UNSELECTED: 'white',
  POINT_SELECTED_ALPHA: 0.4,
  POINT_UNSELECTED_ALPHA: 0.89,
} as const;

// src/utils/constants/dimensions.ts
export const CHART_DIMENSIONS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MARGINS: { top: 20, right: 20, bottom: 50, left: 60 },
} as const;

// Component-specific enums
// src/utils/constants/chart.ts
export const CHART_CONSTANTS = {
  DATA_DOMAIN_X: [200, 1000] as const,
  DATA_DOMAIN_Y: [0, 1000] as const,
  AXIS_LABELS: {
    X: 'CD45-KrO',
    Y: 'SS INT LIN',
  },
} as const;

export const LAYER_Z_INDEX = {
  DATA_POINTS: 0,
  POLYGON_OVERLAY: 1,
  INTERACTION: 2,
  AXES: 3,
} as const;

// src/utils/constants/polygon.ts
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
```

**Categories**:
- **Shared constants**: Used by multiple components (colors, dimensions, performance thresholds)
- **Component-specific enums**: Domain values tied to single component (polygon states, chart domains)

**Validation Rules**:
- All constants use `as const` assertion for type narrowing
- Enum values use string literals for debuggability
- No runtime computation (pure static values)

**Migration Example**:
```typescript
// Before
const margin = { top: 20, right: 20, bottom: 50, left: 60 };
const limitedPolygons = polygons.slice(0, 50);

// After
import { CHART_DIMENSIONS, POLYGON_CONSTANTS } from '@/utils/constants';
const margin = CHART_DIMENSIONS.MARGINS;
const limitedPolygons = polygons.slice(0, POLYGON_CONSTANTS.MAX_POLYGONS);
```

---

### 6. TypeDefinition (Interface/Type Alias Entity)

**Purpose**: Centralize TypeScript interfaces and type aliases in domain-specific files  
**Lifecycle**: Compile-time only (erased at runtime)  
**Location**: `/src/types/`

**Organization** (Domain-based):
```typescript
// Existing files (maintained)
// src/types/canvas.d.ts
export type DataX = number & { __brand: 'DataX' };
export interface Viewport { /* ... */ }
export interface CanvasLayer { /* ... */ }

// src/types/css.d.ts
declare module '*.module.css' { /* ... */ }

// src/types/global.d.ts
// Global type augmentations

// New files (added in refactoring)
// src/types/components.d.ts
export interface ChartProps {
  width?: number;
  height?: number;
}

export interface PolygonProps {
  polygon: Polygon;
  selected: boolean;
  onSelect: (id: string) => void;
}

export interface PopupEditorProps {
  label: string;
  color: string;
  line: string;
  dot: string;
  onSave: (data: PolygonStyle) => void;
  onClose: () => void;
}

export interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

// src/types/state.d.ts
export interface ChartData {
  points: DataPoint[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  margins: Margins;
}

export interface SelectionState {
  selectedPolygons: Polygon[];
  hoveredPolygon: Polygon | null;
  drawingPolygon: Polygon | null;
  isDrawing: boolean;
}

export interface UIState {
  editorOpen: boolean;
  editingPolygon: Polygon | null;
  sidebarExpanded: boolean;
  drawMode: DrawMode;
  showLabels: boolean;
}

export type DrawMode = 'select' | 'draw' | 'pan';

// src/types/hooks.d.ts
export interface CanvasRendererResult {
  context: CanvasRenderingContext2D | null;
  render: (fn: RenderFunction) => void;
  clear: () => void;
}

export interface CoordinateTransformResult {
  toScreen: (data: DataCoord) => ScreenCoord;
  toData: (screen: ScreenCoord) => DataCoord;
}
```

**Import Pattern** (Type-only to prevent circular dependencies):
```typescript
// Component file
import type { ChartProps } from '@/types/components';
import type { ChartData } from '@/types/state';

export default function Chart({ width, height }: ChartProps) {
  const data: ChartData = useChartData();
  // ...
}
```

**Validation Rules**:
- All type imports use `import type { ... }` syntax
- No runtime code in type definition files
- Types organized by domain (components, state, hooks, canvas)
- Circular dependency check via ESLint import/no-cycle rule

**Migration Example**:
```typescript
// Before (types defined in component files)
// src/components/PopupEditor.tsx
interface PopupEditorProps {
  label: string;
  color: string;
  // ...
}

// After (types in centralized location)
// src/types/components.d.ts
export interface PopupEditorProps {
  label: string;
  color: string;
  // ...
}

// src/components/PopupEditor.tsx
import type { PopupEditorProps } from '@/types/components';
```

---

## Component Module Entity

**Purpose**: Self-contained React component with clear responsibilities  
**Lifecycle**: Mounted/unmounted by React  
**Dependencies**: Explicit via props and context hooks

**Template**:
```typescript
/**
 * [Component Purpose]
 * Responsibilities:
 * - [Responsibility 1]
 * - [Responsibility 2]
 */

import styles from './ComponentName.module.css';

interface ComponentNameProps {
  // Explicit prop types
}

export default function ComponentName(props: ComponentNameProps): JSX.Element {
  // Component logic
}
```

**Single Responsibility Examples**:
- **Chart**: Renders scatter plot and polygons (presentation)
- **Polygon**: Renders single polygon SVG path (presentation)
- **PopupEditor**: Edits polygon properties (UI logic)
- **Sidebar**: Displays polygon list and statistics (presentation)

---

## Interface Definition Entity

**Purpose**: TypeScript contract specifying component communication  
**Lifecycle**: Compile-time only (erased at runtime)  
**Location**: Co-located with component or in `/types`

**Examples**:
```typescript
// Component Props Interface
interface ChartProps {
  data: ChartData;
  onPolygonSelect: (polygon: Polygon) => void;
}

// Hook Return Interface
interface PolygonSelectionHook {
  selectedPolygons: Polygon[];
  selectPolygon: (polygon: Polygon) => void;
  deselectPolygon: (id: string) => void;
  clearSelection: () => void;
}

// Context Interface
interface ChartDataContextValue {
  data: ChartData | null;
  loading: boolean;
  error: Error | null;
}
```

---

## Documentation Entity

**Purpose**: Written explanation of architecture and usage  
**Types**: JSDoc (inline), README (repository), Architecture (this spec)  
**Lifecycle**: Updated with code changes

**JSDoc Example**:
```typescript
/**
 * Transforms data coordinates to SVG viewport coordinates.
 * Handles zoom and pan transformations.
 * 
 * @param x - Data space X coordinate
 * @param y - Data space Y coordinate  
 * @param scale - D3 scale function
 * @returns SVG [x, y] coordinates
 * 
 * @example
 * const [svgX, svgY] = dataToSVG(5.2, 3.8, xScale);
 */
```

---

## Relationships

```
ChartData (immutable)
  └── consumed by → Chart, Polygon components
  
SelectionState (mutable)
  ├── updated by → usePolygonSelection hook
  └── consumed by → Chart, Sidebar, PopupEditor
  
UIState (mutable)
  ├── updated by → User interactions
  └── consumed by → All UI components
  
CSSModule
  └── imported by → Component (same name)
  
ConstantDefinition
  ├── shared constants → imported by multiple components
  └── component-specific enums → imported by single domain
  
TypeDefinition
  ├── component types → imported by components
  ├── state types → imported by contexts
  └── hook types → imported by hooks and consumers
  
Component
  ├── imports → CSSModule (styles)
  ├── imports → ConstantDefinition (values)
  ├── imports type → TypeDefinition (interfaces)
  ├── consumes → Context (via hooks)
  └── documents → JSDoc (purpose)
```

---

## Migration Impact

### Context Split Migration
```
Before: ChartContext (all state)
After:  ChartDataContext + ChartSelectionContext + ChartUIContext

Components update from:
  const { data, selectedPolygons, editorOpen } = useChartContext();
  
To:
  const data = useChartData();
  const { selectedPolygons } = useChartSelection();
  const { editorOpen } = useChartUI();
```

### CSS Module Migration
```
Before: <div style={{ position: 'fixed', ... }}>
After:  <div className={styles.modal}>

Files added:
  src/styles/PopupEditor.module.css   # Centralized in styles/ directory
  src/styles/Polygon.module.css
  src/styles/Sidebar.module.css
  
Files updated:
  src/styles/Chart.module.css         # Existing file, remove inline styles
```

### Constants Extraction Migration
```
Before: Magic numbers/strings inline
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const maxPolygons = 50;
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.89;

After: Named constants
  import { CHART_DIMENSIONS, POLYGON_CONSTANTS, COLORS } from '@/utils/constants';
  const margin = CHART_DIMENSIONS.MARGINS;
  const maxPolygons = POLYGON_CONSTANTS.MAX_POLYGONS;
  ctx.fillStyle = COLORS.POINT_UNSELECTED;
  ctx.globalAlpha = COLORS.POINT_UNSELECTED_ALPHA;

Files added:
  src/utils/constants/colors.ts
  src/utils/constants/dimensions.ts
  src/utils/constants/chart.ts
  src/utils/constants/polygon.ts
  src/utils/constants/performance.ts
```

### Type Consolidation Migration
```
Before: Types defined in component files
  // src/components/PopupEditor.tsx
  interface PopupEditorProps { ... }
  
After: Types in centralized /src/types
  // src/types/components.d.ts
  export interface PopupEditorProps { ... }
  
  // src/components/PopupEditor.tsx
  import type { PopupEditorProps } from '@/types/components';

Files added:
  src/types/components.d.ts
  src/types/state.d.ts
  src/types/hooks.d.ts
  
Files updated (types extracted):
  All component files (Chart, Polygon, PopupEditor, Sidebar)
  All hook files (6 hooks in /src/hooks)
  All context files (3 new context files)
```

### Unused Code Cleanup Migration
```
Before: Components with unused imports/variables
  import { useEffect, useState, useMemo } from 'react'; // useMemo unused
  const [unused, setUnused] = useState(0);
  
After: Only used imports/variables remain
  import { useEffect, useState } from 'react';
  // unused state removed

Process per component:
  1. Run ESLint to find unused variables
  2. Run tsc --noUnusedLocals to verify
  3. Manual review of exports
  4. Remove unused code
```

---

## Validation Strategy

**Per Entity**:
- ChartData: Validate on CSV load (non-empty, valid numbers)
- SelectionState: Validate polygon completeness (≥3 points)
- UIState: Enum validation for drawMode
- CSSModule: Build-time validation (Next.js CSS pipeline)
- Interfaces: Compile-time validation (TypeScript)

**Manual Testing**:
- Visual inspection after each component refactoring
- Test all user interactions (draw, select, edit, delete)
- Verify no console errors
- Check React DevTools for re-render counts
