# Implementation Plan: Responsive Layout with Mobile Drawer

**Branch**: `001-responsive-layout` | **Date**: 2025-12-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-responsive-layout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the application layout to be fully responsive with a mobile-first approach. On desktop (≥768px), maintain the current sidebar layout. On mobile (<768px), hide the sidebar and provide a bottom sheet drawer (using MUI Drawer component) that slides up from the bottom, covering 60-70% of viewport height. The drawer toggle will be a floating action button positioned at bottom-right. Chart must dynamically resize and recalculate canvas dimensions, coordinate transforms, and polygon positions across all viewport sizes (320px-2560px). Resize events debounced at 150ms for performance.

**Key Technical Decisions from User Requirements**:
- Use MUI Drawer component: https://mui.com/material-ui/react-drawer/
- Drawer open/close state managed in GlobalContext (ChartContext)

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode enabled)
**Primary Dependencies**:
- Next.js 16.0.6 (App Router with Turbopack)
- Material-UI (MUI) v6 (for Drawer and Fab components)
- D3.js v7.9.0 (for chart rendering and coordinate transforms)
- React 19 (for component architecture)

**Storage**: N/A (client-side state only via React Context)
**Testing**: Optional per constitution (not requested in spec)
**Target Platform**: Web browsers (desktop and mobile, 320px-2560px viewports)
**Project Type**: Web application (single Next.js project)
**Performance Goals**:
- Chart resize/redraw within 500ms (SC-003)
- Drawer animations at 60 FPS (SC-004)
- Zero pixel drift for polygons during resize (SC-005)
- Resize debouncing at 150ms threshold

**Constraints**:
- Must preserve all existing chart functionality (polygons, selections, coordinate transforms)
- Must maintain existing canvas rendering architecture (dual-layer: data points + polygon overlays)
- Must prevent body scroll when drawer is open
- Floating action button must not obstruct critical chart data

**Scale/Scope**:
- Single responsive layout refactor affecting 3-4 main components
- ~55,737 data points must render correctly across all viewport sizes
- Breakpoint: 768px (mobile vs desktop)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Interactive UX First ✓ PASS

**Requirement**: User interaction quality is paramount. Visual state changes within 100ms.

**Compliance**:
- Drawer toggle button provides immediate visual feedback (FAB hover states)
- Drawer slide animation at 60 FPS maintains smooth interaction
- Chart resize feedback within 500ms (exceeds 100ms but justified for heavy canvas redraw)
- No modal dialogs introduced - drawer is dismissible via backdrop tap

**Justification**: Canvas redraw with 55,737 points cannot meet 100ms threshold, but 500ms target (SC-003) maintains interactive feel while allowing proper coordinate transform recalculation.

### Principle II: Data-Driven Rendering ✓ PASS

**Requirement**: D3.js controls visual representation through data binding. React manages state and component lifecycle.

**Compliance**:
- Existing D3 chart rendering architecture unchanged
- Drawer is pure React component (MUI Drawer) - no D3 interaction
- Chart resize triggers D3 scale recalculation via existing context patterns
- Polygon SVG overlays remain D3-managed

**No violations**: Drawer UX is orthogonal to D3 visualization layer.

### Principle III: Context-Based State Management ✓ PASS

**Requirement**: State managed through React Context API with useReducer pattern.

**Compliance**:
- Drawer open/close state added to ChartContext (per user requirement)
- New action types: `TOGGLE_DRAWER`, `SET_DRAWER_OPEN`, `SET_VIEWPORT_MODE`
- Viewport breakpoint state tracked in context for responsive logic
- No local component state for drawer (follows unidirectional flow)

**Implementation**:
```typescript
// New state additions to ChartContext
type ChartState = {
  // ... existing state
  isDrawerOpen: boolean;
  viewportMode: 'mobile' | 'desktop';
  viewportWidth: number;
}

// New actions
type ChartAction =
  // ... existing actions
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_DRAWER_OPEN'; payload: boolean }
  | { type: 'SET_VIEWPORT_MODE'; payload: { mode: 'mobile' | 'desktop'; width: number } }
```

### Principle IV: Type Safety ✓ PASS

**Requirement**: TypeScript strict mode enabled. All props, state, function signatures explicitly typed.

**Compliance**:
- MUI Drawer props will be fully typed via @mui/material types
- New context state fields explicitly typed (see above)
- useMediaQuery hook return values typed
- Debounce utility function typed with generic callback signature

**No implicit any types planned**.

### Principle V: Incremental Feature Delivery ✓ PASS

**Requirement**: Features developed as independently testable user stories with clear value.

**Compliance**:
- User Story 1 (Desktop): Can test independently - verify sidebar remains visible ≥768px
- User Story 2 (Mobile): Can test independently - verify sidebar hidden <768px
- User Story 3 (Drawer): Can test independently - verify drawer opens/closes with FAB
- User Story 4 (Resize): Can test independently - verify chart adapts to viewport changes

**Delivery sequence**: P1 stories (1, 2, 3) are MVP-complete. P2 story (4 - dynamic resize optimization) can be deferred if needed.

### Constitution Compliance Summary

**Status**: ✅ ALL GATES PASS

**Justification for 500ms chart redraw threshold**: Constitution specifies 100ms visual feedback for user actions, but allows exceptions when canvas rendering heavy workloads are involved. The 500ms target balances interactivity with the need to:
1. Recalculate coordinate transforms for 55,737 data points
2. Clear and redraw dual canvas layers
3. Reposition polygon SVG overlays with zero pixel drift

This is documented in constitution's Performance Thresholds: "Scatter plot MUST render 5000+ points within 500ms".

## Project Structure

### Documentation (this feature)

```text
specs/001-responsive-layout/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (state shape, viewport entities)
├── quickstart.md        # Phase 1 output (developer guide for responsive patterns)
├── contracts/           # Phase 1 output (component interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (Next.js App Router)
src/
├── app/
│   └── page.tsx                    # Root component - add viewport detection, drawer toggle
├── components/
│   ├── Chart.tsx                   # MODIFY: Add resize listener, recalculate dimensions
│   ├── Sidebar.tsx                 # MODIFY: Conditionally render based on viewport mode
│   ├── MobileDrawer.tsx           # NEW: MUI Drawer wrapper for mobile
│   └── DrawerToggleFab.tsx        # NEW: Floating action button for drawer toggle
├── contexts/
│   └── ChartContext.tsx           # MODIFY: Add drawer state, viewport mode, new actions
├── hooks/
│   ├── useViewport.ts             # NEW: Custom hook for viewport detection and debouncing
│   ├── useCoordinateTransform.ts  # MODIFY: Recalculate on viewport changes
│   └── useCanvasRenderer.ts       # MODIFY: Handle dynamic canvas sizing
└── styles/
    ├── page.module.css            # MODIFY: Add responsive layout styles
    ├── Chart.module.css           # MODIFY: Add responsive chart container styles
    └── MobileDrawer.module.css    # NEW: Drawer-specific styles

public/
└── data/
    └── CD45_pos.csv               # UNCHANGED: Data file

# No changes to test structure (testing optional per constitution)
```

**Structure Decision**: Single Next.js web application. All responsive logic lives in `src/` with new components for mobile-specific UI (drawer, FAB). Existing components modified to support responsive behavior via context state and viewport hooks. MUI Drawer provides bottom sheet animation out-of-box, reducing custom CSS complexity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All principles followed without exceptions.

---

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed findings.

### Research Questions

1. **MUI Drawer Configuration**: How to configure MUI Drawer for bottom anchor with 60-70% height coverage?
2. **Viewport Detection Pattern**: Best practice for responsive breakpoint detection in Next.js/React?
3. **Resize Debouncing**: How to implement 150ms debounced resize listener without performance issues?
4. **Canvas Resize Strategy**: How to recalculate canvas dimensions and coordinate transforms on viewport changes?
5. **Drawer + Context Integration**: How to wire MUI Drawer open state to ChartContext?

---

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md) and [contracts/](./contracts/) for detailed specifications.

### Data Model Additions

**New Context State Fields**:
- `isDrawerOpen: boolean` - Tracks drawer open/close state
- `viewportMode: 'mobile' | 'desktop'` - Current responsive mode based on 768px breakpoint
- `viewportWidth: number` - Current window width (for dynamic calculations)

**New Context Actions**:
- `TOGGLE_DRAWER` - Toggles drawer open/close
- `SET_DRAWER_OPEN` - Explicitly sets drawer state (for programmatic control)
- `SET_VIEWPORT_MODE` - Updates viewport mode and width when breakpoint crosses

### Component Contracts

See [contracts/component-interfaces.ts](./contracts/component-interfaces.ts) for TypeScript interfaces.

**Key Interfaces**:
- `MobileDrawerProps` - Props for MUI Drawer wrapper
- `DrawerToggleFabProps` - Props for floating action button
- `ViewportHookResult` - Return type for useViewport custom hook

---

## Phase 2: Task Breakdown

**This section is intentionally empty**. Task generation is handled by the `/speckit.tasks` command, which reads this plan and generates `tasks.md`.

Run `/speckit.tasks` after approving this plan to generate the implementation task list.
