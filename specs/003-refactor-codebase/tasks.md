# Tasks: Codebase Refactoring for Maintainability

**Input**: Design documents from `/specs/003-refactor-codebase/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling configuration

- [ ] T001 Install eslint-plugin-import dependency via `npm install --save-dev eslint-plugin-import`
- [ ] T002 Configure ESLint import/no-cycle rule in eslint.config.mjs with maxDepth: 10
- [ ] T003 Run TypeScript validation baseline via `npm run tsc -- --noEmit` to establish error-free state
- [ ] T004 Create directory structure `src/utils/constants/` for constant definitions
- [ ] T005 Create directory structure for new type files (verify `src/types/` exists)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation can begin

**⚠️ CRITICAL**: All user story work depends on these tasks being complete

- [ ] T006 [P] Create shared color constants in src/utils/constants/colors.ts with COLORS object (POINT_UNSELECTED, POINT_UNSELECTED_ALPHA, POINT_SELECTED_ALPHA, POLYGON_DEFAULT, POLYGON_FILL_ALPHA, TEXT_PRIMARY)
- [ ] T007 [P] Create dimension constants in src/utils/constants/dimensions.ts with CHART_DIMENSIONS and FONT_SIZES objects
- [ ] T008 [P] Create performance constants in src/utils/constants/performance.ts with PERFORMANCE object (MAX_RENDER_TIME_MS, SELECTION_FEEDBACK_MS, STATS_UPDATE_MS, RESIZE_DEBOUNCE_MS, PAN_THROTTLE_MS)
- [ ] T009 [P] Create chart constants in src/utils/constants/chart.ts with CHART_CONSTANTS (DATA_DOMAIN_X, DATA_DOMAIN_Y, AXIS_LABELS, TICK_VALUES_X, TICK_VALUES_Y), LAYER_Z_INDEX enum
- [ ] T010 [P] Create polygon constants in src/utils/constants/polygon.ts with POLYGON_CONSTANTS object and PolygonState enum
- [ ] T011 [P] Create canvas constants in src/utils/constants/canvas.ts with CANVAS_CONSTANTS object and CanvasLayerId enum
- [ ] T012 [P] Create component type definitions in src/types/components.d.ts (ChartProps, PolygonProps, PopupEditorProps, SidebarProps, Polygon, Point, PolygonStyle interfaces)
- [ ] T013 [P] Create state type definitions in src/types/state.d.ts (ChartData, DataPoint, SelectionState, UIState, ShowPopup, DrawMode, Margins interfaces)
- [ ] T014 [P] Create hook type definitions in src/types/hooks.d.ts (CanvasRendererResult, RenderFunction, CoordinateTransformResult, PolygonSelectionResult, SpatialIndexResult interfaces)
- [ ] T015 Create ChartDataContext in src/contexts/ChartDataContext.tsx with read-only data provider, useChartData hook (CSV loading, D3 scales, dimensions)
- [ ] T016 Create ChartSelectionContext in src/contexts/ChartSelectionContext.tsx with reducer pattern (10 actions: ADD_POLYGON, UPDATE_POLYGON, DELETE_POLYGON, SELECT_POLYGON, DESELECT_POLYGON, CLEAR_SELECTION, START_DRAWING, ADD_POINT, COMPLETE_POLYGON, CANCEL_DRAWING) and dispatch context
- [ ] T017 Create ChartUIContext in src/contexts/ChartUIContext.tsx with reducer pattern (5 actions: OPEN_EDITOR, CLOSE_EDITOR, TOGGLE_SIDEBAR, SET_DRAW_MODE, TOGGLE_LABELS) and dispatch context
- [ ] T018 Update src/app/page.tsx to wrap app with ChartDataProvider, ChartSelectionProvider, ChartUIProvider (keep old ChartContext for now)

**Checkpoint**: Foundation ready - all constants, types, and contexts exist. User story implementation can now begin.

---

## Phase 3: User Story 1 - Developer Understands Codebase Quickly (Priority: P1) 🎯 MVP

**Goal**: Enable new developers to understand system architecture through clear code organization and comprehensive documentation

**Independent Test**: New developer can read documentation, identify major components, locate relevant code in under 5 minutes, and explain data flow without external help

**Tests**: None requested (manual validation via developer survey)

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create CSS module src/styles/PopupEditor.module.css with classes: modal, modalHeader, inputGroup, inputLabel, inputField, buttonGroup, saveButton, cancelButton
- [ ] T020 [US1] Refactor src/components/PopupEditor.tsx - import PopupEditorProps type from @/types/components, import styles from PopupEditor.module.css, replace all inline style={{}} with className={styles.*}, remove unused imports/variables
- [ ] T021 [US1] Add JSDoc documentation to PopupEditor component describing purpose (polygon property editor modal), parameters, return value, and usage example
- [ ] T022 [P] [US1] Create CSS module src/styles/Sidebar.module.css with classes: sidebar, sidebarExpanded, sidebarCollapsed, toggleButton, polygonList, polygonListItem, statistics, statisticsRow
- [ ] T023 [US1] Refactor src/components/Sidebar.tsx - import SidebarProps from @/types/components, import constants (colors, dimensions), import styles from Sidebar.module.css, replace inline styles with CSS classes, remove unused code
- [ ] T024 [US1] Add JSDoc documentation to Sidebar component describing purpose (polygon list and statistics display), state management, and interaction patterns
- [ ] T025 [P] [US1] Create CSS module src/styles/Polygon.module.css with classes: polygon, polygonSelected, polygonHovered, polygonPath, polygonLabel
- [ ] T026 [US1] Refactor src/components/Polygon.tsx - import PolygonProps and Polygon types from @/types/components, import POLYGON_CONSTANTS and PolygonState from @/utils/constants/polygon, import COLORS from @/utils/constants/colors, import styles from Polygon.module.css, replace inline styles, remove unused code
- [ ] T027 [US1] Add JSDoc documentation to Polygon component describing purpose (single polygon SVG path rendering), props, and selection behavior
- [ ] T028 [P] [US1] Update src/styles/Chart.module.css to add missing classes: chartContainer, svgCanvas, dataPointsLayer, polygonOverlayLayer, axesLayer, interactionLayer
- [ ] T029 [US1] Refactor src/components/Chart.tsx - import ChartProps from @/types/components, import all constants (CHART_CONSTANTS, CHART_DIMENSIONS, COLORS, LAYER_Z_INDEX), import styles from Chart.module.css, replace all magic numbers/strings with named constants (data domains, margins, tick values, axis labels, colors, alphas, z-indexes), replace remaining inline styles with CSS classes, remove unused imports/variables
- [ ] T030 [US1] Add JSDoc documentation to Chart component describing purpose (scatter plot and polygon overlay rendering), data flow, canvas layering, and performance characteristics
- [ ] T031 [P] [US1] Add JSDoc to useCanvasRenderer hook in src/hooks/useCanvasRenderer.ts describing purpose (canvas rendering lifecycle), parameters, return values (context, render, clear, invalidateRect), and usage example
- [ ] T032 [P] [US1] Add JSDoc to useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts describing coordinate space transformations (data space vs SVG space), D3 scale usage, return values (toScreen, toData functions), and example
- [ ] T033 [P] [US1] Add JSDoc to useDirtyRectTracking hook in src/hooks/useDirtyRectTracking.ts describing purpose (performance optimization via dirty rectangles), return values, and when to use
- [ ] T034 [P] [US1] Add JSDoc to usePolygonSelection hook in src/hooks/usePolygonSelection.ts describing purpose (polygon selection state with spatial indexing), return values (selectedPolygons, selectPolygon, deselectPolygon handlers), and point-in-polygon algorithm
- [ ] T035 [P] [US1] Add JSDoc to useSpatialIndex hook in src/hooks/useSpatialIndex.ts describing purpose (Flatbush R-tree for efficient spatial queries), return values (search, insert, rebuild functions), and performance characteristics
- [ ] T036 [P] [US1] Add JSDoc to useViewportCulling hook in src/hooks/useViewportCulling.ts describing purpose (viewport culling for large datasets), return values, and performance impact
- [ ] T037 [P] [US1] Add JSDoc to canvasRenderer utility in src/utils/canvas/canvasRenderer.ts describing purpose (canvas rendering primitives), all exported functions with @param and @returns tags, device pixel ratio handling
- [ ] T038 [P] [US1] Add JSDoc to coordinateTransform utility in src/utils/canvas/coordinateTransform.ts describing coordinate space transformations, D3 scale integration, @param tags for x/y coordinates and scales, @returns SVG coordinates, with example
- [ ] T039 [P] [US1] Add JSDoc to devicePixelRatio utility in src/utils/canvas/devicePixelRatio.ts describing purpose (HiDPI canvas rendering), return values, and browser compatibility
- [ ] T040 [P] [US1] Add JSDoc to dirtyRectTracking utility in src/utils/canvas/dirtyRectTracking.ts describing purpose (performance optimization), algorithm explanation, return values, and usage pattern
- [ ] T041 [P] [US1] Add JSDoc to polygonGeometry utility in src/utils/canvas/polygonGeometry.ts describing geometric algorithms (point-in-polygon, polygon area, centroid), @param/@returns for each function, time complexity notes
- [ ] T042 [P] [US1] Add JSDoc to spatialIndex utility in src/utils/canvas/spatialIndex.ts describing Flatbush R-tree implementation, spatial query algorithms, @param/@returns, performance characteristics (O(log n) search)
- [ ] T043 [P] [US1] Add JSDoc to loadCsvData utility in src/utils/data/loadCsvData.ts describing CSV parsing, data validation, error handling, @param (csvPath), @returns (DataPoint array), and async/await pattern
- [ ] T044 [US1] Create or update CLAUDE.md or docs/architecture.md with sections: Context Organization (3 domain contexts with responsibilities), Component Responsibilities (Chart, Polygon, PopupEditor, Sidebar with single responsibility descriptions), State Flow (diagram or description showing data/selection/UI contexts), CSS Organization (CSS Modules pattern, camel case naming), Constants Organization (shared vs component-specific), Type Organization (domain-based files in /src/types), Common Development Tasks (adding polygon property, debugging re-renders, changing styles, adding new component)

**Checkpoint**: User Story 1 complete - all components refactored with CSS modules, constants extracted, types consolidated, JSDoc added, architecture documented. New developers can now understand codebase structure.

---

## Phase 4: User Story 2 - Developer Modifies Components Independently (Priority: P1)

**Goal**: Enable developers to change one component without unintended side effects on others through modular design and isolated state management

**Independent Test**: Modify a single component and verify no other components require changes and all functionality still works

**Tests**: None requested (manual validation via modification test)

### Implementation for User Story 2

- [ ] T045 [P] [US2] Update src/components/Chart.tsx to use split contexts - replace useChartContext with useChartData, useChartSelection, useChartUI hooks, update all state references to use appropriate context
- [ ] T046 [P] [US2] Update src/components/Polygon.tsx to use split contexts - replace useChartContext with useChartSelection hook for selection state
- [ ] T047 [P] [US2] Update src/components/PopupEditor.tsx to use split contexts - replace useChartContext with useChartUI and useChartSelectionDispatch hooks, update editor open/close logic
- [ ] T048 [P] [US2] Update src/components/Sidebar.tsx to use split contexts - replace useChartContext with useChartData, useChartSelection, useChartUI hooks for sidebar state and polygon list
- [ ] T049 [US2] Manual testing - verify chart rendering works with split contexts (scatter plot displays, data loads correctly)
- [ ] T050 [US2] Manual testing - verify polygon selection works independently (click to select, multiple selection, deselect)
- [ ] T051 [US2] Manual testing - verify polygon drawing works independently (draw mode, add points, complete polygon, cancel drawing)
- [ ] T052 [US2] Manual testing - verify PopupEditor works independently (open editor, edit properties, save changes, close editor)
- [ ] T053 [US2] Manual testing - verify Sidebar works independently (toggle sidebar, view polygon list, view statistics, check/uncheck polygons)
- [ ] T054 [US2] Verify no cross-component contamination - grep codebase for direct component imports (components should only communicate via contexts and props, not direct imports)
- [ ] T055 [US2] Remove old ChartContext - verify no imports remain via `grep -r "ChartContext'" src/`, delete src/contexts/ChartContext.tsx, run npm run build to verify
- [ ] T056 [US2] Run React DevTools Profiler baseline measurement - record interaction (draw polygon, select, edit), measure re-render counts per component, document baseline for SC-005 comparison
- [ ] T057 [US2] Run React DevTools Profiler after refactoring - repeat same interaction, measure re-render counts, verify 30% reduction compared to baseline (selection change shouldn't re-render Chart, UI change shouldn't re-render Sidebar)

**Checkpoint**: User Story 2 complete - components use split contexts, each component independently modifiable, re-render optimization achieved. Developers can now modify components in isolation.

---

## Phase 5: User Story 3 - Developer Maintains Consistent Styling (Priority: P2)

**Goal**: Enable developers to maintain consistent styling and make theme changes easily through centralized CSS modules

**Independent Test**: Search codebase for inline style={{}} props and verify zero results, verify all styles in CSS module files, verify style changes only require CSS file edits

**Tests**: None requested (manual validation via grep search and visual inspection)

### Implementation for User Story 3

- [ ] T058 [US3] Run validation - grep for inline styles via `grep -r 'style={{' src/components/` and verify zero results (all inline styles should be converted to CSS classes)
- [ ] T059 [US3] Visual regression testing - compare screenshots of all components before/after refactoring (Chart, Polygon, PopupEditor, Sidebar) to verify visual appearance unchanged
- [ ] T060 [US3] Test CSS module scope - verify class names are scoped correctly (inspect rendered HTML in browser DevTools, verify class names have format ComponentName_className__hash)
- [ ] T061 [US3] Test dynamic styles - verify polygon colors from data still work correctly (check CSS custom property pattern `style={{ '--polygon-color': color }}` for data-driven colors)
- [ ] T062 [US3] Test responsive behavior - verify chart resizes correctly, sidebar toggle works, editor modal centers properly
- [ ] T063 [US3] Update CSS module naming conventions in contracts/css-module-conventions.md if any patterns discovered during refactoring (add examples for common patterns found)
- [ ] T064 [US3] Document CSS theming approach - add section to architecture docs explaining how to change colors/dimensions globally (update constants vs CSS variables approach)

**Checkpoint**: User Story 3 complete - all inline styles removed, CSS modules working correctly, visual appearance preserved, theming approach documented. Developers can now maintain styling consistently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T065 [P] Run full TypeScript validation via `npm run tsc -- --noEmit` and verify zero errors (strict mode compliance across all refactored files)
- [ ] T066 [P] Run ESLint full check via `npm run lint` and verify zero errors including import/no-cycle violations
- [ ] T067 [P] Run build validation via `npm run build` and verify successful build with no warnings
- [ ] T068 Verify SC-001 - new developer test (have someone unfamiliar read docs and identify component purposes within 30 min)
- [ ] T069 Verify SC-002 - count modules (confirm at least 5 distinct functional modules exist: components/, hooks/, utils/canvas/, utils/data/, contexts/, utils/constants/, types/)
- [ ] T070 Verify SC-003 - JSDoc coverage (confirm 100% of exported functions have JSDoc via manual review or documentation generator)
- [ ] T071 Verify SC-004 - file modification metric (will measure on next feature, document baseline of average files touched per feature)
- [ ] T072 Verify SC-005 - re-render reduction (confirm 30% fewer re-renders via React DevTools Profiler comparison from T056/T057)
- [ ] T073 Verify SC-006 - zero inline styles (confirm `grep -r 'style={{' src/components/` returns zero results)
- [ ] T074 Verify SC-007 - code location speed (developer survey: can locate code for feature in <5 min)
- [ ] T075 Verify SC-008 - feature parity (manual test all functionality: load data, draw polygon, select, edit, delete, sidebar toggle, statistics display)
- [ ] T076 Verify SC-009 - zero magic numbers (grep for multi-digit numbers in component logic, verify all are named constants: `grep -r '\b[0-9]\{2,\}\b' src/components/`)
- [ ] T077 Verify SC-010 - types in /src/types (verify all interfaces/types located in src/types/*.d.ts via `find src/types -name '*.d.ts'`)
- [ ] T078 Verify SC-011 - zero unused code (run `npm run lint` to verify no unused imports/variables in refactored files)
- [ ] T079 Run quickstart.md validation steps - execute all validation commands from quickstart.md final validation section
- [ ] T080 Performance testing - verify scatter plot renders <500ms for 4800+ points (CD45_pos.csv), polygon selection feedback <100ms, statistics update <200ms
- [ ] T081 [P] Update README.md with refactored architecture section (context organization, component responsibilities, development workflow)
- [ ] T082 Create developer onboarding guide with common tasks (adding new component, adding new polygon property, debugging re-renders, changing styles)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T005) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T006-T018) completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (T019-T044) completion - requires components to be refactored before context migration
- **User Story 3 (Phase 5)**: Depends on User Story 1 (T019-T044) completion - validates CSS module implementation
- **Polish (Phase 6)**: Depends on all user stories (T019-T064) completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundational phase - focuses on component refactoring, documentation
- **User Story 2 (P1)**: Depends on User Story 1 - cannot migrate to split contexts until components are refactored
- **User Story 3 (P2)**: Independent after User Story 1 - validates CSS implementation

### Within Each User Story

**User Story 1 (Component Refactoring)**:
- Constants creation (T006-T011) before component refactoring (T019-T030)
- Type creation (T012-T014) before component refactoring
- Context creation (T015-T018) before component updates
- Component refactoring (T019-T030) before JSDoc addition (T031-T043)
- JSDoc (T031-T043) can run in parallel (different files)
- Architecture docs (T044) after all JSDoc complete

**User Story 2 (Context Migration)**:
- Component context updates (T045-T048) can run in parallel (different files)
- Manual testing (T049-T053) after component updates
- Validation (T054-T055) after manual testing passes
- Profiler measurements (T056-T057) after validation

**User Story 3 (Styling Validation)**:
- All validation tasks (T058-T064) can run in parallel

### Parallel Opportunities

- **Setup Phase**: T001-T005 can run in parallel (different configurations)
- **Foundational - Constants**: T006-T011 can run in parallel (different files)
- **Foundational - Types**: T012-T014 can run in parallel (different files)
- **US1 - CSS Creation**: T019, T022, T025, T028 can run in parallel (different CSS files)
- **US1 - Component JSDoc**: T031-T043 can run in parallel (different files)
- **US2 - Component Updates**: T045-T048 can run in parallel (different component files)
- **US2 - Manual Testing**: T049-T053 can run in sequence per feature area
- **US3 - Validation**: T058-T064 can run in parallel (different validation types)
- **Polish - Validation**: T065-T067 can run in parallel (different tools)
- **Polish - Success Criteria**: T068-T078 verification can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all constant creation tasks together (T006-T011):
Task: "Create shared color constants in src/utils/constants/colors.ts"
Task: "Create dimension constants in src/utils/constants/dimensions.ts"
Task: "Create performance constants in src/utils/constants/performance.ts"
Task: "Create chart constants in src/utils/constants/chart.ts"
Task: "Create polygon constants in src/utils/constants/polygon.ts"
Task: "Create canvas constants in src/utils/constants/canvas.ts"

# Launch all type creation tasks together (T012-T014):
Task: "Create component type definitions in src/types/components.d.ts"
Task: "Create state type definitions in src/types/state.d.ts"
Task: "Create hook type definitions in src/types/hooks.d.ts"
```

## Parallel Example: User Story 1 (Component Refactoring)

```bash
# Launch all CSS module creation tasks together (T019, T022, T025, T028):
Task: "Create CSS module src/styles/PopupEditor.module.css"
Task: "Create CSS module src/styles/Sidebar.module.css"
Task: "Create CSS module src/styles/Polygon.module.css"
Task: "Update src/styles/Chart.module.css"

# Launch all JSDoc tasks together (T031-T043):
Task: "Add JSDoc to useCanvasRenderer hook"
Task: "Add JSDoc to useCoordinateTransform hook"
Task: "Add JSDoc to useDirtyRectTracking hook"
Task: "Add JSDoc to usePolygonSelection hook"
Task: "Add JSDoc to useSpatialIndex hook"
Task: "Add JSDoc to useViewportCulling hook"
Task: "Add JSDoc to canvasRenderer utility"
Task: "Add JSDoc to coordinateTransform utility"
Task: "Add JSDoc to devicePixelRatio utility"
Task: "Add JSDoc to dirtyRectTracking utility"
Task: "Add JSDoc to polygonGeometry utility"
Task: "Add JSDoc to spatialIndex utility"
Task: "Add JSDoc to loadCsvData utility"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T018) - CRITICAL
3. Complete Phase 3: User Story 1 (T019-T044) - Component refactoring + docs
4. Complete Phase 4: User Story 2 (T045-T057) - Context migration + isolation
5. **STOP and VALIDATE**: Test that components are modular and well-documented
6. Deploy/demo if ready (P1 priorities complete)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (constants, types, contexts exist)
2. Add User Story 1 → Test independently → Components refactored, documented (P1)
3. Add User Story 2 → Test independently → Components isolated, optimized (P1)
4. Add User Story 3 → Test independently → Styling validated (P2)
5. Polish → Final validation → All success criteria met

### Parallel Team Strategy

With 2-3 developers after Foundational phase (T018) completes:

- **Developer A**: User Story 1 component refactoring (T019-T030) → PopupEditor, Sidebar
- **Developer B**: User Story 1 component refactoring (T019-T030) → Polygon, Chart
- **Developer C**: User Story 1 JSDoc (T031-T043) in parallel with A/B
- After US1: All developers collaborate on User Story 2 context migration (T045-T057)
- After US2: Quick parallel validation of User Story 3 (T058-T064)

---

## Notes

- **[P] markers**: Tasks marked with [P] operate on different files with no dependencies and can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability (US1, US2, US3)
- **Tests**: No test tasks included per spec (manual validation via visual inspection and manual testing)
- **Incremental validation**: Each user story has checkpoint for independent testing before proceeding
- **Context migration dependency**: User Story 2 (context migration) requires User Story 1 (component refactoring) to complete first
- **CSS modules**: All CSS files created in centralized `/src/styles/` directory per research.md decision
- **Constants organization**: Shared constants (colors, dimensions, performance) separate from component-specific (chart, polygon, canvas)
- **Type organization**: Domain-based files (components.d.ts, state.d.ts, hooks.d.ts) in `/src/types/`
- **Commit strategy**: Commit after each component refactoring (T019-T030), after context creation (T015-T018), after each user story completion
- **Validation checkpoints**: End of each phase validates independent functionality before proceeding
- **Success criteria verification**: Phase 6 includes explicit tasks for all 11 success criteria (SC-001 through SC-011)
