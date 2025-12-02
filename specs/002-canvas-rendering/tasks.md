# Tasks: Canvas-Based Chart Rendering

**Feature**: Replace SVG rendering with HTML5 Canvas for improved performance  
**Branch**: `002-canvas-rendering`  
**Input**: Design documents from `/specs/002-canvas-rendering/`

---

## Task Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **Checkbox**: `- [ ]` for task tracking
- **[ID]**: Sequential task number (T001, T002, ...)
- **[P]**: Parallelizable (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2) - omitted for Setup/Foundational/Polish phases
- **Description**: Clear action with exact file path

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Install dependencies and create base directory structure

- [X] T001 Install flatbush dependency for spatial indexing (`npm install flatbush`)
- [X] T002 [P] Install Vitest testing dependencies (`npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom canvas`)
- [X] T003 [P] Create hooks directory at src/hooks/
- [X] T004 [P] Create canvas utilities directory at src/utils/canvas/
- [X] T005 [P] Create Canvas type definitions file at src/types/canvas.d.ts

**Checkpoint**: Directory structure ready for Canvas implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Canvas infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [X] T006 [P] Define nominal coordinate types (DataX, DataY, ScreenX, ScreenY) in src/types/canvas.d.ts
- [X] T007 [P] Define Viewport interface in src/types/canvas.d.ts
- [X] T008 [P] Define CanvasLayer interfaces (DataPointsLayer, PolygonOverlayLayer) in src/types/canvas.d.ts
- [X] T009 [P] Define CoordinateTransform interface in src/types/canvas.d.ts

### Utility Functions (Core Layer)

- [X] T010 [P] Implement setupCanvas function with DPR scaling in src/utils/canvas/devicePixelRatio.ts
- [X] T011 [P] Implement getDevicePixelRatio function in src/utils/canvas/devicePixelRatio.ts
- [X] T012 [P] Implement onDevicePixelRatioChange listener in src/utils/canvas/devicePixelRatio.ts
- [X] T013 [P] Implement toScreen coordinate transformation in src/utils/canvas/coordinateTransform.ts
- [X] T014 [P] Implement toData coordinate transformation in src/utils/canvas/coordinateTransform.ts
- [X] T015 [P] Implement isWithinViewport bounds check in src/utils/canvas/coordinateTransform.ts
- [X] T016 [P] Implement calculateViewportBounds function in src/utils/canvas/coordinateTransform.ts
- [X] T017 [P] Implement buildSpatialIndex function using Flatbush in src/utils/canvas/spatialIndex.ts
- [X] T018 [P] Implement queryViewport function for R-tree searches in src/utils/canvas/spatialIndex.ts
- [X] T019 [P] Implement filterVisiblePoints utility in src/utils/canvas/spatialIndex.ts

### Dirty Rectangle Tracking

- [X] T020 [P] Implement calculateBoundingBox function in src/utils/canvas/dirtyRectTracking.ts
- [X] T021 [P] Implement expandRect function in src/utils/canvas/dirtyRectTracking.ts
- [X] T022 [P] Implement rectsOverlap helper in src/utils/canvas/dirtyRectTracking.ts
- [X] T023 [P] Implement mergeRects function in src/utils/canvas/dirtyRectTracking.ts
- [X] T024 [P] Implement mergeOverlappingRects array processor in src/utils/canvas/dirtyRectTracking.ts
- [X] T025 [P] Implement renderWithClip function in src/utils/canvas/dirtyRectTracking.ts

### Polygon Geometry Utilities

- [X] T026 [P] Implement isPointInPolygon using D3 in src/utils/canvas/polygonGeometry.ts
- [X] T027 [P] Implement polygonArea calculation in src/utils/canvas/polygonGeometry.ts
- [X] T028 [P] Implement isValidPolygon validator in src/utils/canvas/polygonGeometry.ts
- [X] T029 [P] Implement polygonCentroid calculation in src/utils/canvas/polygonGeometry.ts
- [X] T030 [P] Implement isNearFirstPoint for auto-close detection in src/utils/canvas/polygonGeometry.ts

### Canvas Rendering Utilities

- [X] T031 [P] Implement clearCanvas function in src/utils/canvas/canvasRenderer.ts
- [X] T032 [P] Implement clearRect function in src/utils/canvas/canvasRenderer.ts
- [X] T033 [P] Implement renderDataPoint with color blending in src/utils/canvas/canvasRenderer.ts
- [X] T034 [P] Implement renderPolygonFill function in src/utils/canvas/canvasRenderer.ts
- [X] T035 [P] Implement renderPolygonStroke function in src/utils/canvas/canvasRenderer.ts

### ChartContext Extensions

- [X] T036 Add viewport state to ChartState interface in src/contexts/ChartContext.tsx
- [X] T037 Add spatialIndex state to ChartState interface in src/contexts/ChartContext.tsx
- [X] T038 Add canvasLayers state to ChartState interface in src/contexts/ChartContext.tsx
- [X] T039 Add coordinateTransform state to ChartState interface in src/contexts/ChartContext.tsx
- [X] T040 Implement SET_VIEWPORT action in chartReducer in src/contexts/ChartContext.tsx
- [X] T041 Implement SET_CANVAS_LAYERS action in chartReducer in src/contexts/ChartContext.tsx
- [X] T042 Implement SET_COORDINATE_TRANSFORM action in chartReducer in src/contexts/ChartContext.tsx
- [X] T043 Implement REBUILD_SPATIAL_INDEX action in chartReducer in src/contexts/ChartContext.tsx
- [X] T044 Implement INVALIDATE_RECT action in chartReducer in src/contexts/ChartContext.tsx
- [X] T045 Implement PAN action in chartReducer in src/contexts/ChartContext.tsx
- [X] T046 Implement ZOOM action in chartReducer in src/contexts/ChartContext.tsx

**Checkpoint**: Foundation ready - all utilities, types, and state management in place. User story implementation can now begin.

---

## Phase 3: User Story 1 - User Views Dataset Visualization with Canvas (Priority: P1) 🎯 MVP

**Goal**: Replace SVG rendering with Canvas to display 4800+ data points with smooth pan/zoom at 30+ FPS

**Independent Test**: Load CD45_pos.csv dataset, verify all points render on Canvas within 2s, pan/zoom chart and confirm smooth 30+ FPS performance

### Custom Hooks for US1

- [X] T047 [P] [US1] Create useCanvasRenderer hook skeleton in src/hooks/useCanvasRenderer.ts
- [X] T048 [US1] Implement Canvas context initialization in useCanvasRenderer hook in src/hooks/useCanvasRenderer.ts
- [X] T049 [US1] Implement render function with requestAnimationFrame in useCanvasRenderer hook in src/hooks/useCanvasRenderer.ts
- [X] T050 [US1] Implement clear function in useCanvasRenderer hook in src/hooks/useCanvasRenderer.ts
- [X] T051 [US1] Implement invalidateRect function in useCanvasRenderer hook in src/hooks/useCanvasRenderer.ts
- [X] T052 [P] [US1] Create useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts
- [X] T053 [US1] Implement D3 scale creation in useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts
- [X] T054 [US1] Implement toScreen/toData methods in useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts
- [X] T055 [US1] Add viewport integration to useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts
- [X] T056 [P] [US1] Create useSpatialIndex hook in src/hooks/useSpatialIndex.ts
- [X] T057 [US1] Implement R-tree index building in useSpatialIndex hook in src/hooks/useSpatialIndex.ts
- [X] T058 [US1] Implement search function in useSpatialIndex hook in src/hooks/useSpatialIndex.ts
- [X] T059 [P] [US1] Create useViewportCulling hook in src/hooks/useViewportCulling.ts
- [X] T060 [US1] Implement spatial index query in useViewportCulling hook in src/hooks/useViewportCulling.ts
- [X] T061 [US1] Implement visible points filtering in useViewportCulling hook in src/hooks/useViewportCulling.ts
- [X] T062 [P] [US1] Create useDirtyRectTracking hook in src/hooks/useDirtyRectTracking.ts
- [X] T063 [US1] Implement invalidate method in useDirtyRectTracking hook in src/hooks/useDirtyRectTracking.ts
- [X] T064 [US1] Implement rectangle merging logic in useDirtyRectTracking hook in src/hooks/useDirtyRectTracking.ts

### Chart Component Canvas Migration for US1

- [X] T065 [US1] Replace svgRef with dataLayerRef and polygonLayerRef in src/components/Chart.tsx
- [X] T066 [US1] Update Chart component JSX to render dual Canvas layers in src/components/Chart.tsx
- [X] T067 [US1] Add containerRef for responsive sizing in src/components/Chart.tsx
- [X] T068 [US1] Remove D3 SVG setup code from Chart component in src/components/Chart.tsx
- [X] T069 [US1] Implement Canvas context initialization useEffect in src/components/Chart.tsx
- [X] T070 [US1] Dispatch SET_CANVAS_LAYERS action after context setup in src/components/Chart.tsx
- [X] T071 [US1] Create D3 scales and coordinate transform in src/components/Chart.tsx
- [X] T072 [US1] Dispatch SET_COORDINATE_TRANSFORM action in src/components/Chart.tsx
- [X] T073 [US1] Build spatial index for data points in src/components/Chart.tsx
- [X] T074 [US1] Dispatch REBUILD_SPATIAL_INDEX action in src/components/Chart.tsx
- [X] T075 [US1] Initialize default viewport state in src/components/Chart.tsx
- [X] T076 [US1] Dispatch SET_VIEWPORT action with default bounds in src/components/Chart.tsx
- [X] T077 [US1] Integrate useViewportCulling hook to get visible points in src/components/Chart.tsx
- [X] T078 [US1] Integrate useCanvasRenderer hook for data layer in src/components/Chart.tsx
- [X] T079 [US1] Implement data points rendering useEffect with requestAnimationFrame in src/components/Chart.tsx
- [X] T080 [US1] Apply coordinate transform to convert data to screen coordinates in render loop in src/components/Chart.tsx
- [X] T081 [US1] Render visible data points using Canvas arc() calls in src/components/Chart.tsx
- [X] T082 [US1] Apply base dot color with 0.4 opacity to points in src/components/Chart.tsx

### Pan/Zoom Interactions for US1

- [ ] T083 [US1] Implement handlePan event handler in src/components/Chart.tsx
- [ ] T084 [US1] Dispatch PAN action on mouse/touch drag in src/components/Chart.tsx
- [ ] T085 [US1] Implement handleZoom event handler in src/components/Chart.tsx
- [ ] T086 [US1] Dispatch ZOOM action on wheel/pinch events in src/components/Chart.tsx
- [ ] T087 [US1] Implement handleResize event handler in src/components/Chart.tsx
- [ ] T088 [US1] Preserve zoom/pan and adjust coordinates proportionally on resize in src/components/Chart.tsx
- [ ] T089 [US1] Add mouse/wheel event listeners to Canvas in src/components/Chart.tsx
- [ ] T090 [US1] Trigger viewport culling re-query on viewport changes in src/components/Chart.tsx

### Styling for US1

- [X] T091 [US1] Add chartContainer CSS styles for Canvas layers in src/styles/Chart.module.css
- [X] T092 [US1] Add dataLayer CSS with z-index: 0 in src/styles/Chart.module.css
- [X] T093 [US1] Add polygonLayer CSS with z-index: 1 in src/styles/Chart.module.css
- [X] T094 [US1] Add absolute positioning for Canvas overlay in src/styles/Chart.module.css

**Checkpoint**: User Story 1 complete - Chart renders data points on Canvas with smooth pan/zoom. Independently testable by loading dataset and interacting with visualization.

---

## Phase 4: User Story 2 - User Draws Selection Polygons (Priority: P1)

**Goal**: Enable polygon drawing on Canvas to select data points with accurate selection calculation and visual feedback

**Independent Test**: Draw a polygon by clicking multiple points, verify polygon renders on Canvas, confirm selected points are counted correctly, check polygon can be edited/deleted

### Polygon Selection Hook for US2

- [X] T095 [P] [US2] Create usePolygonSelection hook in src/hooks/usePolygonSelection.ts
- [X] T096 [US2] Implement point-in-polygon test loop for all data points in usePolygonSelection hook in src/hooks/usePolygonSelection.ts
- [X] T097 [US2] Use coordinate transform to convert data to screen coords in usePolygonSelection hook in src/hooks/usePolygonSelection.ts
- [X] T098 [US2] Call D3 polygonContains for each point in usePolygonSelection hook in src/hooks/usePolygonSelection.ts
- [X] T099 [US2] Build selectionMap with polygon ID → point IDs mapping in usePolygonSelection hook in src/hooks/usePolygonSelection.ts
- [X] T100 [US2] Handle overlapping polygons (points belong to ALL) in usePolygonSelection hook in src/hooks/usePolygonSelection.ts
- [X] T101 [US2] Memoize selection calculation to avoid recomputation in usePolygonSelection hook in src/hooks/usePolygonSelection.ts

### Polygon Rendering on Canvas for US2

- [X] T102 [US2] Integrate useCanvasRenderer hook for polygon overlay layer in src/components/Chart.tsx
- [X] T103 [US2] Implement polygon rendering useEffect with requestAnimationFrame in src/components/Chart.tsx
- [X] T104 [US2] Filter visible and complete polygons for rendering in src/components/Chart.tsx
- [X] T105 [US2] Clear polygon layer before each render in src/components/Chart.tsx
- [X] T106 [US2] Render polygon fills using renderPolygonFill utility in src/components/Chart.tsx
- [X] T107 [US2] Apply 0.2 opacity for polygon fill colors in src/components/Chart.tsx
- [X] T108 [US2] Render polygon strokes using renderPolygonStroke utility in src/components/Chart.tsx
- [X] T109 [US2] Apply line color and 2px stroke width to polygons in src/components/Chart.tsx

### Selection Visual Feedback for US2

- [X] T110 [US2] Integrate usePolygonSelection hook in Chart component in src/components/Chart.tsx
- [X] T111 [US2] Update data point rendering to check selection status in src/components/Chart.tsx
- [X] T112 [US2] Find which polygons contain each point from selectionMap in src/components/Chart.tsx
- [X] T113 [US2] Apply dot color as base fill for selected points in src/components/Chart.tsx
- [X] T114 [US2] Apply polygon fill colors as overlay layers with 0.2 opacity in src/components/Chart.tsx
- [X] T115 [US2] Implement additive color blending for overlapping polygon selections in src/components/Chart.tsx
- [ ] T116 [US2] Update selectedPointIds on polygons via UPDATE_POLYGON action in src/components/Chart.tsx
- [ ] T115 [US2] Implement additive color blending for overlapping polygon selections in src/components/Chart.tsx
- [ ] T116 [US2] Update selectedPointIds on polygons via UPDATE_POLYGON action in src/components/Chart.tsx

### Polygon Component Canvas Integration for US2

- [X] T117 [US2] Update Polygon component to use SVG overlay (z-index: 2) for drawing only in src/components/Polygon.tsx
- [X] T118 [US2] Remove D3 polygon rendering code (now handled by Chart Canvas) in src/components/Polygon.tsx
- [X] T119 [US2] Keep click event handlers for polygon point addition in src/components/Polygon.tsx
- [X] T120 [US2] Add isWithinViewport check before adding polygon points in src/components/Polygon.tsx
- [X] T121 [US2] Dispatch CANCEL_POLYGON_DRAWING on outside-viewport clicks in src/components/Polygon.tsx
- [X] T122 [US2] Use coordinate transform toData() for screen-to-data conversion in src/components/Polygon.tsx
- [X] T123 [US2] Keep isNearFirstPoint check for auto-close detection in src/components/Polygon.tsx
- [X] T124 [US2] Dispatch COMPLETE_POLYGON action when polygon closed in src/components/Polygon.tsx
- [X] T125 [US2] Ensure polygon points stored in screen coordinates in src/components/Polygon.tsx

### Dirty Rectangle Optimization for US2

- [ ] T126 [US2] Integrate useDirtyRectTracking hook in Chart component in src/components/Chart.tsx
- [ ] T127 [US2] Calculate bounding box for completed polygons in src/components/Chart.tsx
- [ ] T128 [US2] Invalidate polygon bounding box region on polygon complete in src/components/Chart.tsx
- [ ] T129 [US2] Apply dirty rectangle clipping to data layer redraw in src/components/Chart.tsx
- [ ] T130 [US2] Only redraw points within dirty rectangles for selection updates in src/components/Chart.tsx
- [ ] T131 [US2] Merge overlapping dirty rectangles before rendering in src/components/Chart.tsx
- [ ] T132 [US2] Clear dirty rectangle list after each render cycle in src/components/Chart.tsx

### Edge Cases for US2

- [X] T133 [US2] Implement polygon scaling with zoom level in src/components/Chart.tsx
- [X] T134 [US2] Ensure polygon coordinates update on viewport changes in src/components/Chart.tsx
- [ ] T135 [US2] Handle rapid pan/zoom by cancelling previous animation frames in src/components/Chart.tsx
- [X] T136 [US2] Verify selection calculation uses full dataset (not culled) in usePolygonSelection hook in src/hooks/usePolygonSelection.ts
- [X] T137 [US2] Handle case when all points outside viewport after pan/zoom in src/components/Chart.tsx
- [X] T138 [US2] Validate polygon has minimum 3 points before completing in src/components/Polygon.tsx
- [X] T139 [US2] Enforce maximum 50 polygons limit in chartReducer in src/contexts/ChartContext.tsx

**Checkpoint**: User Story 2 complete - Polygons can be drawn on Canvas, selected points highlighted with color blending, selection counts accurate. Independently testable by drawing polygons and verifying selection behavior.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validations that affect multiple user stories

### Performance Validation

- [ ] T140 [P] Profile initial render time with 4800 points, verify <2s (Success Criteria SC-001)
- [ ] T141 [P] Measure FPS during pan/zoom interactions, verify 30+ FPS (Success Criteria SC-002)
- [ ] T142 [P] Measure memory usage vs SVG implementation, verify ≤50% reduction (Success Criteria SC-003)
- [ ] T143 [P] Test polygon selection accuracy with various shapes, verify 100% correct (Success Criteria SC-004)
- [ ] T144 [P] Test high-DPI display rendering on Retina/4K screens (Success Criteria SC-006)
- [ ] T145 [P] Verify viewport culling includes correct point count at various zoom levels

### Code Quality

- [ ] T146 [P] Add JSDoc comments to all custom hooks in src/hooks/
- [ ] T147 [P] Add JSDoc comments to all utility functions in src/utils/canvas/
- [ ] T148 [P] Run TypeScript strict mode check, fix any errors
- [ ] T149 [P] Run ESLint, fix any violations
- [ ] T150 [P] Remove unused SVG-related code and imports
- [ ] T151 [P] Update CLAUDE.md with Canvas architecture changes

### Documentation

- [ ] T152 [P] Validate quickstart.md examples match actual implementation
- [ ] T153 [P] Add inline comments for complex Canvas rendering logic
- [ ] T154 [P] Document coordinate system transformations in code comments
- [ ] T155 [P] Add performance tuning notes for viewport culling thresholds

### Testing (OPTIONAL - only if requested in spec)

> Note: Spec mentions testing framework selection but does not explicitly require tests to be written

If testing is desired:

- [ ] T156 [P] Configure Vitest with jsdom environment in vitest.config.ts
- [ ] T157 [P] Setup canvas-mock for Canvas 2D context mocking
- [ ] T158 [P] Write unit test for toScreen/toData coordinate transforms in src/utils/canvas/__tests__/coordinateTransform.test.ts
- [ ] T159 [P] Write unit test for spatial index query in src/utils/canvas/__tests__/spatialIndex.test.ts
- [ ] T160 [P] Write unit test for dirty rectangle merging in src/utils/canvas/__tests__/dirtyRectTracking.test.ts
- [ ] T161 [P] Write component test for Chart Canvas rendering in src/components/__tests__/Chart.test.tsx
- [ ] T162 [P] Write integration test for pan/zoom interactions in src/components/__tests__/Chart.integration.test.tsx
- [ ] T163 [P] Write integration test for polygon drawing workflow in src/components/__tests__/Polygon.integration.test.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← BLOCKS all user stories
    ↓
    ├─→ User Story 1 (Phase 3) ← MVP
    └─→ User Story 2 (Phase 4) ← Depends on US1 (Canvas rendering)
            ↓
Polish (Phase 5)
```

### User Story Dependencies

- **User Story 1**: Depends on Foundational (Phase 2) only
  - Independently delivers Canvas-based scatter plot with pan/zoom
  - Can be deployed as MVP
  
- **User Story 2**: Depends on User Story 1 completion
  - Requires Canvas rendering infrastructure from US1
  - Adds polygon drawing and selection on top of US1
  - Still independently testable (can draw polygons and verify selection)

### Within User Story 1

1. **Hooks First** (T047-T064): All custom hooks can be developed in parallel
2. **Chart Migration** (T065-T082): Sequential, depends on hooks
3. **Pan/Zoom** (T083-T090): Depends on Chart migration
4. **Styling** (T091-T094): Can be done in parallel with Chart migration

### Within User Story 2

1. **Selection Hook** (T095-T101): Can start after US1 hooks complete
2. **Polygon Rendering** (T102-T109): Depends on US1 Chart component
3. **Visual Feedback** (T110-T116): Depends on selection hook + polygon rendering
4. **Polygon Component** (T117-T125): Depends on Chart Canvas setup
5. **Dirty Rects** (T126-T132): Optimization, can be done after visual feedback works
6. **Edge Cases** (T133-T139): Final polish, depends on all above

### Parallel Opportunities by Phase

**Foundational Phase (all [P] tasks can run in parallel)**:
- T006-T009: All type definitions
- T010-T019: All utility functions (different files)
- T020-T025: Dirty rectangle utils
- T026-T030: Polygon geometry utils
- T031-T035: Canvas renderer utils

**User Story 1 (parallel tasks)**:
- T047, T052, T056, T059, T062: All hook skeletons
- T091-T094: All CSS styles

**User Story 2 (parallel tasks)**:
- T140-T145: All performance validations
- T146-T151: All code quality tasks
- T152-T155: All documentation tasks
- T156-T163: All test tasks (if included)

---

## Parallel Example: Foundational Phase

Launch all utility files together:

```bash
# Batch 1: Type definitions
- T006: Define coordinate types in src/types/canvas.d.ts
- T007: Define Viewport in src/types/canvas.d.ts
- T008: Define CanvasLayer in src/types/canvas.d.ts
- T009: Define CoordinateTransform in src/types/canvas.d.ts

# Batch 2: Core utilities (all different files)
- T010-T012: devicePixelRatio.ts
- T013-T016: coordinateTransform.ts
- T017-T019: spatialIndex.ts
- T020-T025: dirtyRectTracking.ts
- T026-T030: polygonGeometry.ts
- T031-T035: canvasRenderer.ts
```

---

## Implementation Strategy

### MVP First (Minimal Viable Product)

**Goal**: Get Canvas rendering working ASAP for validation

1. ✅ Complete Phase 1: Setup (5 tasks, ~10 minutes)
2. ✅ Complete Phase 2: Foundational (46 tasks, ~2-3 days)
   - Many tasks parallelizable
   - CRITICAL: Blocks all user stories
3. ✅ Complete Phase 3: User Story 1 (48 tasks, ~3-4 days)
   - **STOP HERE FOR MVP**
   - Validate Canvas rendering works with real data
   - Test pan/zoom performance
   - Deploy/demo if ready
4. 🎯 Add Phase 4: User Story 2 (45 tasks, ~3-4 days)
   - Adds polygon selection capability
   - Still independently testable
5. ✨ Polish Phase 5 (~1-2 days)

**Total Estimate**: ~8-12 days for full feature (setup through polish)  
**MVP Estimate**: ~3-5 days (setup + foundational + US1)

### Incremental Delivery Checkpoints

- **Checkpoint 1** (After Phase 2): Foundation ready ✓
- **Checkpoint 2** (After Phase 3): Canvas rendering works ✓ → **DEPLOY MVP**
- **Checkpoint 3** (After Phase 4): Polygon selection works ✓ → **FULL FEATURE**
- **Checkpoint 4** (After Phase 5): Production ready ✓

### Validation at Each Checkpoint

**After User Story 1**:
- Load CD45_pos.csv (4800 points)
- Verify render completes in <2s
- Pan chart, verify 30+ FPS
- Zoom in/out, verify smooth performance
- Test on Retina display

**After User Story 2**:
- Draw polygon with 5-6 points
- Verify polygon renders on Canvas
- Check selected point count in Sidebar
- Draw overlapping polygons, verify additive color blending
- Delete polygon, verify selection clears
- Test selection calculation includes points outside viewport

---

## Notes

- **[P] marker**: Tasks use different files, no blocking dependencies, can run in parallel
- **[Story] marker**: Maps task to specific user story for traceability
- **File paths**: All paths are absolute from repository root
- **Checkpoint strategy**: Stop after each phase to validate independently
- **Constitution compliance**: Type safety via nominal types, D3 data binding preserved, React Context for state
- **Performance targets**: <2s render, 30+ FPS, 50% memory reduction vs SVG
- **Testing**: Framework selected but tests marked OPTIONAL per spec

---

## Task Count Summary

- **Setup**: 5 tasks
- **Foundational**: 46 tasks (CRITICAL PATH)
- **User Story 1**: 48 tasks (MVP)
- **User Story 2**: 45 tasks
- **Polish**: 16 tasks (optional testing: +8 tasks)
- **Total**: 160 tasks (168 with tests)

**Parallel Task Count**: ~60% of tasks marked [P] can run in parallel with proper coordination
