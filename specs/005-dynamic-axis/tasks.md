---

description: "Task breakdown for Dynamic Axis Selection feature implementation"
---

# Tasks: Dynamic Axis Selection

**Input**: Design documents from `/specs/005-dynamic-axis/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL per project constitution - NOT included in this task list

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add axis configuration constants and type definitions

- [X] T001 [P] Create axis constants file in src/utils/constants/axis.ts with DATA_PROPERTY_NAMES array, DEFAULT_AXIS_CONFIG constant, and parsePropertyLabel utility function
- [X] T002 [P] Extend state type definitions in src/types/state.d.ts with AxisConfiguration, DataPropertyName, DataPropertyMetadata interfaces
- [X] T003 [P] Add component type definitions in src/types/components.d.ts with AxisSelectorProps, UnitScaleControlProps, LoadingProps interfaces

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Extend ChartContext state in src/contexts/ChartContext.tsx with axisConfig field (default DEFAULT_AXIS_CONFIG) and isRendering field (default false)
- [X] T005 Add ChartContext actions in src/contexts/ChartContext.tsx for SET_AXIS_CONFIG, SET_RENDERING, and RESET_VIEWPORT
- [X] T006 Implement reducer cases in src/contexts/ChartContext.tsx for SET_AXIS_CONFIG (merges partial config, sets scales to null), SET_RENDERING (updates flag), and RESET_VIEWPORT (resets zoom/pan)
- [X] T007 [P] Create GlobalContext in src/contexts/GlobalContext.tsx with GlobalState interface (isLoading, loadingMessage), GlobalProvider component, useGlobalState and useGlobalDispatch hooks
- [X] T008 [P] Create data validation utility in src/utils/data/validateData.ts with isValidDataPoint function that checks for null, NaN, and Infinity values
- [X] T009 Update app layout in src/app/layout.tsx to wrap entire app with GlobalProvider (outermost) then ChartProvider, and add AppContent component that conditionally renders Loading component based on useGlobalState

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Select Different Axes for Visualization (Priority: P1) 🎯 MVP

**Goal**: Enable users to dynamically select x-axis and y-axis properties from sidebar dropdowns, with automatic chart re-rendering, polygon retention confirmation, and mutual exclusion of selected properties.

**Independent Test**: Open sidebar, select "Kappa-FITC" from x-axis dropdown, verify chart re-renders with data points repositioned. Select "Lambda-PE" from y-axis dropdown, verify mutual exclusion (Kappa-FITC no longer appears in y-axis options). Draw a polygon, change axis, verify confirmation dialog appears.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create AxisSelector component in src/components/AxisSelector.tsx with Material-UI Select dropdown, helper text ("X-Axis" or "Y-Axis"), field label ("x-axis || y-axis"), and option filtering to exclude opposite axis property
- [X] T011 [P] [US1] Add confirmation dialog to AxisSelector component in src/components/AxisSelector.tsx using Material-UI Dialog with title "Keep existing polygons?", message text, and "Keep" / "Remove" buttons
- [X] T012 [P] [US1] Create AxisSelector CSS module in src/styles/AxisSelector.module.css with styling for dropdown spacing and dialog presentation
- [X] T013 [US1] Implement AxisSelector change handler in src/components/AxisSelector.tsx that checks for existing polygons, shows confirmation dialog if needed, parses property label to extract marker and unit, and dispatches SET_AXIS_CONFIG action
- [X] T014 [US1] Add AxisSelector components to Sidebar in src/components/Sidebar.tsx (one for x-axis, one for y-axis) above existing polygon controls
- [X] T015 [US1] Update Sidebar CSS module in src/styles/Sidebar.module.css to add spacing between axis selectors and polygon list
- [X] T016 [US1] Update Chart component in src/components/Chart.tsx to filter valid data points using isValidDataPoint utility before scale creation
- [X] T017 [US1] Update Chart component scale creation useEffect in src/components/Chart.tsx to use axisConfig.xProperty and axisConfig.yProperty instead of hardcoded 'x' and 'y' properties, rebuild scales when axis properties change, and dispatch RESET_VIEWPORT
- [X] T018 [US1] Add rendering state management in src/components/Chart.tsx to dispatch SET_RENDERING(true) at start of render and SET_RENDERING(false) on completion using requestAnimationFrame
- [X] T019 [US1] Update Chart component to use useGlobalDispatch in src/components/Chart.tsx to set global loading state (isLoading: true, loadingMessage: 'Rendering chart...') during axis changes
- [X] T020 [US1] Update useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts to rebuild coordinate transforms when axisConfig changes (xProperty or yProperty)
- [X] T021 [US1] Update useSpatialIndex hook in src/hooks/useSpatialIndex.ts to rebuild spatial index when axisConfig changes (xProperty or yProperty)
- [X] T022 [US1] Update usePolygonSelection hook in src/hooks/usePolygonSelection.ts to recalculate polygon statistics using new axis properties after axis change, filtering points by isValidDataPoint
- [X] T023 [US1] Update canvasRenderer utility in src/utils/canvas/canvasRenderer.ts to use dynamic axis properties from axisConfig instead of hardcoded data.x and data.y

**Checkpoint**: At this point, User Story 1 should be fully functional - users can select different axes, chart re-renders correctly, polygons have confirmation dialog, and dropdown options exclude opposite axis selection

---

## Phase 4: User Story 2 - Understand Current Axis Configuration (Priority: P2)

**Goal**: Display clear axis labels that update dynamically when axes change, showing property names and measurement units for proper data interpretation.

**Independent Test**: Change x-axis to "CD10-ECD", verify x-axis label displays "CD10-ECD (ECD)". Change y-axis to "CD5-PC5.5", verify y-axis label displays "CD5-PC5.5 (PC5.5)". Change to "TIME" axis, verify label shows "TIME" without unit parentheses.

### Implementation for User Story 2

- [X] T024 [US2] Update Chart component axis label rendering in src/components/Chart.tsx to use axisConfig.xLabel and axisConfig.xUnit for x-axis label, formatted as "[label] ([unit])" or "[label]" if unit is empty string
- [X] T025 [US2] Update Chart component axis label rendering in src/components/Chart.tsx to use axisConfig.yLabel and axisConfig.yUnit for y-axis label, formatted as "[label] ([unit])" or "[label]" if unit is empty string
- [X] T026 [US2] Add useEffect in src/components/Chart.tsx to update D3 axis label selections when axisConfig changes (specifically xLabel, yLabel, xUnit, yUnit fields)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - axis selection updates labels automatically with correct formatting

---

## Phase 5: User Story 3 - Control Measurement Unit Scaling (Priority: P3)

**Goal**: Provide a range control (slider) in sidebar for adjusting measurement unit scaling from 100 to 2000, with default 1000, that updates axis scales without changing data values.

**Independent Test**: Locate measurement unit scale slider in sidebar, drag to 500, verify axis scales compress (data appears more spread out), drag to 2000, verify axis scales expand (data appears more compressed), verify setting persists across axis property changes.

### Implementation for User Story 3

- [X] T027 [P] [US3] Create UnitScaleControl component in src/components/UnitScaleControl.tsx using Material-UI Slider with range 100-2000, step 10, default value from axisConfig.unitScale, marks at 100/1000/2000, and disabled state tied to isRendering
- [X] T028 [P] [US3] Create UnitScaleControl CSS module in src/styles/UnitScaleControl.module.css with styling for slider component and spacing
- [X] T029 [US3] Implement UnitScaleControl handlers in src/components/UnitScaleControl.tsx with onChange for preview (optional) and onChangeCommitted to dispatch SET_AXIS_CONFIG with new unitScale value
- [X] T030 [US3] Add UnitScaleControl component to Sidebar in src/components/Sidebar.tsx below axis selectors and above polygon list
- [X] T031 [US3] Update Chart component scale creation in src/components/Chart.tsx to apply unitScale factor (unitScale / 1000) to scale domains before creating D3 scales
- [X] T032 [US3] Update Chart component scale creation useEffect dependencies in src/components/Chart.tsx to include axisConfig.unitScale so scales rebuild when unit scale changes

**Checkpoint**: All user stories should now be independently functional - full axis configuration with property selection, labeling, and unit scaling

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T033 [P] Create Loading component in src/components/Loading.tsx with plant circles animation (3 circles with staggered grow animation) and optional message prop
- [X] T034 [P] Create Loading CSS module in src/styles/Loading.module.css with overlay, plant circles animation keyframes, and message styling based on CodePen reference
- [X] T035 Add polygon loading indicators in src/components/Polygon.tsx to show loading state while statistics recalculate after axis change
- [X] T036 Update Polygon CSS module in src/styles/Polygon.module.css to add loading indicator styling (spinner or pulse animation)
- [X] T037 [P] Update loadCsvData utility in src/utils/data/loadCsvData.ts to return all CSV columns as typed properties (ensure all 15 data properties are accessible)
- [X] T038 [P] Add error handling in src/components/Chart.tsx for scale rebuild failures (catch errors from D3 extent calculation, log warnings, display user-friendly error message)
- [X] T039 Performance optimization: Add React.memo to AxisSelector in src/components/AxisSelector.tsx to prevent unnecessary re-renders
- [X] T040 Performance optimization: Add React.memo to UnitScaleControl in src/components/UnitScaleControl.tsx to prevent unnecessary re-renders
- [X] T041 Run quickstart.md validation by following Step 1-10 in /specs/005-dynamic-axis/quickstart.md to ensure all implementation matches documented workflow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable (labels update based on axis selection state)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable (unit scaling applies to any selected axes)

### Within Each User Story

**User Story 1 (P1) Task Order**:
- T010, T011, T012 can run in parallel (component, dialog, styles - different files)
- T013 depends on T010, T011 (implements handler for component and dialog)
- T014 depends on T010, T013 (adds completed component to Sidebar)
- T015 depends on T014 (styles Sidebar after components added)
- T016, T017, T018, T019 are sequential changes to Chart.tsx (apply one at a time)
- T020, T021, T022, T023 can run in parallel (different hook/utility files)

**User Story 2 (P2) Task Order**:
- T024, T025 are sequential changes to Chart.tsx (both modify axis label rendering)
- T026 depends on T024, T025 (adds useEffect after label rendering logic updated)

**User Story 3 (P3) Task Order**:
- T027, T028 can run in parallel (component and styles - different files)
- T029 depends on T027 (implements handlers for component)
- T030 depends on T027, T029 (adds completed component to Sidebar)
- T031, T032 are sequential changes to Chart.tsx (apply one at a time)

**Polish Phase (Phase 6) Task Order**:
- T033, T034, T035, T036, T037, T038 can run in parallel (different files)
- T039, T040 can run in parallel (independent memoization)
- T041 runs last (validates entire implementation)

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks T001-T003 run in parallel (different files)

**Phase 2 (Foundational)**: T007, T008, T009 run in parallel (GlobalContext, validation, layout - different files), then T004-T006 run sequentially (all modify ChartContext.tsx)

**Phase 3 (User Story 1)**:
```bash
# Parallel batch 1: Component structure
T010: "Create AxisSelector component in src/components/AxisSelector.tsx..."
T011: "Add confirmation dialog to AxisSelector component..."
T012: "Create AxisSelector CSS module in src/styles/AxisSelector.module.css..."

# After T010-T012 complete, parallel batch 2: Hook updates
T020: "Update useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts..."
T021: "Update useSpatialIndex hook in src/hooks/useSpatialIndex.ts..."
T022: "Update usePolygonSelection hook in src/hooks/usePolygonSelection.ts..."
T023: "Update canvasRenderer utility in src/utils/canvas/canvasRenderer.ts..."
```

**Phase 5 (User Story 3)**:
```bash
# Parallel batch: Component structure
T027: "Create UnitScaleControl component in src/components/UnitScaleControl.tsx..."
T028: "Create UnitScaleControl CSS module in src/styles/UnitScaleControl.module.css..."
```

**Phase 6 (Polish)**:
```bash
# Parallel batch 1: Independent enhancements
T033: "Create Loading component in src/components/Loading.tsx..."
T034: "Create Loading CSS module in src/styles/Loading.module.css..."
T035: "Add polygon loading indicators in src/components/Polygon.tsx..."
T036: "Update Polygon CSS module in src/styles/Polygon.module.css..."
T037: "Update loadCsvData utility in src/utils/data/loadCsvData.ts..."
T038: "Add error handling in src/components/Chart.tsx..."

# Parallel batch 2: Memoization
T039: "Performance optimization: Add React.memo to AxisSelector..."
T040: "Performance optimization: Add React.memo to UnitScaleControl..."
```

---

## Parallel Example: User Story 1

```bash
# First parallel batch - Component files (T010-T012):
Task T010: "Create AxisSelector component in src/components/AxisSelector.tsx with Material-UI Select dropdown, helper text, field label, and option filtering"
Task T011: "Add confirmation dialog to AxisSelector component in src/components/AxisSelector.tsx using Material-UI Dialog with title, message, and buttons"
Task T012: "Create AxisSelector CSS module in src/styles/AxisSelector.module.css with dropdown and dialog styling"

# After component complete, second parallel batch - Hook updates (T020-T023):
Task T020: "Update useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts to rebuild when axisConfig changes"
Task T021: "Update useSpatialIndex hook in src/hooks/useSpatialIndex.ts to rebuild when axisConfig changes"
Task T022: "Update usePolygonSelection hook in src/hooks/usePolygonSelection.ts to recalculate polygon statistics with new axis properties"
Task T023: "Update canvasRenderer utility in src/utils/canvas/canvasRenderer.ts to use dynamic axis properties from axisConfig"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003) - ~10 minutes
2. Complete Phase 2: Foundational (T004-T009) - ~30 minutes
3. Complete Phase 3: User Story 1 (T010-T023) - ~90 minutes
4. **STOP and VALIDATE**: Test axis selection, mutual exclusion, polygon confirmation, chart re-rendering
5. Deploy/demo if ready - **Core value delivered: Dynamic axis exploration**

**Total MVP Time**: ~2.5 hours

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~40 minutes)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! Users can explore data via axis selection) (~90 minutes)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced: Clear axis labels for interpretation) (~20 minutes)
4. Add User Story 3 → Test independently → Deploy/Demo (Enhanced: Flexible unit scaling) (~30 minutes)
5. Add Polish Phase → Final optimizations and validation (~45 minutes)

**Total Feature Time**: ~4 hours

### Parallel Team Strategy

With 2 developers:

1. Both complete Setup + Foundational together (~40 minutes)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T010-T023) - Core axis selection
   - **Developer B**: User Story 2 (T024-T026) + User Story 3 (T027-T032) in sequence
3. Join for Polish Phase together (T033-T041)

**Total Team Time**: ~2.5 hours (with parallelization)

---

## Task Summary

**Total Tasks**: 41 tasks
- Phase 1 (Setup): 3 tasks (~10 minutes)
- Phase 2 (Foundational): 6 tasks (~30 minutes)
- Phase 3 (User Story 1): 14 tasks (~90 minutes) 🎯 MVP
- Phase 4 (User Story 2): 3 tasks (~20 minutes)
- Phase 5 (User Story 3): 6 tasks (~30 minutes)
- Phase 6 (Polish): 9 tasks (~45 minutes)

**Parallel Opportunities**: 15 tasks marked [P] can run simultaneously with others

**MVP Scope**: Phases 1-3 only (23 tasks, ~2.5 hours) delivers core axis selection functionality

**Independent Test Criteria**:
- **US1**: Change axes, verify chart updates, polygons confirm, dropdowns exclude opposite selection
- **US2**: Change axes, verify labels update with correct property names and units
- **US3**: Adjust unit scale slider, verify axis scales update without changing data

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Material-UI components used: Select, MenuItem, FormControl, InputLabel, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography
- Animation reference: Plant circles loading from CodePen (3 circles with staggered grow animation)
- All TypeScript strict mode enforced - compile-time type safety for axis property access
