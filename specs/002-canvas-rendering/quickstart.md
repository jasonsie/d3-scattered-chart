# Quickstart Guide: Canvas-Based Chart Rendering

**Branch**: `002-canvas-rendering`  
**Last Updated**: 2025-12-02  
**Target Audience**: Developers implementing the Canvas migration

---

## Overview

This guide helps developers implement HTML5 Canvas rendering to replace the existing SVG-based scatter plot. The migration uses a **dual-layer Canvas architecture** (data points + polygon overlays) with viewport culling for performance optimization.

**Key Technologies**:
- React 19.2 + Next.js 16.0 (existing)
- D3.js 7.9 for data binding and scales
- HTML5 Canvas API for rendering
- Flatbush for spatial indexing (new dependency)

**Performance Goals**:
- Initial render: <2s for 5000 points
- Pan/zoom: 30+ FPS
- Selection calculation: <200ms

---

## Prerequisites

### Required Knowledge
- React hooks (useState, useEffect, useRef, useMemo)
- TypeScript strict mode
- D3.js scales and data binding
- Canvas 2D API basics
- React Context API (existing ChartContext)

### Development Environment
```bash
# Verify Node.js version
node --version  # Should be >=20.9.0

# Install new dependencies
npm install flatbush

# Install testing dependencies
npm install -D vitest @testing-library/react canvas jsdom
```

---

## Architecture Overview

### Layer Structure

```
┌─────────────────────────────────────┐
│  Layer 2: Interaction (SVG)         │  ← Polygon drawing (temporary)
├─────────────────────────────────────┤
│  Layer 1: Polygons (Canvas)         │  ← Completed polygons
├─────────────────────────────────────┤
│  Layer 0: Data Points (Canvas)      │  ← Scatter plot points
└─────────────────────────────────────┘
```

**Why This Design?**
- **Layer 0 (Data)**: Static points, rarely change, viewport culling optimizes rendering
- **Layer 1 (Polygons)**: Semi-static shapes, only redraw on polygon add/edit/delete
- **Layer 2 (Interaction)**: SVG overlay for drawing (Canvas doesn't provide click hit testing for free)

### Data Flow

```
CSV → DataPoints → SpatialIndex → ViewportCulling → Canvas Render
                       ↓                                    ↑
                  Polygons → PointInPolygon → SelectionMap ┘
```

---

## Implementation Roadmap

### Phase 1: Setup Canvas Infrastructure (Days 1-2)

**Goal**: Replace SVG with Canvas, render basic scatter plot without polygons

**Tasks**:
1. Create Canvas layer components
2. Setup high-DPI scaling
3. Initialize D3 scales and coordinate transform
4. Build spatial index
5. Implement viewport culling
6. Render data points

**Success Criteria**: Chart displays 4800 points in <2s, pan/zoom works smoothly

---

### Phase 2: Add Polygon Rendering (Days 3-4)

**Goal**: Render completed polygons on Canvas overlay layer

**Tasks**:
1. Create polygon Canvas layer
2. Implement polygon fill/stroke rendering
3. Add color blending for selected points
4. Preserve polygon drawing UI (SVG overlay)
5. Connect selection calculation to Canvas rendering

**Success Criteria**: Polygons render correctly, selected points show color blending

---

### Phase 3: Optimize Performance (Day 5)

**Goal**: Implement dirty rectangle tracking and requestAnimationFrame

**Tasks**:
1. Add dirty rectangle tracker
2. Optimize polygon selection updates
3. Profile rendering performance
4. Tune viewport culling parameters

**Success Criteria**: 30+ FPS during interactions, <200ms selection calculation

---

## Step-by-Step Implementation

### Step 1: Create Canvas Layers

**File**: `src/components/Chart.tsx`

```typescript
const Chart = ({ width = 800, height = 600 }: ChartProps) => {
  // Create refs for Canvas elements
  const dataLayerRef = useRef<HTMLCanvasElement>(null);
  const polygonLayerRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className={styles.chartContainer}>
      {/* Layer 0: Data points */}
      <canvas
        ref={dataLayerRef}
        className={styles.dataLayer}
        style={{ position: 'absolute', zIndex: 0 }}
      />
      
      {/* Layer 1: Polygon overlays */}
      <canvas
        ref={polygonLayerRef}
        className={styles.polygonLayer}
        style={{ position: 'absolute', zIndex: 1 }}
      />
      
      {/* Layer 2: Interaction (SVG - preserve existing Polygon component) */}
      <Polygon />
    </div>
  );
};
```

---

### Step 2: Initialize Canvas Contexts

**File**: `src/utils/canvas/devicePixelRatio.ts`

```typescript
export function setupCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  
  // Scale buffer for high-DPI
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  
  // CSS size remains unchanged
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr); // Auto-scale all draw commands
  
  return ctx;
}
```

**File**: `src/components/Chart.tsx` (initialization hook)

```typescript
useEffect(() => {
  if (!dataLayerRef.current || !polygonLayerRef.current) return;
  
  // Setup Canvas contexts
  const dataCtx = setupCanvas(dataLayerRef.current, width, height);
  const polygonCtx = setupCanvas(polygonLayerRef.current, width, height);
  
  // Store in ChartContext
  dispatch({
    type: 'SET_CANVAS_LAYERS',
    layers: {
      dataPoints: { canvas: dataLayerRef.current, context: dataCtx },
      polygonOverlay: { canvas: polygonLayerRef.current, context: polygonCtx }
    }
  });
}, [width, height, dispatch]);
```

---

### Step 3: Create Coordinate Transform

**File**: `src/utils/canvas/coordinateTransform.ts`

```typescript
export class D3CoordinateTransform implements CoordinateTransform {
  constructor(
    private xScale: d3.ScaleLinear<number, number>,
    private yScale: d3.ScaleLinear<number, number>
  ) {}
  
  toScreen(p: { x: DataX; y: DataY }): { x: ScreenX; y: ScreenY } {
    return {
      x: this.xScale(p.x) as ScreenX,
      y: this.yScale(p.y) as ScreenY
    };
  }
  
  toData(p: { x: ScreenX; y: ScreenY }): { x: DataX; y: DataY } {
    return {
      x: this.xScale.invert(p.x) as DataX,
      y: this.yScale.invert(p.y) as DataY
    };
  }
}
```

**File**: `src/components/Chart.tsx` (setup transform)

```typescript
useEffect(() => {
  // Create D3 scales (same domains as SVG version)
  const xScale = d3.scaleLinear()
    .domain([200, 1000])  // From existing Chart.tsx
    .range([0, width]);
  
  const yScale = d3.scaleLinear()
    .domain([0, 1000])    // From existing Chart.tsx
    .range([height, 0]);  // Note: Y inverted for screen coordinates
  
  const transform = new D3CoordinateTransform(xScale, yScale);
  
  dispatch({ type: 'SET_COORDINATE_TRANSFORM', transform });
  
  // Set default viewport (full data domain)
  dispatch({
    type: 'SET_VIEWPORT',
    viewport: {
      minX: 200 as DataX,
      maxX: 1000 as DataX,
      minY: 0 as DataY,
      maxY: 1000 as DataY,
      scale: 1.0,
      translateX: 0,
      translateY: 0
    }
  });
}, [width, height, dispatch]);
```

---

### Step 4: Build Spatial Index

**File**: `src/utils/canvas/spatialIndex.ts`

```typescript
import Flatbush from 'flatbush';

export function buildSpatialIndex(data: DataPoint[]): Flatbush {
  const index = new Flatbush(data.length);
  
  data.forEach(point => {
    // Points are zero-area (minX = maxX, minY = maxY)
    index.add(point.x, point.y, point.x, point.y);
  });
  
  index.finish();
  return index;
}
```

**File**: `src/components/Chart.tsx` (build index)

```typescript
useEffect(() => {
  if (!data.length) return;
  
  const index = buildSpatialIndex(data);
  dispatch({ type: 'REBUILD_SPATIAL_INDEX', index });
}, [data, dispatch]);
```

---

### Step 5: Implement Viewport Culling

**File**: `src/hooks/useViewportCulling.ts`

```typescript
export function useViewportCulling(
  data: DataPoint[],
  viewport: Viewport,
  spatialIndex: Flatbush | null
): DataPoint[] {
  return useMemo(() => {
    if (!spatialIndex) return data; // Fallback: render all
    
    // Query spatial index for visible points
    const visibleIndices = spatialIndex.search(
      viewport.minX,
      viewport.minY,
      viewport.maxX,
      viewport.maxY
    );
    
    return visibleIndices.map(i => data[i]);
  }, [data, viewport, spatialIndex]);
}
```

**File**: `src/components/Chart.tsx` (use culling)

```typescript
const visiblePoints = useViewportCulling(data, viewport, spatialIndex);
```

---

### Step 6: Render Data Points

**File**: `src/components/Chart.tsx` (render hook)

```typescript
useEffect(() => {
  if (!canvasLayers.dataPoints || !visiblePoints.length) return;
  
  const { context } = canvasLayers.dataPoints;
  
  const frameId = requestAnimationFrame(() => {
    // Clear canvas
    context.clearRect(0, 0, width, height);
    
    // Render visible points
    visiblePoints.forEach(point => {
      const screenPos = coordinateTransform.toScreen(point);
      
      // Base dot color (white default, 0.4 opacity)
      context.fillStyle = 'white';
      context.globalAlpha = 0.4;
      
      context.beginPath();
      context.arc(screenPos.x, screenPos.y, 1, 0, Math.PI * 2);
      context.fill();
    });
    
    context.globalAlpha = 1.0; // Reset
  });
  
  return () => cancelAnimationFrame(frameId);
}, [visiblePoints, coordinateTransform, canvasLayers, width, height]);
```

---

### Step 7: Add Polygon Rendering

**File**: `src/components/Chart.tsx` (polygon render hook)

```typescript
useEffect(() => {
  if (!canvasLayers.polygonOverlay) return;
  
  const { context } = canvasLayers.polygonOverlay;
  const visiblePolygons = polygons.filter(p => p.isVisible && p.isComplete);
  
  const frameId = requestAnimationFrame(() => {
    // Clear polygon layer
    context.clearRect(0, 0, width, height);
    
    // Render each polygon
    visiblePolygons.forEach(polygon => {
      // Fill
      context.fillStyle = polygon.color;
      context.globalAlpha = 0.2;
      
      context.beginPath();
      polygon.points.forEach((p, i) => {
        if (i === 0) context.moveTo(p.x, p.y);
        else context.lineTo(p.x, p.y);
      });
      context.closePath();
      context.fill();
      
      // Stroke
      context.strokeStyle = polygon.line || polygon.color;
      context.lineWidth = 2;
      context.globalAlpha = 1.0;
      context.stroke();
    });
    
    context.globalAlpha = 1.0; // Reset
  });
  
  return () => cancelAnimationFrame(frameId);
}, [polygons, canvasLayers, width, height]);
```

---

### Step 8: Integrate Polygon Selection

**File**: `src/hooks/usePolygonSelection.ts`

```typescript
export function usePolygonSelection(
  data: DataPoint[],
  polygons: SelectionPolygon[],
  transform: CoordinateTransform
): Map<number, Set<string>> {
  return useMemo(() => {
    const selectionMap = new Map();
    
    polygons.forEach(polygon => {
      if (!polygon.isComplete || !polygon.isVisible) return;
      
      const selectedIds = new Set<string>();
      
      // Test ALL data points (not culled - spec requirement)
      data.forEach(point => {
        const screenPos = transform.toScreen(point);
        const polygonPath = polygon.points.map(p => [p.x, p.y]);
        
        if (d3.polygonContains(polygonPath, [screenPos.x, screenPos.y])) {
          selectedIds.add(point.id || `${point.x},${point.y}`);
        }
      });
      
      selectionMap.set(polygon.id, selectedIds);
    });
    
    return selectionMap;
  }, [data, polygons, transform]);
}
```

**File**: `src/components/Chart.tsx` (update point rendering with selection)

```typescript
const selectionMap = usePolygonSelection(data, polygons, coordinateTransform);

// In render loop:
visiblePoints.forEach(point => {
  const screenPos = coordinateTransform.toScreen(point);
  const pointId = point.id || `${point.x},${point.y}`;
  
  // Find which polygons contain this point
  const containingPolygons = Array.from(selectionMap.entries())
    .filter(([_, ids]) => ids.has(pointId))
    .map(([polygonId]) => polygons.find(p => p.id === polygonId))
    .filter(Boolean);
  
  // Base dot color
  const dotColor = containingPolygons[0]?.dot || 'white';
  context.fillStyle = dotColor;
  context.globalAlpha = 0.4;
  context.beginPath();
  context.arc(screenPos.x, screenPos.y, 1, 0, Math.PI * 2);
  context.fill();
  
  // Overlay polygon colors (additive blending)
  containingPolygons.forEach(polygon => {
    context.fillStyle = polygon.color;
    context.globalAlpha = 0.2;
    context.beginPath();
    context.arc(screenPos.x, screenPos.y, 1, 0, Math.PI * 2);
    context.fill();
  });
});
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/utils/canvas/__tests__/coordinateTransform.test.ts
import { describe, test, expect } from 'vitest';
import { toScreen, toData } from '../coordinateTransform';

describe('coordinateTransform', () => {
  test('toScreen converts data to screen coordinates', () => {
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, 800]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([600, 0]);
    
    const result = toScreen({ x: 50, y: 50 }, xScale, yScale);
    
    expect(result.x).toBe(400);
    expect(result.y).toBe(300);
  });
  
  test('toData is inverse of toScreen', () => {
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, 800]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([600, 0]);
    
    const original = { x: 75, y: 25 };
    const screen = toScreen(original, xScale, yScale);
    const roundtrip = toData(screen, xScale, yScale);
    
    expect(roundtrip.x).toBeCloseTo(original.x);
    expect(roundtrip.y).toBeCloseTo(original.y);
  });
});
```

### Integration Tests

```typescript
// src/components/__tests__/Chart.test.tsx
import { describe, test, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import Chart from '../Chart';

describe('Chart Canvas rendering', () => {
  test('renders canvas elements', () => {
    const { container } = render(<Chart />);
    
    const canvases = container.querySelectorAll('canvas');
    expect(canvases.length).toBe(2); // Data layer + polygon layer
  });
  
  test('initializes contexts with correct dimensions', () => {
    const { container } = render(<Chart width={800} height={600} />);
    
    const canvas = container.querySelector('canvas');
    expect(canvas.width).toBe(800 * window.devicePixelRatio);
    expect(canvas.height).toBe(600 * window.devicePixelRatio);
  });
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting Device Pixel Ratio

**Problem**: Blurry Canvas on Retina displays

**Solution**: Always use `setupCanvas()` utility

```typescript
// ❌ Wrong
canvas.width = 800;
canvas.height = 600;

// ✅ Correct
const dpr = window.devicePixelRatio;
canvas.width = 800 * dpr;
canvas.height = 600 * dpr;
canvas.style.width = '800px';
canvas.style.height = '600px';
ctx.scale(dpr, dpr);
```

---

### ❌ Pitfall 2: Mixing Coordinate Systems

**Problem**: Points rendered in wrong location

**Solution**: Use nominal types and coordinate transform

```typescript
// ❌ Wrong - mixing data and screen coordinates
context.arc(dataPoint.x, dataPoint.y, 2, 0, Math.PI * 2);

// ✅ Correct - transform first
const screenPos = transform.toScreen(dataPoint);
context.arc(screenPos.x, screenPos.y, 2, 0, Math.PI * 2);
```

---

### ❌ Pitfall 3: Not Using requestAnimationFrame

**Problem**: Janky animations, wasted CPU cycles

**Solution**: Always wrap render calls in requestAnimationFrame

```typescript
// ❌ Wrong - renders immediately
useEffect(() => {
  renderPoints(context, data);
}, [data]);

// ✅ Correct - batches with browser repaint
useEffect(() => {
  const frameId = requestAnimationFrame(() => {
    renderPoints(context, data);
  });
  return () => cancelAnimationFrame(frameId);
}, [data]);
```

---

### ❌ Pitfall 4: Culling Selection Calculation

**Problem**: Selection counts wrong when points outside viewport

**Solution**: Selection uses FULL dataset, culling only for rendering

```typescript
// ❌ Wrong - only checks visible points
const selectedIds = visiblePoints.filter(p => isInPolygon(p, polygon));

// ✅ Correct - checks all points
const selectedIds = data.filter(p => isInPolygon(p, polygon));
```

---

## Performance Optimization Checklist

- [ ] Device pixel ratio scaling applied to all canvases
- [ ] Spatial index built for viewport culling
- [ ] Only visible points rendered (culling applied)
- [ ] Selection calculation uses full dataset
- [ ] requestAnimationFrame used for all rendering
- [ ] Dirty rectangle tracking for polygon updates
- [ ] Canvas contexts stored in useRef (not useState)
- [ ] Coordinate transforms memoized
- [ ] Polygon bounding boxes cached

---

## Debugging Tips

### Visualize Viewport Culling

```typescript
console.log('Total points:', data.length);
console.log('Visible points:', visiblePoints.length);
console.log('Culling ratio:', (1 - visiblePoints.length / data.length) * 100 + '%');
```

### Profile Rendering Performance

```typescript
const start = performance.now();
renderDataPoints(context, visiblePoints);
const duration = performance.now() - start;
console.log(`Render time: ${duration.toFixed(2)}ms`);
```

### Verify Coordinate Transforms

```typescript
const dataPoint = { x: 500 as DataX, y: 500 as DataY };
const screenPos = transform.toScreen(dataPoint);
const roundtrip = transform.toData(screenPos);
console.assert(
  Math.abs(roundtrip.x - dataPoint.x) < 0.01,
  'Coordinate transform not bijective'
);
```

---

## Next Steps

After completing this implementation:

1. **Phase 2**: Run `/speckit.tasks` to generate detailed task breakdown
2. **Testing**: Add integration tests for pan/zoom/selection workflows
3. **Performance**: Profile with real 4800-point dataset, tune as needed
4. **Documentation**: Update CLAUDE.md with architectural changes

---

## Support

**Questions?** Check these resources:
- [Research Document](./research.md) - Architectural decisions
- [Data Model](./data-model.md) - Entity definitions
- [Component Contracts](./contracts/component-interfaces.md) - API documentation
- [Constitution](./.specify/memory/constitution.md) - Project principles

**Issues?** Create GitHub issue with:
- Error message or unexpected behavior
- Steps to reproduce
- Expected vs actual results
- Browser/OS information
