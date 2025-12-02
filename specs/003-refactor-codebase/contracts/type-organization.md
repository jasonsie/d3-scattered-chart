# Type Organization Contract

**Date**: 2025-12-02  
**Version**: 1.0.0

## Purpose

Defines the organization of TypeScript interfaces and type aliases in `/src/types` directory. Ensures centralized type definitions, prevents circular dependencies, and provides clear domain-based organization.

---

## Directory Structure

```
src/types/
├── canvas.d.ts          # EXISTING - Canvas/rendering types
├── css.d.ts             # EXISTING - CSS module declarations
├── global.d.ts          # EXISTING - Global augmentations
├── components.d.ts      # NEW - Component prop interfaces
├── state.d.ts           # NEW - Context state interfaces  
└── hooks.d.ts           # NEW - Hook return types
```

---

## Existing Type Files (Maintained)

### `canvas.d.ts` - Canvas & Rendering Types

**Purpose**: Types for coordinate systems, viewport, and canvas layers

```typescript
// Nominal types for coordinate system safety
export type DataX = number & { __brand: 'DataX' };
export type DataY = number & { __brand: 'DataY' };
export type ScreenX = number & { __brand: 'ScreenX' };
export type ScreenY = number & { __brand: 'ScreenY' };

// Viewport state for pan/zoom
export interface Viewport {
  minX: DataX;
  maxX: DataX;
  minY: DataY;
  maxY: DataY;
  scale: number;
  translateX: number;
  translateY: number;
}

// Canvas layer configuration
export interface CanvasLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  zIndex: number;
  clearOnRender: boolean;
  devicePixelRatio: number;
  dirtyRects: DOMRect[];
}

// Coordinate transformation interface
export interface CoordinateTransform {
  toScreen(dataPoint: { x: DataX; y: DataY }): { x: ScreenX; y: ScreenY };
  toData(screenPoint: { x: ScreenX; y: ScreenY }): { x: DataX; y: DataY };
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

// Spatial index for viewport culling
export interface SpatialIndex {
  search(minX: number, minY: number, maxX: number, maxY: number): number[];
}

// Polygon point in screen coordinates
export interface PolygonPoint {
  x: ScreenX;
  y: ScreenY;
}
```

---

### `css.d.ts` - CSS Module Declarations

**Purpose**: TypeScript declarations for CSS module imports

```typescript
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
```

---

### `global.d.ts` - Global Type Augmentations

**Purpose**: Global type extensions and declarations

```typescript
// Extend Window interface if needed
declare global {
  interface Window {
    // Custom window properties if any
  }
}

export {};
```

---

## New Type Files (Created in Refactoring)

### `components.d.ts` - Component Prop Interfaces

**Purpose**: TypeScript interfaces for all component props

```typescript
import type { CSSProperties } from 'react';

// Chart component props
export interface ChartProps {
  /** Chart container width in pixels */
  width?: number;
  /** Chart container height in pixels */
  height?: number;
  /** Optional class name for styling */
  className?: string;
}

// Polygon component props
export interface PolygonProps {
  /** Polygon data including points, color, and style */
  polygon: Polygon;
  /** Whether this polygon is currently selected */
  selected: boolean;
  /** Whether this polygon is currently hovered */
  hovered: boolean;
  /** Callback when polygon is selected */
  onSelect: (id: string) => void;
  /** Callback when polygon is hovered */
  onHover: (id: string | null) => void;
}

// PopupEditor component props
export interface PopupEditorProps {
  /** Polygon label text */
  label: string;
  /** Polygon fill color (hex) */
  color: string;
  /** Polygon line color (hex) */
  line: string;
  /** Point dot color (hex) */
  dot: string;
  /** Callback when user saves changes */
  onSave: (data: PolygonStyle) => void;
  /** Callback when user closes editor */
  onClose: () => void;
}

// Sidebar component props
export interface SidebarProps {
  /** Whether sidebar is expanded */
  expanded: boolean;
  /** Callback to toggle sidebar */
  onToggle: () => void;
}

// Supporting types
export interface PolygonStyle {
  label: string;
  color: string;
  line: string;
  dot: string;
}

export interface Polygon {
  id: string;
  label: string;
  color: string;
  line: string;
  dot: string;
  points: Point[];
  isVisible: boolean;
}

export interface Point {
  x: number;
  y: number;
}
```

**Usage**:
```typescript
import type { ChartProps } from '@/types/components';

export default function Chart({ width = 800, height = 600 }: ChartProps) {
  // ...
}
```

---

### `state.d.ts` - Context State Interfaces

**Purpose**: State shape for all React contexts

```typescript
import type * as d3 from 'd3';
import type { Polygon } from './components';

// ChartDataContext state (immutable data)
export interface ChartData {
  points: DataPoint[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  margins: Margins;
  loading: boolean;
  error: Error | null;
}

export interface DataPoint {
  x: number;
  y: number;
  cluster: string;
  // Additional CSV columns as needed
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ChartSelectionContext state (mutable selection)
export interface SelectionState {
  polygons: Polygon[];
  currentPoints: Point[];
  selectedPolygonId: number[];
  isDrawing: boolean;
  checkedPolygons: number[];
}

// ChartUIContext state (UI-only state)
export interface UIState {
  showPopup: ShowPopup;
  drawMode: DrawMode;
  sidebarExpanded: boolean;
  showLabels: boolean;
}

export type ShowPopup = 
  | { id: number; value: true }
  | { id: null; value: false };

export type DrawMode = 'select' | 'draw' | 'pan';
```

**Usage**:
```typescript
import type { ChartData, SelectionState } from '@/types/state';

const [data, setData] = useState<ChartData | null>(null);
const [selection, dispatch] = useReducer<SelectionState>(selectionReducer, initialState);
```

---

### `hooks.d.ts` - Hook Return Types

**Purpose**: Return types for custom React hooks

```typescript
// useCanvasRenderer hook
export interface CanvasRendererResult {
  context: CanvasRenderingContext2D | null;
  render: (renderFn: RenderFunction) => void;
  clear: () => void;
  invalidateRect: (rect: DOMRect) => void;
  layer: CanvasLayer | null;
}

export type RenderFunction = (ctx: CanvasRenderingContext2D) => void;

// useCoordinateTransform hook
export interface CoordinateTransformResult {
  toScreen: (dataPoint: { x: DataX; y: DataY }) => { x: ScreenX; y: ScreenY };
  toData: (screenPoint: { x: ScreenX; y: ScreenY }) => { x: DataX; y: DataY };
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

// usePolygonSelection hook
export interface PolygonSelectionResult {
  [polygonId: string]: number[];  // Map of polygon ID -> selected data point indices
}

// useSpatialIndex hook
export interface SpatialIndexResult {
  search: (minX: number, minY: number, maxX: number, maxY: number) => number[];
  insert: (index: number, x: number, y: number) => void;
  rebuild: (points: Array<{ x: number; y: number }>) => void;
}

// useViewportCulling hook
export interface ViewportCullingOptions {
  viewport: Viewport | null;
  spatialIndex: SpatialIndex | null;
  bufferPixels?: number;
}
```

**Usage**:
```typescript
import type { CanvasRendererResult } from '@/types/hooks';

export function useCanvasRenderer(
  canvasRef: RefObject<HTMLCanvasElement>,
  options: CanvasRendererOptions
): CanvasRendererResult {
  // ...
}
```

---

## Import Guidelines

### Type-Only Imports (Prevents Circular Dependencies)

```typescript
// ✅ CORRECT: Type-only import (erased at runtime)
import type { ChartProps } from '@/types/components';
import type { ChartData } from '@/types/state';

// ❌ WRONG: Value import from types (creates runtime dependency)
import { ChartData } from '@/types/state';  // Will fail - no runtime export
```

### Mixed Imports (When Needed)

```typescript
// ✅ CORRECT: Separate type and value imports
import { useState } from 'react';
import type { FC } from 'react';

// ✅ CORRECT: Inline type-only import
import { type ChartProps, Chart } from './Chart';  // If Chart exports type too
```

---

## Circular Dependency Prevention

### Anti-Pattern (Creates Cycle)

```typescript
// ❌ BAD: Type file imports from component
// src/types/components.d.ts
import { useChartData } from '@/contexts/ChartDataContext';  // Runtime import!

export interface ChartProps {
  data: ReturnType<typeof useChartData>;  // Creates cycle!
}
```

### Correct Pattern (Type-Only)

```typescript
// ✅ GOOD: Component imports type-only from types
// src/types/components.d.ts
export interface ChartProps {
  data: ChartData;  // Type reference only
}

// src/components/Chart.tsx
import type { ChartProps } from '@/types/components';  // No cycle
import { useChartData } from '@/contexts/ChartDataContext';  // Runtime import

export default function Chart(props: ChartProps) {
  const data = useChartData();
  // ...
}
```

---

## Migration Checklist

Per component/hook refactoring:

- [ ] Identify all interfaces defined in component file
- [ ] Determine appropriate type file (components, state, hooks)
- [ ] Move interface to type file with JSDoc
- [ ] Export interface from type file
- [ ] Update component to use `import type { ... }`
- [ ] Run `tsc --noEmit` to verify no errors
- [ ] Run ESLint with import/no-cycle rule
- [ ] Verify no circular dependencies

---

## Validation

### TypeScript Compiler Check
```bash
# Full type check
tsc --noEmit

# Check specific file
tsc --noEmit src/components/Chart.tsx
```

### ESLint Circular Dependency Check
```bash
# Check all imports
npm run lint

# Check specific file
npx eslint src/components/Chart.tsx --rule 'import/no-cycle: error'
```

---

## Success Criteria

- ✅ All TypeScript interfaces located in `/src/types` directory (SC-010)
- ✅ Domain-based organization (components, state, hooks) (SC-010)
- ✅ Zero circular dependencies (validated by ESLint)
- ✅ All type imports use `import type { ... }` syntax
- ✅ TypeScript strict mode passes with no errors
