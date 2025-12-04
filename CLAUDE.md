# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D3.js-based data visualization application for the 2025 Data Visualization Challenge. It displays cell distribution data (CD45+) as an interactive scatter plot where users can create arbitrary polygons to select and analyze data points.

## Development Commands

```bash
# Install dependencies
yarn

# Run development server (uses Turbopack)
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linter
yarn lint
```

The development server runs at http://localhost:3000.

## Technology Stack

- **Framework**: Next.js 16.0.6 (App Router with Turbopack)
- **Visualization**: D3.js v7.9.0
- **Rendering**: HTML5 Canvas API (dual-layer architecture)
- **UI Library**: Material-UI (MUI) v6
- **Styling**: CSS Modules
- **Language**: TypeScript 5.9.3
- **State Management**: React Context API with useReducer
- **Performance**: flatbush R-tree spatial indexing for viewport culling

## Architecture Overview

### Rendering Architecture (Canvas-based)

The application uses a **hybrid Canvas + SVG rendering system** for optimal performance:

**Layer 0 - Data Points (Canvas, z-index: 0)**:
- Renders 55,737+ data points using Canvas 2D API
- HiDPI display support via `devicePixelRatio` scaling
- Color blending for polygon selection feedback
- Performance: ~200ms initial render, 60 FPS during updates

**Layer 1 - Polygon Overlays (Canvas, z-index: 1)**:
- Renders completed polygon fills and strokes
- Separate canvas for independent updates
- Maximum 50 polygons enforced

**Layer 2 - Interaction Layer (SVG, z-index: 2)**:
- Interactive polygon drawing with D3.js
- Mouse event handling and visual feedback
- Preview lines and vertex markers
- Auto-close detection (15px threshold)

**Layer 3 - Axes and Labels (SVG, z-index: 3)**:
- Axis labels and tick marks
- Non-interactive overlay with `pointerEvents: none`

### Performance Optimizations

1. **Spatial Indexing**: flatbush R-tree for O(log n + k) point queries
2. **Viewport Culling**: Optional - renders only visible points (currently disabled for stability)
3. **Coordinate Transforms**: Nominal types (DataX, DataY, ScreenX, ScreenY) for type safety
4. **Memoization**: useMemo/useCallback to prevent unnecessary re-renders
5. **RequestAnimationFrame**: Batched canvas updates for smooth rendering

### State Management

The application uses a centralized Context API pattern with `ChartContext` (src/contexts/ChartContext.tsx):

- **ChartContext**: Provides read-only state to all components
- **ChartDispatchContext**: Provides the dispatch function for state updates
- **chartReducer**: Handles all state transitions through action types

Key state includes:
- `data`: Array of 55,737 cell data points loaded from CSV
- `polygons`: Array of user-created polygon regions (max 50)
- `currentPoints`: Points being drawn for new polygon
- `selectedPolygonId`: Array of currently selected polygon IDs
- `isDrawing`: Boolean tracking polygon drawing state
- `scales`: D3 scale functions (xScale, yScale) for backward compatibility
- `viewport`: Current viewport bounds (minX, maxX, minY, maxY, scale, translate)
- `spatialIndex`: flatbush R-tree for spatial queries
- `coordinateTransform`: Functions for data<->screen coordinate conversion
- `canvasLayers`: Canvas references and contexts for rendering

### Component Structure

1. **page.tsx**: Root component wrapping everything in `ChartProvider`
2. **Chart.tsx**: Canvas-based scatter plot with dual-layer rendering, coordinate transforms, and polygon selection
3. **Polygon.tsx**: Handles polygon drawing interactions on SVG overlay, auto-close detection
4. **Sidebar.tsx**: Displays polygon list with controls
5. **PopupEditor.tsx**: Modal for editing polygon properties

### Custom Hooks

- `useCanvasRenderer`: Canvas setup and rendering utilities
- `useCoordinateTransform`: Data space ↔ screen space coordinate conversion
- `useSpatialIndex`: R-tree spatial index for fast point queries
- `useViewportCulling`: Filters visible points based on viewport bounds
- `useDirtyRectTracking`: Tracks canvas regions needing updates (unused - full redraws more efficient)
- `usePolygonSelection`: Calculates which data points fall within each polygon

### D3 Integration Pattern

The app uses a **hybrid Canvas + D3 approach**:

- React manages component lifecycle and state
- Canvas API handles data point rendering for performance (55,737 points)
- D3 handles polygon drawing interactions on SVG overlay
- D3 event handlers dispatch actions to update React state
- State changes trigger re-renders that update Canvas visualizations
- D3 scales maintained for backward compatibility with Polygon component

**Important**: Chart component creates coordinate transforms and stores them in context via `SET_COORDINATE_TRANSFORM` action for use by polygon selection hooks.

### Data Flow

1. CSV data loads on mount in `ChartContext` (src/utils/data/loadCsvData.ts) - 55,737 points
2. Chart component creates Canvas layers and coordinate transforms
3. Spatial index built using flatbush R-tree for fast queries
4. User clicks to create polygon points (handled by Polygon component on SVG overlay)
5. Points are tracked in context state (`currentPoints`)
6. On polygon completion (auto-close at 15px threshold), statistics are calculated via `usePolygonSelection` hook
7. Completed polygon is added to `polygons` array in state (max 50 polygons)
8. Canvas layers re-render with updated polygon selection feedback
9. Data points inside polygons rendered with color blending (base dot + polygon overlays)

### Polygon Selection Logic

- Points inside polygons are detected using `d3.polygonContains()` in `usePolygonSelection` hook
- Polygon coordinates stored in screen space (SVG coordinates)
- Data points transformed from data space to screen space using coordinate transform functions
- Selection Map structure: `{ [polygonId: number]: number[] }` - maps polygon IDs to array of data indices
- Multiple polygons can be selected (tracked in `selectedPolygonId` array)
- Selected polygons have visual highlighting on Canvas layer (color blending)
- Visual feedback: base dot color (0.4 alpha) + polygon overlay colors (0.2 alpha each)
- Maximum 50 polygons enforced with console warning

### Key Files

**Core Components**:
- `src/contexts/ChartContext.tsx`: Central state management with Canvas extensions
- `src/components/Chart.tsx`: Canvas-based scatter plot with dual-layer rendering
- `src/components/Polygon.tsx`: Interactive polygon drawing on SVG overlay

**Custom Hooks**:
- `src/hooks/useCanvasRenderer.ts`: Canvas setup and rendering utilities
- `src/hooks/useCoordinateTransform.ts`: Data<->screen coordinate conversion
- `src/hooks/useSpatialIndex.ts`: R-tree spatial index creation
- `src/hooks/useViewportCulling.ts`: Viewport-based point filtering
- `src/hooks/usePolygonSelection.ts`: Polygon containment calculations
- `src/hooks/useDirtyRectTracking.ts`: Canvas partial update tracking (unused)

**Utilities**:
- `src/utils/canvas/devicePixelRatio.ts`: HiDPI canvas setup
- `src/utils/canvas/coordinateTransform.ts`: Transform function creation
- `src/utils/canvas/spatialIndex.ts`: flatbush R-tree wrapper
- `src/utils/canvas/canvasRenderer.ts`: Canvas drawing primitives
- `src/utils/canvas/polygonGeometry.ts`: Polygon calculations
- `src/utils/data/loadCsvData.ts`: CSV parsing (loads from `/public/data/CD45_pos.csv`)

**Types**:
- `src/types/canvas.d.ts`: Nominal coordinate types, Canvas layer interfaces
- `src/types/global.d.ts`: Global type declarations for CSS modules

## Important Implementation Details

### Coordinate Systems

The application uses **nominal types** for type-safe coordinate handling:

1. **Data space**: Raw CSV values (CD45-KrO: 200-1000, SS INT LIN: 0-1000)
   - Types: `DataX`, `DataY`, `DataPoint`
2. **Screen space**: Pixel coordinates in canvas/SVG
   - Types: `ScreenX`, `ScreenY`, `ScreenPoint`

Coordinate transforms handle:
- Data-to-screen conversion via `toScreen(point: DataPoint): ScreenPoint`
- Screen-to-data conversion via `toData(point: ScreenPoint): DataPoint`
- Viewport scaling and translation
- Margin offsets: `{ top: 20, right: 20, bottom: 50, left: 60 }`

**Important**: Canvas layers positioned at `(margin.left, margin.top)` to match SVG overlay coordinate system.

### Event Handling

Polygon drawing uses D3 event handlers attached to SVG overlay:
- `mousedown`: Add points or complete polygon (auto-close at 15px from start point)
- `mousemove`: Show preview line while drawing
- Click detection uses `d3.pointer(event, chartG.node())` for coordinates relative to transformed g element
- Visual feedback: Green start point (8px radius), white vertices (4px radius)

Event propagation is carefully managed with `event.stopPropagation()` to prevent conflicts between polygon selection and drawing.

**Important**: SVG overlay positioned at `(margin.left, margin.top)` without additional g transform to align with Canvas layers.

### Performance Considerations

**Dataset**: 55,737 data points loaded from CSV (11.5x larger than spec requirement of 4,800 points)

**Rendering Performance**:
- Initial render: ~200ms for 55,737 points (Canvas-based)
- Frame rate: 60 FPS during interactions
- Memory: ~50% reduction vs SVG implementation (estimated)

**Optimizations Applied**:
- Canvas rendering instead of SVG DOM nodes (massive performance gain)
- HiDPI display support via `devicePixelRatio` scaling
- Pre-filtered polygon arrays to reduce iteration overhead
- Direct forEach index usage (avoided expensive `indexOf()` calls)
- Memoized coordinate transforms and D3 scales
- RequestAnimationFrame for batched canvas updates

**Disabled Optimizations** (stability/correctness prioritized):
- Viewport culling: Renders all points instead of visible subset
- Dirty rectangle tracking: Full canvas clears more stable than partial updates

**Bottlenecks**:
- Polygon selection calculations: O(n * p) where n=points, p=polygons
- Filter operations in render loop for polygon containment checks
- Console logging (performance monitoring - should be removed in production)

### Styling

Uses CSS Modules for component-specific styles. Key style files:
- `src/styles/page.module.css`: Main layout and container styles
- `src/styles/Chart.module.css`: Chart-specific styles
- `src/styles/globals.css`: Global styles and resets

## Active Technologies
- TypeScript 5.9.3 (strict mode enabled) (001-responsive-layout)
- N/A (client-side state only via React Context) (001-responsive-layout)

## Recent Changes
- 001-responsive-layout: Added TypeScript 5.9.3 (strict mode enabled)
