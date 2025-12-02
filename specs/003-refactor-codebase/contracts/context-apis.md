# Context APIs Contract

**Date**: 2025-12-02  
**Version**: 1.0.0

## Purpose

Defines React Context APIs after splitting single ChartContext into domain-specific contexts for optimized re-rendering.

---

## ChartDataContext API

**Purpose**: Provides read-only access to immutable chart data (CSV points, scales, dimensions)

**Provider**: `ChartDataProvider`

**Hook**: `useChartData()`

### Type Definition

```typescript
interface ChartData {
  /** Array of data points loaded from CSV */
  points: DataPoint[];
  /** D3 linear scale for X axis */
  xScale: d3.ScaleLinear<number, number>;
  /** D3 linear scale for Y axis */
  yScale: d3.ScaleLinear<number, number>;
  /** Chart SVG width in pixels */
  width: number;
  /** Chart SVG height in pixels */
  height: number;
  /** Chart margins (top, right, bottom, left) */
  margins: { top: number; right: number; bottom: number; left: number };
}

interface ChartDataContextValue {
  /** Chart data (null during loading) */
  data: ChartData | null;
  /** Loading state */
  loading: boolean;
  /** Error if data loading failed */
  error: Error | null;
}
```

### Hook Usage

```typescript
import { useChartData } from '@/contexts/ChartDataContext';

function MyComponent() {
  const { data, loading, error } = useChartData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;
  
  // Use data.points, data.xScale, etc.
}
```

### Provider Setup

```typescript
<ChartDataProvider csvPath="/data/CD45_pos.csv">
  <App />
</ChartDataProvider>
```

**Guarantees**:
- Data never mutates after initial load
- Components subscribing to this context only re-render on initial data load
- Scales are created once and shared across all consumers

---

## ChartSelectionContext API

**Purpose**: Manages polygon selection state with dispatch pattern

**Provider**: `ChartSelectionProvider`

**Hooks**: 
- `useChartSelection()` - Read selection state
- `useChartSelectionDispatch()` - Dispatch selection actions

### Type Definition

```typescript
interface SelectionState {
  /** Array of currently selected polygons */
  selectedPolygons: Polygon[];
  /** Polygon currently being hovered (null if none) */
  hoveredPolygon: Polygon | null;
  /** Polygon currently being drawn (null if not drawing) */
  drawingPolygon: Polygon | null;
  /** Whether user is actively drawing a polygon */
  isDrawing: boolean;
}

type SelectionAction =
  | { type: 'START_DRAWING' }
  | { type: 'ADD_POINT'; payload: Point }
  | { type: 'COMPLETE_POLYGON'; payload: { label: string; color: string; lineStyle: string; dotColor: string } }
  | { type: 'CANCEL_DRAWING' }
  | { type: 'SELECT_POLYGON'; payload: Polygon }
  | { type: 'DESELECT_POLYGON'; payload: string }  // polygon id
  | { type: 'UPDATE_POLYGON'; payload: Polygon }
  | { type: 'DELETE_POLYGON'; payload: string }  // polygon id
  | { type: 'SET_HOVERED'; payload: Polygon | null }
  | { type: 'CLEAR_SELECTION' };

type SelectionDispatch = (action: SelectionAction) => void;
```

### Hook Usage

```typescript
import { useChartSelection, useChartSelectionDispatch } from '@/contexts/ChartSelectionContext';

function MyComponent() {
  const { selectedPolygons, hoveredPolygon, isDrawing } = useChartSelection();
  const dispatch = useChartSelectionDispatch();
  
  const handleStartDrawing = () => {
    dispatch({ type: 'START_DRAWING' });
  };
  
  const handleAddPoint = (point: Point) => {
    dispatch({ type: 'ADD_POINT', payload: point });
  };
  
  const handleSelectPolygon = (polygon: Polygon) => {
    dispatch({ type: 'SELECT_POLYGON', payload: polygon });
  };
}
```

### Reducer Logic

```typescript
function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'START_DRAWING':
      return {
        ...state,
        isDrawing: true,
        drawingPolygon: { id: crypto.randomUUID(), points: [], /* ... */ }
      };
    
    case 'ADD_POINT':
      return {
        ...state,
        drawingPolygon: {
          ...state.drawingPolygon!,
          points: [...state.drawingPolygon!.points, action.payload]
        }
      };
    
    case 'COMPLETE_POLYGON':
      return {
        ...state,
        isDrawing: false,
        selectedPolygons: [
          ...state.selectedPolygons,
          { ...state.drawingPolygon!, ...action.payload }
        ],
        drawingPolygon: null
      };
    
    case 'SELECT_POLYGON':
      return {
        ...state,
        selectedPolygons: [...state.selectedPolygons, action.payload]
      };
    
    case 'DESELECT_POLYGON':
      return {
        ...state,
        selectedPolygons: state.selectedPolygons.filter(p => p.id !== action.payload)
      };
    
    case 'UPDATE_POLYGON':
      return {
        ...state,
        selectedPolygons: state.selectedPolygons.map(p =>
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case 'DELETE_POLYGON':
      return {
        ...state,
        selectedPolygons: state.selectedPolygons.filter(p => p.id !== action.payload)
      };
    
    case 'SET_HOVERED':
      return { ...state, hoveredPolygon: action.payload };
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedPolygons: [] };
    
    default:
      return state;
  }
}
```

**Guarantees**:
- All state updates are predictable and traceable
- Components subscribing only to selection state won't re-render on UI state changes
- Dispatch function identity is stable (won't cause re-renders)

---

## ChartUIContext API

**Purpose**: Manages UI control state (editor visibility, sidebar, draw mode)

**Provider**: `ChartUIProvider`

**Hooks**:
- `useChartUI()` - Read UI state
- `useChartUIDispatch()` - Dispatch UI actions

### Type Definition

```typescript
interface UIState {
  /** Whether polygon editor modal is open */
  editorOpen: boolean;
  /** Polygon being edited (null if editor closed) */
  editingPolygon: Polygon | null;
  /** Whether sidebar is expanded */
  sidebarExpanded: boolean;
  /** Current drawing mode */
  drawMode: 'select' | 'draw' | 'pan';
  /** Whether polygon labels are visible on chart */
  showLabels: boolean;
}

type UIAction =
  | { type: 'OPEN_EDITOR'; payload: Polygon }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_DRAW_MODE'; payload: 'select' | 'draw' | 'pan' }
  | { type: 'TOGGLE_LABELS' };

type UIDispatch = (action: UIAction) => void;
```

### Hook Usage

```typescript
import { useChartUI, useChartUIDispatch } from '@/contexts/ChartUIContext';

function MyComponent() {
  const { editorOpen, editingPolygon, drawMode, showLabels } = useChartUI();
  const dispatch = useChartUIDispatch();
  
  const handleOpenEditor = (polygon: Polygon) => {
    dispatch({ type: 'OPEN_EDITOR', payload: polygon });
  };
  
  const handleSetDrawMode = (mode: 'select' | 'draw' | 'pan') => {
    dispatch({ type: 'SET_DRAW_MODE', payload: mode });
  };
}
```

### Reducer Logic

```typescript
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_EDITOR':
      return {
        ...state,
        editorOpen: true,
        editingPolygon: action.payload
      };
    
    case 'CLOSE_EDITOR':
      return {
        ...state,
        editorOpen: false,
        editingPolygon: null
      };
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarExpanded: !state.sidebarExpanded
      };
    
    case 'SET_DRAW_MODE':
      return {
        ...state,
        drawMode: action.payload
      };
    
    case 'TOGGLE_LABELS':
      return {
        ...state,
        showLabels: !state.showLabels
      };
    
    default:
      return state;
  }
}
```

**Guarantees**:
- Components subscribing only to UI state won't re-render on selection changes
- UI state changes are independent of data/selection state
- Draw mode transitions are explicit and typed

---

## Context Composition

All three contexts wrap the app at root level:

```typescript
// app/layout.tsx or app/page.tsx
<ChartDataProvider csvPath="/data/CD45_pos.csv">
  <ChartSelectionProvider>
    <ChartUIProvider>
      <Chart />
      <Sidebar />
      {editorOpen && <PopupEditor />}
    </ChartUIProvider>
  </ChartSelectionProvider>
</ChartDataProvider>
```

**Composition Rules**:
- ChartDataProvider outermost (provides data to all)
- ChartSelectionProvider middle (may depend on data)
- ChartUIProvider innermost (independent UI state)

---

## Performance Optimization

### Re-render Behavior

**Before (Single Context)**:
```
ChartContext changes → All components re-render
```

**After (Split Contexts)**:
```
ChartData changes → Only Chart, Polygon re-render (Sidebar uses memo)
Selection changes → Only Sidebar, Chart re-render
UI changes → Only affected UI components re-render
```

### Memoization Strategy

```typescript
// Sidebar only cares about selected polygons, not hover state
function Sidebar() {
  const { selectedPolygons } = useChartSelection();  // Will re-render on any selection change
  
  // Memoize derived data to prevent unnecessary calculations
  const statistics = useMemo(() => {
    const totalPoints = selectedPolygons.reduce((sum, p) => sum + p.dataPoints.length, 0);
    const percentage = (totalPoints / data.points.length) * 100;
    return { totalPoints, percentage };
  }, [selectedPolygons, data.points.length]);
}
```

### Context Selectors (Future Enhancement)

If re-renders are still excessive, consider using selectors:

```typescript
// Option: use-context-selector library
import { useContextSelector } from 'use-context-selector';

const selectedCount = useContextSelector(
  ChartSelectionContext,
  (state) => state.selectedPolygons.length
);
// Only re-renders when selectedPolygons.length changes, not on hover/drawing changes
```

---

## Migration Path

### Step 1: Create New Context Files

```
src/contexts/
├── ChartContext.tsx         # OLD - to be removed
├── ChartDataContext.tsx     # NEW
├── ChartSelectionContext.tsx # NEW
└── ChartUIContext.tsx       # NEW
```

### Step 2: Update Components Incrementally

Per component:
1. Replace `useChartContext()` with domain-specific hooks
2. Update action dispatches to use new action types
3. Test component in isolation
4. Verify re-render behavior in React DevTools

### Step 3: Remove Old Context

After all components migrated:
1. Delete `ChartContext.tsx`
2. Remove any remaining imports
3. Run `npm run lint` to catch missed references

---

## Contract Validation

**Type Safety**: All actions are discriminated unions (TypeScript validates exhaustiveness)

**Runtime Safety**: Reducer pattern ensures state updates are predictable

**Testing**: Manual validation per context
- Test each action type
- Verify state transitions match expectations
- Check React DevTools Profiler for re-render optimization

---

## Breaking Changes

**All components** must update from:
```typescript
const { data, selectedPolygons, editorOpen } = useChartContext();
const { dispatch } = useChartDispatch();
dispatch({ type: 'UPDATE_POLYGON', polygon });
```

To:
```typescript
const { data } = useChartData();
const { selectedPolygons } = useChartSelection();
const { editorOpen } = useChartUI();
const selectionDispatch = useChartSelectionDispatch();
selectionDispatch({ type: 'UPDATE_POLYGON', payload: polygon });
```
