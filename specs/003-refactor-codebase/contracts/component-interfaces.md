# Component Interfaces Contract

**Date**: 2025-12-02  
**Version**: 1.0.0

## Purpose

Defines TypeScript interfaces for all React components after refactoring. Each component has explicit prop types and single responsibility.

---

## Chart Component

**Responsibility**: Renders SVG scatter plot with polygons overlay

```typescript
interface ChartProps {
  /** Chart container width in pixels */
  width: number;
  /** Chart container height in pixels */
  height: number;
  /** Optional class name for styling */
  className?: string;
}

/**
 * Main scatter plot visualization component.
 * Renders data points, axes, and polygon overlays.
 * Handles zoom/pan transformations.
 */
export default function Chart(props: ChartProps): JSX.Element;
```

**Dependencies**:
- `useChartData()` - Access to data points and scales
- `useChartSelection()` - Access to selected polygons
- `useChartUI()` - Access to draw mode and label visibility

**CSS Module**: `src/styles/Chart.module.css`

---

## Polygon Component

**Responsibility**: Renders single polygon SVG path with selection state

```typescript
interface PolygonProps {
  /** Polygon data including points, color, and style */
  polygon: Polygon;
  /** Whether this polygon is currently selected */
  selected: boolean;
  /** Whether this polygon is currently hovered */
  hovered: boolean;
  /** Callback when polygon is clicked */
  onSelect: (polygon: Polygon) => void;
  /** Callback when polygon is hovered */
  onHover: (polygon: Polygon | null) => void;
}

/**
 * SVG polygon path renderer.
 * Handles visual state (selected, hovered) and user interactions.
 */
export default function Polygon(props: PolygonProps): JSX.Element;
```

**Dependencies**:
- None (pure presentation component)

**CSS Module**: `src/styles/Polygon.module.css`

**Visual States**:
- Default: Fill color with 30% opacity, line style as specified
- Hovered: Stroke width increases, fill opacity 50%
- Selected: Stroke width bold, fill opacity 70%

---

## PopupEditor Component

**Responsibility**: Modal editor for polygon properties (label, colors, line style)

```typescript
interface PopupEditorProps {
  /** Current polygon label text */
  label: string;
  /** Current polygon fill color (hex) */
  color: string;
  /** Current polygon line style */
  line: 'solid' | 'dashed' | 'dotted';
  /** Current polygon dot/vertex color (hex) */
  dot: string;
  /** Callback when Save button clicked */
  onSave: (
    newLabel: string, 
    newColor: string, 
    newLine: 'solid' | 'dashed' | 'dotted', 
    newDot: string
  ) => void;
  /** Callback when Cancel button clicked */
  onClose: () => void;
}

/**
 * Polygon property editor modal.
 * Provides form inputs for editing polygon visual properties.
 */
export default function PopupEditor(props: PopupEditorProps): JSX.Element;
```

**Dependencies**:
- None (controlled component, state managed by parent)

**CSS Module**: `src/styles/PopupEditor.module.css`

**Classes**:
- `.modal` - Fixed position overlay container
- `.backdrop` - Semi-transparent background
- `.form` - Form container
- `.inputGroup` - Label + input wrapper
- `.buttonGroup` - Cancel/Save button container
- `.cancelButton` - Cancel button styling
- `.saveButton` - Save button styling

---

## Sidebar Component

**Responsibility**: Displays list of polygons with statistics

```typescript
interface SidebarProps {
  /** Whether sidebar is expanded or collapsed */
  expanded: boolean;
  /** Callback when expand/collapse button clicked */
  onToggle: () => void;
}

/**
 * Sidebar panel displaying polygon list and selection statistics.
 * Shows polygon count, selected point count, and percentage.
 */
export default function Sidebar(props: SidebarProps): JSX.Element;
```

**Dependencies**:
- `useChartData()` - Access to total point count
- `useChartSelection()` - Access to selected polygons and contained points

**CSS Module**: `src/styles/Sidebar.module.css`

**Classes**:
- `.sidebar` - Main container (width changes based on `expanded`)
- `.header` - Title and toggle button container
- `.toggleButton` - Expand/collapse button
- `.polygonList` - Scrollable list of polygons
- `.polygonItem` - Individual polygon row
- `.polygonItemSelected` - Selected polygon row highlight
- `.statistics` - Footer with count/percentage display

---

## Shared Types

### Polygon

```typescript
interface Polygon {
  /** Unique identifier */
  id: string;
  /** User-defined label */
  label: string;
  /** Fill color (hex format: #RRGGBB) */
  color: string;
  /** Border line style */
  lineStyle: 'solid' | 'dashed' | 'dotted';
  /** Vertex/dot color (hex format: #RRGGBB) */
  dotColor: string;
  /** SVG coordinate points defining polygon boundary */
  points: Point[];
  /** Data points contained within polygon (for statistics) */
  dataPoints: DataPoint[];
}
```

### Point

```typescript
interface Point {
  /** X coordinate (SVG or data space depending on context) */
  x: number;
  /** Y coordinate (SVG or data space depending on context) */
  y: number;
}
```

### DataPoint

```typescript
interface DataPoint {
  /** X coordinate in data space */
  x: number;
  /** Y coordinate in data space */
  y: number;
  /** Cluster identifier from CSV */
  cluster: string;
  /** Additional CSV columns as needed */
  [key: string]: unknown;
}
```

---

## Contract Validation

**Type Safety**: All interfaces enforce TypeScript strict mode
- No implicit `any` types
- All props required unless marked optional with `?`
- Callbacks have explicit parameter and return types

**Runtime Validation**: None required (TypeScript provides compile-time safety)

**Testing**: Manual validation after each component refactoring
- Verify component renders without errors
- Verify all props are consumed correctly
- Verify TypeScript compilation passes with no warnings

---

## Breaking Changes

### From Current Implementation

**Chart.tsx**:
- Now requires explicit `width` and `height` props (previously used window dimensions)
- Context hooks split: `useChartContext()` becomes `useChartData()`, `useChartSelection()`, `useChartUI()`

**Polygon.tsx**:
- Added `selected` and `hovered` boolean props
- Added `onHover` callback

**PopupEditor.tsx**:
- Props unchanged (already well-defined)
- Migration: Replace inline styles with `className={styles.*}`

**Sidebar.tsx**:
- Added `expanded` prop and `onToggle` callback
- Context hooks split (same as Chart)

---

## Migration Checklist

Per component refactoring:

- [ ] Define interface in component file or `/types`
- [ ] Update component signature to use interface
- [ ] Update context hooks (split contexts)
- [ ] Replace inline styles with CSS module classes
- [ ] Add JSDoc comment describing component purpose
- [ ] Run `tsc --noEmit` to verify types
- [ ] Manual testing: render component, interact, verify no errors
- [ ] Check React DevTools for re-render behavior
