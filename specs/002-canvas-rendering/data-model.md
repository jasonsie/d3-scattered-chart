# Data Model: Canvas-Based Chart Rendering

**Phase**: 1 - Design & Contracts  
**Date**: 2025-12-02  
**Purpose**: Define data structures, entities, and state management for Canvas rendering

---

## Entity Definitions

### 1. DataPoint (Core Entity)

**Purpose**: Represents a single observation in the scatter plot dataset

```typescript
interface DataPoint {
  // Original data coordinates (immutable)
  x: DataX;              // X-axis value in data space
  y: DataY;              // Y-axis value in data space
  
  // Metadata from CSV
  id?: string;           // Optional unique identifier
  label?: string;        // Optional point label
  
  // Derived properties (computed at runtime)
  screenX?: ScreenX;     // Cached screen coordinate (performance optimization)
  screenY?: ScreenY;     // Cached screen coordinate (performance optimization)
  isVisible?: boolean;   // Viewport culling flag
}

// Nominal types for coordinate system safety
type DataX = number & { __brand: 'DataX' };
type DataY = number & { __brand: 'DataY' };
type ScreenX = number & { __brand: 'ScreenX' };
type ScreenY = number & { __brand: 'ScreenY' };
```

**Validation Rules**:
- `x` and `y` must be finite numbers (reject NaN, Infinity)
- `x` must be within domain range [200, 1000] based on existing data
- `y` must be within domain range [0, 1000] based on existing data
- Screen coordinates must be recomputed on scale changes

**Relationships**:
- Belongs to 0 or more `SelectionPolygon` entities (many-to-many)
- Transformed by 1 `CoordinateTransform` instance

**State Transitions**:
- **Loaded** → CSV parsed, data space coordinates populated
- **Indexed** → Added to spatial index (R-tree) for viewport culling
- **Visible** → Inside current viewport bounds
- **Selected** → Inside at least one visible polygon

---

### 2. SelectionPolygon (Interactive Entity)

**Purpose**: User-defined shape for selecting groups of data points

```typescript
interface SelectionPolygon {
  // Identity
  id: number;                    // Unique polygon identifier
  label: string;                 // User-defined name (e.g., "T-cells", "Gate 1")
  
  // Geometry (in screen coordinates)
  points: PolygonPoint[];        // Vertices defining polygon boundary
  
  // Visual styling
  color: string;                 // Fill color (CSS color string, e.g., "#FF0000")
  line: string;                  // Stroke color
  dot: string;                   // Selected point fill color (base layer)
  
  // State flags
  isVisible: boolean;            // Render polygon on canvas
  isComplete: boolean;           // Polygon drawing finished (closed shape)
  
  // Computed properties
  boundingBox?: DOMRect;         // Cached bounding box for optimization
  selectedPointIds?: Set<string>; // IDs of points inside polygon
}

interface PolygonPoint {
  x: ScreenX;                    // Screen coordinate (NOT data coordinate)
  y: ScreenY;
}
```

**Validation Rules**:
- Minimum 3 points to form valid polygon
- Maximum 50 polygons simultaneously (spec constraint)
- Points must not be collinear (area > 0)
- Color must be valid CSS color string
- Opacity applied during rendering (0.2 default per spec)

**Relationships**:
- Contains 0 or more `DataPoint` entities (spatial relationship via point-in-polygon test)
- Owned by 1 `ChartState` instance

**State Transitions**:
- **Drawing** → User clicking to add points (`isComplete: false`)
- **Complete** → User closed polygon (`isComplete: true`)
- **Editing** → User dragging polygon vertices (future feature)
- **Hidden** → User toggled visibility off (`isVisible: false`)
- **Deleted** → Removed from state

**Business Rules**:
- Points inside multiple overlapping polygons belong to ALL polygons independently (spec requirement)
- Dot color is base fill; polygon fill color overlays at 0.2 opacity (spec FR-014a)
- Clicking outside viewport cancels current drawing (spec FR-007a)

---

### 3. Viewport (View State Entity)

**Purpose**: Defines visible region of data space after pan/zoom operations

```typescript
interface Viewport {
  // Data space boundaries
  minX: DataX;
  maxX: DataX;
  minY: DataY;
  maxY: DataY;
  
  // Zoom state
  scale: number;                 // Zoom level (1.0 = default, 2.0 = 2x zoomed in)
  
  // Pan state (offset in screen pixels)
  translateX: number;
  translateY: number;
}
```

**Validation Rules**:
- `minX < maxX` and `minY < maxY` (valid bounds)
- Scale must be positive (> 0)
- Scale clamped to reasonable range (e.g., 0.1x to 10x) to prevent extreme zoom

**Relationships**:
- Determines which `DataPoint` entities are visible
- Affects `CoordinateTransform` scale domains

**State Transitions**:
- **Default** → Initial view showing all data
- **Panned** → User dragged chart (translate changes)
- **Zoomed** → User scrolled/pinched (scale changes)
- **Resized** → Container dimensions changed (preserve zoom/pan, adjust coords proportionally per spec FR-011)

---

### 4. CanvasLayer (Rendering Entity)

**Purpose**: Represents a Canvas element with associated rendering context

```typescript
interface CanvasLayer {
  // DOM reference
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  
  // Layer configuration
  zIndex: number;                // Stacking order (0 = bottom, 1 = top)
  clearOnRender: boolean;        // Whether to clear before each draw
  
  // High-DPI handling
  devicePixelRatio: number;      // Cached DPR for scaling
  
  // Dirty rectangle tracking
  dirtyRects: DOMRect[];         // Regions needing redraw
}

// Specific layer types
type DataPointsLayer = CanvasLayer & { zIndex: 0 };      // Bottom layer
type PolygonOverlayLayer = CanvasLayer & { zIndex: 1 };  // Top layer
```

**Validation Rules**:
- Canvas context must be '2d' (not 'webgl')
- Device pixel ratio must match `window.devicePixelRatio`
- Dirty rects must be within canvas bounds

**Relationships**:
- `DataPointsLayer` renders `DataPoint` entities
- `PolygonOverlayLayer` renders `SelectionPolygon` entities

**State Transitions**:
- **Initialized** → Canvas created, context acquired
- **Scaled** → DPR applied for high-DPI displays
- **Dirty** → Invalidated region added to `dirtyRects`
- **Rendering** → Draw loop executing
- **Clean** → All dirty rects rendered, list cleared

---

### 5. CoordinateTransform (Transform Entity)

**Purpose**: Converts between data space and screen space coordinate systems

```typescript
interface CoordinateTransform {
  // D3 scales (domain = data space, range = screen space)
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  
  // Transformation methods
  toScreen(dataPoint: { x: DataX; y: DataY }): { x: ScreenX; y: ScreenY };
  toData(screenPoint: { x: ScreenX; y: ScreenY }): { x: DataX; y: DataY };
  
  // Viewport integration
  applyViewport(viewport: Viewport): void;
}
```

**Validation Rules**:
- Scale domains must be finite (no Infinity)
- Scale ranges must match canvas dimensions
- Transformations must be invertible (bijective for visible region)

**Relationships**:
- Transforms all `DataPoint` coordinates for rendering
- Transforms `SelectionPolygon` points when converting from screen to data space

**State Transitions**:
- **Initialized** → Scales created with data domains and canvas ranges
- **Updated** → Viewport changed, scales re-computed
- **Invalidated** → Canvas resized, scales must rebuild

---

### 6. SpatialIndex (Performance Entity)

**Purpose**: Accelerates viewport culling via spatial queries

```typescript
interface SpatialIndex {
  // R-tree implementation (flatbush library)
  index: Flatbush;
  
  // Query methods
  search(bounds: {
    minX: DataX;
    maxX: DataX;
    minY: DataY;
    maxY: DataY;
  }): number[];  // Returns indices of points in bounds
  
  // Rebuild method
  rebuild(points: DataPoint[]): void;
}
```

**Validation Rules**:
- Index must be rebuilt when data changes
- Query bounds must be in data space (not screen space)
- Index size must match data point count

**Relationships**:
- Indexes all `DataPoint` entities
- Queried by `Viewport` to determine visible points

**State Transitions**:
- **Building** → Inserting all data points
- **Finished** → Index optimized for queries
- **Querying** → Searching for points in viewport bounds

---

## State Management

### ChartState (Extended)

**Purpose**: Centralized application state managed via React Context + useReducer

```typescript
interface ChartState {
  // Existing state (preserved from SVG implementation)
  data: DataPoint[];
  polygons: SelectionPolygon[];
  selectedPolygonId: number[];
  loading: boolean;
  
  // New Canvas-specific state
  viewport: Viewport;
  spatialIndex: SpatialIndex | null;
  canvasLayers: {
    dataPoints: DataPointsLayer | null;
    polygonOverlay: PolygonOverlayLayer | null;
  };
  coordinateTransform: CoordinateTransform | null;
  
  // Drawing state
  currentPoints: PolygonPoint[];     // Points being drawn (in-progress polygon)
  isDrawing: boolean;
  
  // UI state
  showPopup: { id: number | null; value: boolean };
  checkedPolygons: number[];
}
```

### State Actions (Extended)

```typescript
type ChartAction =
  // Existing actions (preserved)
  | { type: 'INIT'; data: DataPoint[] }
  | { type: 'SET_POLYGONS'; polygons: SelectionPolygon[] }
  | { type: 'UPDATE_POLYGON'; id: number; updates: Partial<SelectionPolygon> }
  | { type: 'DELETE_POLYGON'; id: number }
  
  // New Canvas actions
  | { type: 'SET_VIEWPORT'; viewport: Viewport }
  | { type: 'SET_CANVAS_LAYERS'; layers: { dataPoints?: DataPointsLayer; polygonOverlay?: PolygonOverlayLayer } }
  | { type: 'SET_COORDINATE_TRANSFORM'; transform: CoordinateTransform }
  | { type: 'REBUILD_SPATIAL_INDEX'; index: SpatialIndex }
  | { type: 'INVALIDATE_RECT'; rect: DOMRect; layer: 'dataPoints' | 'polygonOverlay' }
  | { type: 'PAN'; deltaX: number; deltaY: number }
  | { type: 'ZOOM'; scale: number; centerX: ScreenX; centerY: ScreenY };
```

---

## Data Flow Diagrams

### 1. Initial Render Flow

```
[CSV Load] → [Parse DataPoints] → [Build SpatialIndex]
                                           ↓
[Create Canvas Layers] → [Initialize CoordinateTransform] → [Set Default Viewport]
                                           ↓
[Query Visible Points] → [Transform to Screen Coords] → [Render on DataPointsLayer]
```

### 2. Polygon Selection Flow

```
[User Click] → [toData(screenX, screenY)] → [Add PolygonPoint]
                                                  ↓
[User Completes Polygon] → [Point-in-Polygon Test (all DataPoints)]
                                                  ↓
[Update SelectionPolygon.selectedPointIds] → [Invalidate Polygon BoundingBox]
                                                  ↓
[Redraw Dirty Rect on DataPointsLayer] → [Apply Dot + Polygon Fill Colors]
```

### 3. Pan/Zoom Flow

```
[User Interaction] → [Update Viewport] → [CoordinateTransform.applyViewport()]
                                                  ↓
[SpatialIndex.search(new bounds)] → [Get New Visible Points]
                                                  ↓
[Invalidate Full Canvas] → [requestAnimationFrame] → [Redraw All Layers]
```

### 4. Viewport Culling Flow

```
[Viewport Bounds] → [SpatialIndex.search()] → [Visible Point Indices]
                                                       ↓
[Filter DataPoints] → [Set isVisible Flag] → [Only Render Visible Points]
                                                       ↓
[Selection Calculation Uses Full Dataset] (not culled)
```

---

## Migration from SVG Data Model

### Compatibility Considerations

**Existing Polygon Data Format** (SVG-based):
```typescript
// Old: Points stored in screen coordinates (SVG pixels)
interface OldPolygon {
  points: Array<{ x: number; y: number }>;
}
```

**New Polygon Data Format** (Canvas-based):
```typescript
// New: Points stored in screen coordinates (Canvas pixels)
// Same format! No migration needed for geometry.
interface NewPolygon {
  points: Array<{ x: ScreenX; y: ScreenY }>;
}
```

**Migration Strategy**:
✅ **No breaking changes** - Polygon point format remains screen coordinates
✅ **Preserve existing state** - ChartContext state shape backward compatible
✅ **Add optional fields** - New fields (`boundingBox`, `selectedPointIds`) computed on-demand

**Data Validation on Load**:
- Verify all polygon points are within canvas bounds
- Recompute `selectedPointIds` after coordinate transform setup
- Rebuild spatial index if data count changes

---

## Performance Characteristics

### Memory Usage

| Entity | Count | Size per Item | Total Memory |
|--------|-------|---------------|--------------|
| DataPoint | 10,000 | ~50 bytes | ~500 KB |
| SpatialIndex | 1 | ~20 bytes/point | ~200 KB |
| SelectionPolygon | 50 | ~200 bytes | ~10 KB |
| CanvasLayer | 2 | ~1 KB | ~2 KB |
| **Total** | | | **~712 KB** |

**Comparison to SVG**: 50% memory reduction (SVG DOM nodes ~1.4 MB for 10k circles)

### Computational Complexity

| Operation | Algorithm | Complexity | Target Time |
|-----------|-----------|------------|-------------|
| Initial Render | Build R-tree + Draw | O(n log n) + O(k) | <2s for 5000 points |
| Viewport Query | R-tree search | O(log n + k) | <10ms |
| Point-in-Polygon | Ray casting | O(m) per point | <200ms for full dataset |
| Dirty Rect Redraw | Partial render | O(k) visible only | <16ms (60 FPS) |

Where:
- n = total data points
- k = visible data points in viewport
- m = polygon vertex count

---

## Open Design Questions (Resolved)

1. **Q: Should polygon editing use dirty rectangle tracker?**  
   **A**: Yes, invalidate bounding box of dragged vertex + stroke margin.

2. **Q: How should Canvas layers communicate selection state?**  
   **A**: Via ChartState actions. DataPointsLayer subscribes to `selectedPointIds` changes.

3. **Q: Should zoom/pan live in ChartContext or local state?**  
   **A**: ChartContext (Viewport entity) for global access by Sidebar/Editor components.

4. **Q: Migration path for existing SVG polygons?**  
   **A**: No migration needed - screen coordinate format identical.

---

## Next Steps

Phase 1 contracts will define:
- Component prop interfaces for Canvas-based Chart and Polygon components
- Hook APIs for `useCanvasRenderer`, `useViewportCulling`, `usePolygonSelection`
- Event handler signatures for pan/zoom/draw interactions
