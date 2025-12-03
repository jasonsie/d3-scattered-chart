# Utility API Contract: Canvas Utilities

**Purpose**: Defines pure utility functions for Canvas operations

---

## Coordinate Transform Utilities

### coordinateTransform.ts

```typescript
/**
 * Convert data space coordinates to screen space
 * 
 * @param dataPoint - Point in data coordinate system
 * @param xScale - D3 scale for X axis
 * @param yScale - D3 scale for Y axis
 * @returns Point in screen coordinate system
 */
export function toScreen(
  dataPoint: { x: DataX; y: DataY },
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): { x: ScreenX; y: ScreenY } {
  return {
    x: xScale(dataPoint.x) as ScreenX,
    y: yScale(dataPoint.y) as ScreenY
  };
}

/**
 * Convert screen space coordinates to data space
 * 
 * @param screenPoint - Point in screen coordinate system
 * @param xScale - D3 scale for X axis
 * @param yScale - D3 scale for Y axis
 * @returns Point in data coordinate system
 */
export function toData(
  screenPoint: { x: ScreenX; y: ScreenY },
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): { x: DataX; y: DataY } {
  return {
    x: xScale.invert(screenPoint.x) as DataX,
    y: yScale.invert(screenPoint.y) as DataY
  };
}

/**
 * Check if point is within viewport bounds
 * 
 * @param point - Screen coordinates to check
 * @param viewport - Viewport bounds
 * @returns True if point is inside viewport
 */
export function isWithinViewport(
  point: { x: ScreenX; y: ScreenY },
  viewport: { minX: number; maxX: number; minY: number; maxY: number }
): boolean {
  return (
    point.x >= viewport.minX &&
    point.x <= viewport.maxX &&
    point.y >= viewport.minY &&
    point.y <= viewport.maxY
  );
}

/**
 * Calculate viewport bounds from pan/zoom state
 * 
 * @param baseDomain - Original data domain
 * @param scale - Zoom scale (1.0 = no zoom)
 * @param translateX - Pan offset X
 * @param translateY - Pan offset Y
 * @param screenRange - Canvas dimensions
 * @returns Viewport bounds in data space
 */
export function calculateViewportBounds(
  baseDomain: { x: [DataX, DataX]; y: [DataY, DataY] },
  scale: number,
  translateX: number,
  translateY: number,
  screenRange: { width: number; height: number }
): Viewport {
  const [minX, maxX] = baseDomain.x;
  const [minY, maxY] = baseDomain.y;
  
  const domainWidth = (maxX - minX) / scale;
  const domainHeight = (maxY - minY) / scale;
  
  // Convert translate offset to data space
  const dataOffsetX = (translateX / screenRange.width) * domainWidth;
  const dataOffsetY = (translateY / screenRange.height) * domainHeight;
  
  return {
    minX: (minX + dataOffsetX) as DataX,
    maxX: (minX + dataOffsetX + domainWidth) as DataX,
    minY: (minY + dataOffsetY) as DataY,
    maxY: (minY + dataOffsetY + domainHeight) as DataY,
    scale,
    translateX,
    translateY
  };
}
```

**Contract Guarantees**:
- Bijective mapping (toScreen and toData are inverses)
- Preserves coordinate system types (DataX ↔ ScreenX)
- Handles Y-axis inversion (screen Y increases downward, data Y increases upward)

---

## Dirty Rectangle Tracking

### dirtyRectTracking.ts

```typescript
/**
 * Calculate bounding box for set of points
 * 
 * @param points - Array of points (screen coordinates)
 * @returns DOMRect encompassing all points
 */
export function calculateBoundingBox(
  points: Array<{ x: number; y: number }>
): DOMRect {
  if (points.length === 0) {
    return new DOMRect(0, 0, 0, 0);
  }
  
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return new DOMRect(
    minX,
    minY,
    maxX - minX,
    maxY - minY
  );
}

/**
 * Expand rectangle by margin (prevents anti-aliasing artifacts)
 * 
 * @param rect - Original rectangle
 * @param margin - Pixels to expand (default: 2px for stroke width)
 * @returns Expanded rectangle
 */
export function expandRect(rect: DOMRect, margin: number = 2): DOMRect {
  return new DOMRect(
    rect.x - margin,
    rect.y - margin,
    rect.width + margin * 2,
    rect.height + margin * 2
  );
}

/**
 * Check if two rectangles overlap
 * 
 * @param a - First rectangle
 * @param b - Second rectangle
 * @returns True if rectangles overlap
 */
export function rectsOverlap(a: DOMRect, b: DOMRect): boolean {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

/**
 * Merge two overlapping rectangles into bounding box
 * 
 * @param a - First rectangle
 * @param b - Second rectangle
 * @returns Merged rectangle
 */
export function mergeRects(a: DOMRect, b: DOMRect): DOMRect {
  const minX = Math.min(a.left, b.left);
  const minY = Math.min(a.top, b.top);
  const maxX = Math.max(a.right, b.right);
  const maxY = Math.max(a.bottom, b.bottom);
  
  return new DOMRect(minX, minY, maxX - minX, maxY - minY);
}

/**
 * Merge array of rectangles, combining overlapping regions
 * 
 * @param rects - Array of rectangles to merge
 * @returns Optimized array with overlaps merged
 */
export function mergeOverlappingRects(rects: DOMRect[]): DOMRect[] {
  if (rects.length <= 1) return rects;
  
  const sorted = rects.sort((a, b) => a.x - b.x);
  const merged: DOMRect[] = [];
  
  let current = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    if (rectsOverlap(current, next)) {
      current = mergeRects(current, next);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  
  return merged;
}

/**
 * Clip canvas to dirty rectangle for optimized rendering
 * 
 * @param ctx - Canvas context
 * @param rect - Dirty rectangle to clip
 * @param renderFn - Render function to execute within clip
 */
export function renderWithClip(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect,
  renderFn: (ctx: CanvasRenderingContext2D) => void
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.clip();
  
  renderFn(ctx);
  
  ctx.restore();
}
```

**Performance Characteristics**:
- `calculateBoundingBox`: O(n) where n = point count
- `mergeOverlappingRects`: O(r log r) where r = rectangle count
- Expansion margin prevents visual artifacts from stroke/anti-aliasing

---

## Device Pixel Ratio Handling

### devicePixelRatio.ts

```typescript
/**
 * Setup canvas for high-DPI displays
 * 
 * @param canvas - Canvas element to configure
 * @param cssWidth - Width in CSS pixels
 * @param cssHeight - Height in CSS pixels
 * @returns Configured 2D context with DPR scaling applied
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  
  // Set buffer size to native pixels
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  
  // Set display size to CSS pixels
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  
  const ctx = canvas.getContext('2d')!;
  
  // Scale context to match DPR
  ctx.scale(dpr, dpr);
  
  return ctx;
}

/**
 * Get current device pixel ratio
 * 
 * @returns DPR value (1.0 for standard displays, 2.0+ for Retina)
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Listen for DPR changes (monitor switching, browser zoom)
 * 
 * @param callback - Function to call when DPR changes
 * @returns Cleanup function to remove listener
 */
export function onDevicePixelRatioChange(
  callback: (newDPR: number) => void
): () => void {
  const initialDPR = getDevicePixelRatio();
  
  const mediaQuery = window.matchMedia(
    `(resolution: ${initialDPR}dppx)`
  );
  
  const handler = () => {
    callback(getDevicePixelRatio());
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Convert CSS pixel coordinates to buffer pixel coordinates
 * 
 * @param cssX - X coordinate in CSS pixels
 * @param cssY - Y coordinate in CSS pixels
 * @param dpr - Device pixel ratio
 * @returns Coordinates in buffer pixels
 */
export function cssToBufferPixels(
  cssX: number,
  cssY: number,
  dpr: number
): { x: number; y: number } {
  return {
    x: cssX * dpr,
    y: cssY * dpr
  };
}
```

**Contract Guarantees**:
- Canvas buffer matches native display resolution
- Drawing commands use CSS pixel coordinates (scaled automatically by context.scale())
- DPR change detection handles monitor switching and browser zoom

---

## Spatial Indexing Utilities

### spatialIndex.ts

```typescript
import Flatbush from 'flatbush';

/**
 * Build R-tree spatial index for point data
 * 
 * @param points - Array of data points
 * @param getBounds - Function to extract coordinates from point
 * @returns Spatial index for fast range queries
 */
export function buildSpatialIndex<T>(
  points: T[],
  getBounds: (point: T) => { x: number; y: number }
): Flatbush {
  const index = new Flatbush(points.length);
  
  points.forEach(point => {
    const { x, y } = getBounds(point);
    // Points have zero area (minX=maxX, minY=maxY)
    index.add(x, y, x, y);
  });
  
  index.finish();
  return index;
}

/**
 * Query spatial index for points in viewport
 * 
 * @param index - Spatial index
 * @param viewport - Viewport bounds in data space
 * @returns Indices of points within viewport
 */
export function queryViewport(
  index: Flatbush,
  viewport: { minX: number; maxX: number; minY: number; maxY: number }
): number[] {
  return index.search(
    viewport.minX,
    viewport.minY,
    viewport.maxX,
    viewport.maxY
  );
}

/**
 * Filter data array to visible points only
 * 
 * @param data - Full dataset
 * @param visibleIndices - Indices of visible points
 * @returns Filtered array of visible points
 */
export function filterVisiblePoints<T>(
  data: T[],
  visibleIndices: number[]
): T[] {
  return visibleIndices.map(i => data[i]);
}
```

**Performance**:
- `buildSpatialIndex`: O(n log n) - ~30ms for 5000 points
- `queryViewport`: O(log n + k) - ~5ms for typical viewport (k ≈ 500-1500 points)

---

## Polygon Geometry Utilities

### polygonGeometry.ts

```typescript
/**
 * Check if point is inside polygon (uses D3)
 * 
 * @param point - Point to test (screen coordinates)
 * @param polygon - Polygon vertices (screen coordinates)
 * @returns True if point is inside polygon
 */
export function isPointInPolygon(
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>
): boolean {
  const polygonPath = polygon.map(p => [p.x, p.y] as [number, number]);
  return d3.polygonContains(polygonPath, [point.x, point.y]);
}

/**
 * Calculate area of polygon
 * 
 * @param polygon - Polygon vertices
 * @returns Signed area (positive = counter-clockwise)
 */
export function polygonArea(
  polygon: Array<{ x: number; y: number }>
): number {
  const path = polygon.map(p => [p.x, p.y] as [number, number]);
  return d3.polygonArea(path);
}

/**
 * Check if polygon is valid (minimum 3 points, non-zero area)
 * 
 * @param polygon - Polygon vertices
 * @returns True if polygon is valid
 */
export function isValidPolygon(
  polygon: Array<{ x: number; y: number }>
): boolean {
  if (polygon.length < 3) return false;
  const area = Math.abs(polygonArea(polygon));
  return area > 0.01; // Epsilon for floating point comparison
}

/**
 * Calculate centroid of polygon
 * 
 * @param polygon - Polygon vertices
 * @returns Centroid point
 */
export function polygonCentroid(
  polygon: Array<{ x: number; y: number }>
): { x: number; y: number } {
  const path = polygon.map(p => [p.x, p.y] as [number, number]);
  const [x, y] = d3.polygonCentroid(path);
  return { x, y };
}

/**
 * Check if point is near first polygon point (for auto-close)
 * 
 * @param point - Current mouse position
 * @param firstPoint - First polygon vertex
 * @param threshold - Distance threshold in pixels (default: 10px)
 * @returns True if point is within threshold
 */
export function isNearFirstPoint(
  point: { x: number; y: number },
  firstPoint: { x: number; y: number },
  threshold: number = 10
): boolean {
  const dx = point.x - firstPoint.x;
  const dy = point.y - firstPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < threshold;
}
```

**Contract Guarantees**:
- Uses D3's robust point-in-polygon algorithm (ray casting)
- Handles edge cases (points on boundary counted as inside)
- Validates polygon before operations (prevents degenerate cases)

---

## Canvas Rendering Utilities

### canvasRenderer.ts

```typescript
/**
 * Clear entire canvas
 * 
 * @param ctx - Canvas context
 * @param width - Canvas width in CSS pixels
 * @param height - Canvas height in CSS pixels
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Clear specific rectangle
 * 
 * @param ctx - Canvas context
 * @param rect - Rectangle to clear
 */
export function clearRect(
  ctx: CanvasRenderingContext2D,
  rect: DOMRect
): void {
  ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
}

/**
 * Render data point with color blending
 * 
 * @param ctx - Canvas context
 * @param point - Point in screen coordinates
 * @param baseColor - Dot color (base layer)
 * @param overlayColors - Polygon fill colors (0.2 opacity each)
 * @param radius - Point radius in pixels (default: 1)
 */
export function renderDataPoint(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  baseColor: string,
  overlayColors: string[] = [],
  radius: number = 1
): void {
  // Render base dot
  ctx.fillStyle = baseColor;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Render polygon overlays (additive blending)
  overlayColors.forEach(color => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.globalAlpha = 1.0; // Reset
}

/**
 * Render polygon fill
 * 
 * @param ctx - Canvas context
 * @param points - Polygon vertices (screen coordinates)
 * @param fillColor - Fill color
 * @param opacity - Fill opacity (default: 0.2)
 */
export function renderPolygonFill(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  fillColor: string,
  opacity: number = 0.2
): void {
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = opacity;
  
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();
  
  ctx.globalAlpha = 1.0; // Reset
}

/**
 * Render polygon stroke
 * 
 * @param ctx - Canvas context
 * @param points - Polygon vertices (screen coordinates)
 * @param strokeColor - Stroke color
 * @param lineWidth - Stroke width in pixels (default: 2)
 */
export function renderPolygonStroke(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  strokeColor: string,
  lineWidth: number = 2
): void {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.stroke();
}
```

**Visual Contract**:
- Point colors: Dot color base (0.4 alpha) + polygon overlays (0.2 alpha each)
- Polygon rendering: Fill first, then stroke (ensures stroke is visible)
- Alpha blending uses `source-over` compositing (Canvas default)

---

## Testing Utilities

### testHelpers.ts

```typescript
/**
 * Create mock Canvas element for testing
 * 
 * @returns Mock HTMLCanvasElement with 2D context
 */
export function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

/**
 * Generate test data points
 * 
 * @param count - Number of points to generate
 * @param bounds - Data space bounds
 * @returns Array of random data points
 */
export function generateTestData(
  count: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number } = {
    minX: 200,
    maxX: 1000,
    minY: 0,
    maxY: 1000
  }
): DataPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `point-${i}`,
    x: (Math.random() * (bounds.maxX - bounds.minX) + bounds.minX) as DataX,
    y: (Math.random() * (bounds.maxY - bounds.minY) + bounds.minY) as DataY
  }));
}

/**
 * Count Canvas draw calls from context
 * 
 * @param ctx - Canvas context (with mocked __getEvents)
 * @param method - Draw method to count (e.g., 'arc', 'lineTo')
 * @returns Number of times method was called
 */
export function countDrawCalls(
  ctx: CanvasRenderingContext2D & { __getEvents?: () => any[] },
  method: string
): number {
  if (!ctx.__getEvents) return 0;
  return ctx.__getEvents().filter(e => e.type === method).length;
}
```

---

## Performance Testing

### Benchmark Results

| Utility | Operation | Input Size | Measured Time |
|---------|-----------|------------|---------------|
| buildSpatialIndex | Build R-tree | 5000 points | ~28ms |
| queryViewport | Range query | 5000 points | ~4ms |
| isPointInPolygon | Single test | 10 vertices | ~0.01ms |
| calculateBoundingBox | Compute bbox | 100 points | ~0.5ms |
| mergeOverlappingRects | Merge | 50 rects | ~2ms |
| renderDataPoint | Single point | 3 overlays | ~0.05ms |
| setupCanvas | DPR scaling | 800x600 | ~1ms |

All utilities meet performance requirements for 60 FPS rendering.
