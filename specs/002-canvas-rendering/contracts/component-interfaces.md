# Component Interface Contract: Canvas Chart

**Purpose**: Defines the API contract for the Canvas-based Chart component

---

## Chart Component

### Props Interface

```typescript
interface ChartProps {
  width?: number;              // Canvas width in CSS pixels (default: 800)
  height?: number;             // Canvas height in CSS pixels (default: 600)
}
```

**Prop Constraints**:
- `width` and `height` must be positive integers
- Recommended minimum: 400x300 for usability
- Maximum limited by browser Canvas size limits (~32767px)

**Default Behavior**:
- If no props provided, renders 800x600 canvas
- Automatically handles high-DPI scaling internally

---

### Component Structure

```typescript
const Chart: React.FC<ChartProps> = ({ width = 800, height = 600 }) => {
  // Returns layered canvas elements
  return (
    <div className={styles.chartContainer}>
      <canvas ref={dataLayerRef} className={styles.dataLayer} />
      <canvas ref={polygonLayerRef} className={styles.polygonLayer} />
      <Polygon /* polygon interaction overlay */ />
    </div>
  );
};
```

**DOM Structure**:
```html
<div class="chartContainer">
  <!-- Layer 0: Data points -->
  <canvas class="dataLayer" style="z-index: 0; position: absolute;"></canvas>
  
  <!-- Layer 1: Polygon overlays -->
  <canvas class="polygonLayer" style="z-index: 1; position: absolute;"></canvas>
  
  <!-- Layer 2: Interactive polygon drawing (React component) -->
  <svg class="interactionLayer" style="z-index: 2; position: absolute;">
    <!-- Polygon component renders here during drawing -->
  </svg>
</div>
```

**Responsibilities**:
- Initialize Canvas contexts with device pixel ratio scaling
- Subscribe to ChartContext for data, viewport, and polygon state
- Render data points on dataLayer canvas
- Render completed polygons on polygonLayer canvas
- Delegate polygon drawing interactions to Polygon component
- Handle pan/zoom events and update viewport state
- Trigger viewport culling on viewport changes

---

### State Dependencies (from ChartContext)

**Required State**:
```typescript
const {
  data,              // DataPoint[] - all data points
  polygons,          // SelectionPolygon[] - all polygons
  viewport,          // Viewport - current view bounds
  coordinateTransform, // CoordinateTransform - data↔screen mapping
  spatialIndex,      // SpatialIndex - for viewport culling
  loading            // boolean - data loading state
} = useChartState();
```

**Dispatched Actions**:
```typescript
dispatch({ type: 'SET_VIEWPORT', viewport: newViewport });
dispatch({ type: 'SET_CANVAS_LAYERS', layers: { dataPoints, polygonOverlay } });
dispatch({ type: 'SET_COORDINATE_TRANSFORM', transform });
dispatch({ type: 'REBUILD_SPATIAL_INDEX', index });
dispatch({ type: 'INVALIDATE_RECT', rect, layer: 'dataPoints' });
```

---

### Lifecycle Hooks

#### Initialization Hook

```typescript
useEffect(() => {
  // Setup canvas contexts on mount
  if (!dataLayerRef.current || !polygonLayerRef.current) return;
  
  const dataCtx = setupCanvas(dataLayerRef.current);
  const polygonCtx = setupCanvas(polygonLayerRef.current);
  
  dispatch({
    type: 'SET_CANVAS_LAYERS',
    layers: {
      dataPoints: { canvas: dataLayerRef.current, context: dataCtx, ... },
      polygonOverlay: { canvas: polygonLayerRef.current, context: polygonCtx, ... }
    }
  });
  
  // Initialize coordinate transform with D3 scales
  const xScale = d3.scaleLinear().domain([200, 1000]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 1000]).range([height, 0]);
  const transform = new D3CoordinateTransform(xScale, yScale);
  
  dispatch({ type: 'SET_COORDINATE_TRANSFORM', transform });
  
  // Build spatial index for viewport culling
  const index = buildSpatialIndex(data);
  dispatch({ type: 'REBUILD_SPATIAL_INDEX', index });
  
  // Cleanup on unmount
  return () => {
    cancelAllAnimationFrames();
  };
}, []); // Run once on mount
```

#### Data Rendering Hook

```typescript
useEffect(() => {
  if (!canvasLayers.dataPoints || !data.length) return;
  
  const { context } = canvasLayers.dataPoints;
  const visiblePoints = getVisiblePoints(data, viewport, spatialIndex);
  
  const frameId = requestAnimationFrame(() => {
    renderDataPoints(context, visiblePoints, coordinateTransform, polygons);
  });
  
  return () => cancelAnimationFrame(frameId);
}, [data, viewport, polygons, coordinateTransform]); // Re-render on dependencies change
```

#### Polygon Rendering Hook

```typescript
useEffect(() => {
  if (!canvasLayers.polygonOverlay) return;
  
  const { context } = canvasLayers.polygonOverlay;
  const visiblePolygons = polygons.filter(p => p.isVisible && p.isComplete);
  
  const frameId = requestAnimationFrame(() => {
    context.clearRect(0, 0, width, height); // Clear polygon layer
    renderPolygons(context, visiblePolygons);
  });
  
  return () => cancelAnimationFrame(frameId);
}, [polygons, viewport]); // Re-render on polygon or viewport changes
```

---

### Event Handlers

#### Pan Handler

```typescript
const handlePan = (event: MouseEvent | TouchEvent) => {
  const deltaX = event.clientX - lastPointerPosition.x;
  const deltaY = event.clientY - lastPointerPosition.y;
  
  dispatch({
    type: 'PAN',
    deltaX,
    deltaY
  });
  
  // Viewport culling will automatically update in render hook
};
```

**Trigger**: Mouse drag or touch drag on canvas  
**Effect**: Updates viewport translateX/translateY, triggers re-render

#### Zoom Handler

```typescript
const handleZoom = (event: WheelEvent) => {
  event.preventDefault();
  
  const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1; // 10% zoom steps
  const newScale = viewport.scale * zoomDelta;
  
  // Zoom centered on mouse position
  const centerX = event.clientX as ScreenX;
  const centerY = event.clientY as ScreenY;
  
  dispatch({
    type: 'ZOOM',
    scale: clamp(newScale, 0.1, 10), // Clamp to reasonable range
    centerX,
    centerY
  });
};
```

**Trigger**: Mouse wheel or pinch gesture  
**Effect**: Updates viewport scale, adjusts translate to zoom around pointer position

#### Resize Handler

```typescript
const handleResize = () => {
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  
  // Preserve zoom/pan, adjust coordinates proportionally (spec FR-011)
  const scaleX = rect.width / width;
  const scaleY = rect.height / height;
  
  dispatch({
    type: 'SET_VIEWPORT',
    viewport: {
      ...viewport,
      translateX: viewport.translateX * scaleX,
      translateY: viewport.translateY * scaleY
    }
  });
  
  // Recreate canvas contexts with new dimensions
  reinitializeCanvasLayers(rect.width, rect.height);
};
```

**Trigger**: Window resize or container dimension change  
**Effect**: Scales viewport proportionally, rebuilds canvas buffers

---

### Performance Contracts

**Initial Render**:
- MUST complete within 2 seconds for 5,000 data points (spec SC-001)
- MUST use viewport culling for datasets >5,000 points

**Interactive Frame Rate**:
- MUST maintain 30+ FPS during pan/zoom (spec FR-004, SC-002)
- MUST use requestAnimationFrame for all rendering
- MUST use dirty rectangle tracking for selection updates

**Memory**:
- MUST use ≤50% memory compared to SVG implementation (spec SC-003)
- MUST not leak Canvas contexts or animation frames on unmount

---

## Polygon Component

### Props Interface

```typescript
interface PolygonProps {
  // No longer receives `g` (SVG group) - now purely interaction layer
}
```

**Responsibilities**:
- Capture click events to add polygon points
- Render temporary drawing indicators (SVG overlay during drawing)
- Dispatch complete polygons to ChartContext
- Handle polygon editing interactions (vertex dragging)

**Integration with Chart**:
- Receives click events from transparent SVG overlay (z-index: 2)
- Converts screen coordinates to data coordinates via `coordinateTransform.toData()`
- Dispatches `ADD_POLYGON_POINT` and `COMPLETE_POLYGON` actions
- Chart component renders completed polygons on Canvas

---

### Drawing Workflow

```typescript
// User clicks to add point
const handleClick = (event: MouseEvent) => {
  const screenX = event.clientX as ScreenX;
  const screenY = event.clientY as ScreenY;
  
  // Check if click is outside viewport bounds (spec FR-007a)
  if (!isWithinViewport(screenX, screenY, viewport)) {
    dispatch({ type: 'CANCEL_POLYGON_DRAWING' });
    return;
  }
  
  dispatch({
    type: 'ADD_POLYGON_POINT',
    point: { x: screenX, y: screenY }
  });
  
  // Auto-complete on close-to-first-point click
  if (isNearFirstPoint(screenX, screenY, currentPoints[0])) {
    dispatch({ type: 'COMPLETE_POLYGON' });
  }
};
```

**State Flow**:
1. User clicks → `ADD_POLYGON_POINT` action
2. ChartContext updates `currentPoints` array
3. Polygon component renders SVG preview
4. User clicks near first point → `COMPLETE_POLYGON` action
5. ChartContext creates `SelectionPolygon` entity
6. Chart component renders polygon on Canvas

---

## PopupEditor Component

### Props Interface (Unchanged)

```typescript
interface PopupEditorProps {
  polygonId: number;
  onClose: () => void;
}
```

**Changes**:
- None - component remains unchanged from SVG implementation
- Still updates polygon metadata (label, color, line, dot) via ChartContext actions
- Chart component listens to polygon state changes and re-renders Canvas

---

## Sidebar Component

### Props Interface (Unchanged)

```typescript
interface SidebarProps {
  // Uses ChartContext, no props
}
```

**Changes**:
- None - component remains unchanged
- Still displays polygon list and selection counts
- Selection count calculation now uses `SelectionPolygon.selectedPointIds` from Canvas-based point-in-polygon test

---

## Integration Testing Contracts

### Render Cycle Test

```typescript
test('Canvas renders data points after initialization', async () => {
  render(<Chart width={800} height={600} />);
  
  // Wait for initial render
  await waitFor(() => {
    const canvas = screen.getByRole('img'); // Canvas has implicit img role
    const ctx = canvas.getContext('2d');
    expect(ctx.__getEvents()).toContainEqual(
      expect.objectContaining({ type: 'arc' }) // Point rendering
    );
  });
});
```

### Viewport Culling Test

```typescript
test('Viewport culling reduces rendered points on zoom', () => {
  const { rerender } = render(<Chart />);
  
  const initialRenderCount = getCanvasDrawCallCount('arc');
  
  // Zoom in 5x
  dispatch({ type: 'ZOOM', scale: 5, centerX: 400, centerY: 300 });
  rerender(<Chart />);
  
  const zoomedRenderCount = getCanvasDrawCallCount('arc');
  expect(zoomedRenderCount).toBeLessThan(initialRenderCount);
});
```

### Polygon Selection Test

```typescript
test('Polygon selection identifies points correctly', () => {
  // Draw polygon
  const polygonPoints = [
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 200 },
    { x: 100, y: 200 }
  ];
  
  polygonPoints.forEach(p => {
    dispatch({ type: 'ADD_POLYGON_POINT', point: p });
  });
  dispatch({ type: 'COMPLETE_POLYGON' });
  
  // Verify selected points
  const state = getChartState();
  const polygon = state.polygons[0];
  expect(polygon.selectedPointIds.size).toBeGreaterThan(0);
  
  // Verify Canvas re-rendered selected points
  expect(getLastCanvasFillStyle()).toContain(polygon.color);
});
```

---

## Breaking Changes from SVG Implementation

### Removed APIs
- ❌ `g` prop on Polygon component (no longer SVG-based)
- ❌ D3 selection manipulation in Polygon component

### Added APIs
- ✅ `coordinateTransform` in ChartContext
- ✅ `viewport` state in ChartContext
- ✅ `spatialIndex` in ChartContext
- ✅ `canvasLayers` in ChartContext

### Behavioral Changes
- Polygon rendering now Canvas-based (visual output identical)
- Viewport culling automatically reduces render count (performance improvement)
- High-DPI scaling automatic (improved visual quality on Retina displays)

### Migration Checklist
- [x] Replace `svgRef` with `canvasRef` in Chart component
- [x] Remove D3 `select()` calls for rendering (keep for data binding)
- [x] Add Canvas setup logic in useEffect hooks
- [x] Implement viewport culling with spatial index
- [x] Add dirty rectangle tracking for partial updates
- [x] Update Polygon component to use SVG overlay for drawing only
- [x] Preserve all existing ChartContext actions (backward compatible)
