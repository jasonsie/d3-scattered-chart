# Implementation Plan: Canvas-Based Chart Rendering

**Branch**: `002-canvas-rendering` | **Date**: 2025-12-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-canvas-rendering/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace the current SVG-based scatter plot rendering with HTML5 Canvas to achieve better performance for datasets up to 10,000+ points. The implementation uses a dual-layer Canvas architecture (main data layer + polygon overlay layer) with viewport culling for rendering optimization. Target performance: initial render <2s for 5000 points, 30+ FPS during pan/zoom interactions. Technical approach includes React useRef for Canvas context management, useState for reactive data/selection state, and requestAnimationFrame with dirty rectangle tracking for efficient updates.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js 20.9.0+  
**Primary Dependencies**: React 19.2.0, Next.js 16.0.0, D3.js 7.9.0  
**Storage**: CSV files (public/data/), client-side state (React Context)  
**Testing**: NEEDS CLARIFICATION (no testing framework currently configured)  
**Target Platform**: Web browsers (Chrome/Safari/Firefox latest), high-DPI displays  
**Project Type**: Web application (Next.js single-page app)  
**Performance Goals**: <2s initial render for 5000 points on Intel i5/8GB RAM/integrated graphics, 30+ FPS pan/zoom  
**Constraints**: <200ms selection calculation, viewport culling for 10k+ points, 50 concurrent polygons  
**Scale/Scope**: ~4800 data points (CD45_pos.csv), up to 10k+ point support, ~5-7 React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Interactive UX First
**Status**: ✅ PASS  
**Evidence**: Spec FR-004 requires 30+ FPS during pan/zoom with requestAnimationFrame. FR-007a requires immediate feedback (cancel polygon on outside-viewport click). All interactions maintain <100ms visual feedback requirement from constitution.

### II. Data-Driven Rendering
**Status**: ⚠️ CONDITIONAL PASS - NEEDS DESIGN CLARIFICATION  
**Issue**: Switching from SVG to Canvas fundamentally changes rendering paradigm. D3 selections work on DOM elements, but Canvas uses imperative draw commands.  
**Gate Requirement**: Phase 1 design MUST clarify whether:
- D3 continues to manage data binding and scale transformations (constitution compliant)
- D3 is relegated to scales-only with React managing draw loops (potential violation)
- Hybrid approach where D3 manages data structures but Canvas API performs rendering

**Resolution Plan**: Research.md must document recommended D3+Canvas integration patterns. If D3 data binding is lost, this MUST be justified in Complexity Tracking table.

### III. Context-Based State Management
**Status**: ✅ PASS  
**Evidence**: FR-016, FR-017 explicitly require React useRef for Canvas contexts and useState for data/selection state. ChartContext already exists with useReducer pattern. No violations detected.

### IV. Type Safety
**Status**: ✅ PASS  
**Evidence**: TypeScript strict mode enabled in tsconfig.json. Spec requires typed Canvas contexts, coordinate transforms, and selection state. Existing codebase already follows strict typing patterns.

### V. Incremental Feature Delivery
**Status**: ✅ PASS  
**Evidence**: Spec defines two P1 user stories that are independently testable:
- Story 1: Canvas rendering (can test without polygon drawing)
- Story 2: Polygon selection on Canvas (depends on Story 1 but is separate feature)

Each story has clear acceptance criteria and can be demonstrated as working functionality.

---

**GATE DECISION**: CONDITIONAL PASS - proceed to Phase 0 research with requirement to resolve Data-Driven Rendering question. If D3 data binding pattern cannot be preserved with Canvas, violation must be documented in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # Next.js root layout
│   └── page.tsx                # Main app page
├── components/
│   ├── Chart.tsx               # MODIFIED: Canvas-based scatter plot (was SVG)
│   ├── Polygon.tsx             # MODIFIED: Canvas polygon drawing (was SVG)
│   ├── PopupEditor.tsx         # Unchanged: polygon metadata editor
│   └── Sidebar.tsx             # Unchanged: polygon list sidebar
├── contexts/
│   └── ChartContext.tsx        # MODIFIED: Add Canvas refs, viewport state
├── hooks/                      # NEW: Custom hooks for Canvas operations
│   ├── useCanvasRenderer.ts    # Canvas rendering logic
│   ├── useViewportCulling.ts   # Viewport culling calculations
│   └── usePolygonSelection.ts  # Point-in-polygon calculations
├── types/
│   ├── canvas.d.ts             # NEW: Canvas-specific type definitions
│   ├── global.d.ts             # Existing global types
│   └── css.d.ts                # CSS module types
├── utils/
│   ├── canvas/                 # NEW: Canvas utility functions
│   │   ├── coordinateTransform.ts  # Data space ↔ screen space
│   │   ├── dirtyRectTracking.ts    # Partial update optimization
│   │   └── devicePixelRatio.ts     # High-DPI handling
│   └── data/
│       └── loadCsvData.ts      # Unchanged: CSV data loading
└── styles/
    ├── Chart.module.css        # Existing chart styles
    ├── globals.css             # Global styles
    └── page.module.css         # Page styles

public/
└── data/
    └── CD45_pos.csv            # Unchanged: dataset file

specs/002-canvas-rendering/
├── plan.md                     # This file
├── research.md                 # Phase 0 output
├── data-model.md               # Phase 1 output
├── quickstart.md               # Phase 1 output
└── contracts/                  # Phase 1 output
    ├── canvas-renderer-api.md
    ├── viewport-state.md
    └── component-interfaces.md
```

**Structure Decision**: Web application (Next.js single-page app). New Canvas-specific code organized under `hooks/` for React patterns and `utils/canvas/` for pure utility functions. Existing component structure preserved to minimize migration risk. TypeScript ensures coordinate system type safety between data/screen spaces.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. The Canvas migration preserves all constitution principles:

- **Data-Driven Rendering**: D3 retains control of data binding, scales, and coordinate transformations. Canvas is the rendering surface, not the data controller.
- All other principles (Interactive UX, Context-Based State, Type Safety, Incremental Delivery) are fully compliant as documented in Constitution Check section above.

---

## Post-Phase 1 Constitution Re-Evaluation

**Date**: 2025-12-02  
**Status**: ✅ ALL GATES PASS

### II. Data-Driven Rendering - RESOLVED

**Original Concern**: Canvas rendering might violate D3 data binding pattern

**Resolution**: Research (research.md) and design (data-model.md, contracts/) confirm **Hybrid Architecture**:
- D3 manages data binding via `d3.selectAll(data).data().join()` pattern
- D3 scales provide coordinate transformations (data space ↔ screen space)
- D3 computes Canvas draw commands through data binding
- Canvas API is merely the rendering surface (not a D3 replacement)

**Example from Design**:
```typescript
// D3 data binding preserved
const points = d3.selectAll(data)
  .data(dataPoints)
  .join(
    enter => enter.map(d => ({ x: xScale(d.x), y: yScale(d.y), ...d }))
  );

// Canvas renders computed points (D3-driven)
points.forEach(point => ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI));
```

**Constitution Compliance**: ✅ PASS - D3 retains semantic control over data-to-visual mapping

### All Other Principles - CONFIRMED PASS

- **I. Interactive UX First**: requestAnimationFrame + dirty rectangles ensure <100ms feedback
- **III. Context-Based State**: ChartContext extended (not replaced), useReducer pattern preserved
- **IV. Type Safety**: Nominal types for coordinate systems (DataX/ScreenX) prevent mixing
- **V. Incremental Delivery**: Two P1 user stories independently testable

**FINAL GATE DECISION**: ✅ UNCONDITIONAL PASS - Proceed to Phase 2 (/speckit.tasks)
