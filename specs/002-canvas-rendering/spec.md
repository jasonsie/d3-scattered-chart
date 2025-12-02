# Feature Specification: Canvas-Based Chart Rendering

**Feature Branch**: `002-canvas-rendering`  
**Created**: 2025-12-01  
**Status**: Draft  
**Input**: User description: "Replace SVG-based rendering with HTML5 Canvas"

## Clarifications

### Session 2025-12-01

- Q: Should Canvas replace SVG only for large datasets or for all scenarios? → A: Completely replace SVG for all scenarios regardless of dataset size
- Q: How should polygons be rendered in the Canvas implementation? → A: Use a separate overlay Canvas layer specifically for polygons
- Q: How should selected points be visually highlighted? → A: Redraw only affected points with different styling on the main Canvas layer
- Q: Should the implementation include viewport culling (only rendering visible points)? → A: Yes, implement viewport culling for performance (rendering optimization only - selection and calculations use full dataset)
- Q: When multiple polygons overlap and select the same point, how should opacity be applied to indicate the level of selection? → A: Default opacity 0.2 per polygon
- Q: When a point belongs to multiple overlapping polygons (each with different fill colors), how should the visual appearance be determined? → A: Blend all polygon colors together at 0.2 opacity each (additive color mixing)
- Q: How should the dot color from PopupEditor be applied to selected points in Canvas rendering? → A: Dot color is the base fill, polygon fill color overlays at 0.2 opacity
- Q: What should happen when a polygon is drawn completely outside the visible chart area? → A: Clicking outside viewport cancels current drawing
- Q: When the chart is zoomed to extreme levels, how should polygon rendering and interaction be handled? → A: Polygons scale with zoom, maintaining visual size relative to data points
- Q: What rendering strategy should be used for Canvas updates during interactions? → A: Use requestAnimationFrame with dirty rectangle tracking for partial Canvas updates
- Q: How should Canvas state and rendering data be managed in the React/Next.js application? → A: Store in React state using useRef for Canvas contexts and useState for data/selection
- Q: The spec mentions "standard hardware (Intel i5 or equivalent)" for performance targets, but doesn't specify memory or GPU requirements. → A: 8GB RAM, integrated graphics
- Q: Since User Story 3 is not needed, should the tooltip and individual point interaction features (FR-012, FR-015, FR-016, SC-010) be removed from the requirements, or are they still required for User Story 2 (polygon selection)? → A: Remove all tooltip and individual point interaction features completely
- Q: The spec mentions "multiple simultaneous polygons" (FR-009) but doesn't specify a maximum limit or how many polygons the system should handle efficiently. → A: Up to 50 polygons
- Q: When overlapping polygons select the same data points (User Story 2, Scenario 3), how should the system handle point ownership? → A: Points belong to all overlapping polygons independently
- Q: When the chart container is resized (Edge Cases, FR-011), should the system preserve the current zoom level and pan position, or reset to the default view? → A: Preserve zoom/pan, adjust coordinates proportionally

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Views Dataset Visualization with Canvas (Priority: P1)

As a data analyst, I need to view scatter plot visualizations rendered using HTML5 Canvas instead of SVG, so I benefit from improved rendering performance and modern visualization capabilities regardless of dataset size.

**Why this priority**: Core architectural change that affects all visualization rendering. Canvas provides better performance characteristics and is the foundation for all other features.

**Independent Test**: Can be fully tested by loading datasets of varying sizes (from 10 points to 10,000 points), verifying all points render correctly using Canvas, and confirming smooth pan/zoom interactions.

**Acceptance Scenarios**:

1. **Given** a dataset with 4800 data points, **When** the chart is initially rendered, **Then** all points appear on screen within 2 seconds
2. **Given** a rendered chart with 4800 points, **When** the user pans the view, **Then** the chart updates smoothly at 30+ frames per second
3. **Given** a rendered chart, **When** the user zooms in or out, **Then** the visualization responds immediately without lag or stuttering
4. **Given** different screen sizes, **When** the chart renders, **Then** the visualization adapts correctly maintaining performance

---

### User Story 2 - User Draws Selection Polygons (Priority: P1)

As a data analyst, I need to draw polygons to select specific regions of data points in the scatter plot, so I can isolate and analyze subsets of the dataset.

**Why this priority**: Critical interactive feature that enables core data analysis workflows. Must work correctly with the new rendering system.

**Independent Test**: Can be fully tested by clicking multiple points to create a polygon, verifying points inside the polygon are selected, and confirming the polygon can be edited or deleted.

**Acceptance Scenarios**:

1. **Given** a rendered chart, **When** the user clicks multiple locations to define a polygon, **Then** the polygon shape appears correctly at the clicked coordinates
2. **Given** a drawn polygon, **When** the polygon is complete, **Then** all data points within the polygon boundary are identified and selectable
3. **Given** multiple polygons, **When** polygons overlap, **Then** the system correctly determines which points belong to which polygons (points can belong to all overlapping polygons independently)
4. **Given** a zoomed or panned view, **When** the user draws a polygon, **Then** the polygon coordinates map correctly to the data space
5. **Given** a polygon that includes points outside the current viewport, **When** selection calculation occurs, **Then** all points within the polygon are counted regardless of visibility

---

### Edge Cases

- What happens when the chart container is resized during rendering? (System preserves zoom/pan and adjusts coordinates proportionally)
- What happens when a polygon is drawn outside the visible chart area? (Clicking outside viewport cancels the current drawing operation)
- How are polygons handled when the chart is zoomed to extreme levels? (Polygons scale with zoom, maintaining visual size relative to data points)
- What happens when the user rapidly pans and zooms before rendering completes?
- How does viewport culling handle edge cases where points are partially visible?
- What happens when all data points are outside the current viewport after pan/zoom?
- How does polygon selection calculate totals when selected points are not currently rendered due to viewport culling?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use HTML5 Canvas for all chart rendering (no SVG fallback)
- **FR-002**: System MUST render scatter plots with datasets ranging from 1 to 10,000+ data points
- **FR-003**: System MUST complete initial rendering within 2 seconds for datasets up to 5,000 points on standard hardware (Intel i5 or equivalent, 8GB RAM, integrated graphics)
- **FR-004**: System MUST maintain 30+ frames per second during pan and zoom operations using requestAnimationFrame with dirty rectangle tracking
- **FR-005**: System MUST implement viewport culling to render only visible data points for display optimization
- **FR-006**: System MUST use separate Canvas layers for data points and interactive polygons
- **FR-006a**: System MUST scale polygons proportionally with zoom operations to maintain consistent spatial relationships with data points at all zoom levels
- **FR-007**: System MUST support polygon drawing with accurate coordinate mapping
- **FR-007a**: System MUST cancel the current polygon drawing operation when user clicks outside the viewport boundaries
- **FR-008**: System MUST correctly identify data points within drawn polygon boundaries using the complete dataset regardless of viewport
- **FR-009**: System MUST support up to 50 simultaneous polygons without performance degradation, with each polygon maintaining independent selection state
- **FR-010**: System MUST allow data points to belong to multiple overlapping polygons simultaneously
- **FR-011**: System MUST handle window/container resize events by preserving zoom level and pan position, adjusting coordinates proportionally to maintain the same data region in view
- **FR-012**: System MUST support high-DPI displays with appropriate pixel ratio scaling
- **FR-013**: System MUST maintain coordinate system consistency between data space and screen space
- **FR-014**: System MUST preserve all existing polygon selection and interaction behaviors from SVG implementation
- **FR-014a**: System MUST render selected points with 0.2 opacity as the default visual indicator, applying polygon-specific fill colors using additive color blending when points belong to multiple polygons
- **FR-015**: System MUST use dirty rectangle tracking to optimize Canvas redraws, updating only changed regions
- **FR-016**: System MUST manage Canvas contexts using React useRef hooks to prevent unnecessary re-renders
- **FR-017**: System MUST manage data and selection state using React useState to trigger appropriate component updates

### Key Entities

- **Data Point**: Individual observation in the dataset with x-coordinate, y-coordinate, and associated metadata
- **Chart Canvas**: Primary rendering surface that displays the visual representation of data points
- **Polygon Canvas Layer**: Separate overlay Canvas for rendering interactive polygons and selection shapes
- **Coordinate Transform**: Mathematical mapping between data values and screen pixel positions
- **Selection Polygon**: User-defined shape for selecting multiple data points simultaneously, with configurable fill color, line style, and dot color properties. Dot color serves as the base fill for all points; polygon fill color overlays selected points at 0.2 opacity using additive blending for overlaps.
- **Viewport**: Visible region of the data space, controlled by pan and zoom operations
- **Canvas Context Reference**: React useRef hook storing Canvas 2D rendering contexts without triggering re-renders
- **Chart State**: React useState managing data points, selection state, and viewport configuration with proper reactivity

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Chart renders 4800 data points in under 2 seconds on standard hardware (Intel i5 or equivalent, 8GB RAM, integrated graphics)
- **SC-002**: Pan and zoom operations maintain 30+ frames per second with 4800 points
- **SC-003**: Memory usage for chart rendering is 50% or less compared to SVG implementation
- **SC-004**: Polygon selection accurately identifies 100% of points within boundaries (no false positives/negatives)
- **SC-005**: User can draw and edit polygons with same ease as SVG implementation (measured by task completion time)
- **SC-006**: Chart rendering works correctly on screens from 1920x1080 to 3840x2160 resolution
- **SC-007**: All existing user workflows (load data, select regions, export selections) complete successfully
- **SC-008**: Polygon selection calculations include 100% of qualifying data points regardless of current viewport or culling state
