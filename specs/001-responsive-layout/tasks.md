# Tasks: Responsive Layout with Mobile Drawer

**Input**: Design documents from `/specs/001-responsive-layout/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL per constitution - not included in this task list as they were not requested in the specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `src/` at repository root (Next.js App Router)
- All paths relative to project root: `/Users/jason/Developer/y-pj/d3-scattered-chart`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and responsive layout infrastructure

- [ ] T001 Create layout constants file at src/constants/layout.ts with MOBILE_BREAKPOINT (768), DRAWER_HEIGHT_VH (65), FAB_POSITION, RESIZE_DEBOUNCE_MS (150)
- [ ] T002 [P] Install MUI Drawer and Fab components if not already in dependencies (verify @mui/material v6 in package.json)
- [ ] T003 [P] Create MobileDrawer.module.css at src/styles/MobileDrawer.module.css for drawer-specific styles

**Checkpoint**: Infrastructure ready for context and viewport modifications

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state management and viewport detection that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Context State Extensions

- [ ] T004 Add responsive state fields to ChartState type in src/contexts/ChartContext.tsx: isDrawerOpen (boolean), viewportMode ('mobile' | 'desktop'), viewportWidth (number), viewportHeight (number)
- [ ] T005 Update initialState in src/contexts/ChartContext.tsx with responsive defaults: isDrawerOpen: false, viewportMode: 'desktop', viewportWidth: 0, viewportHeight: 0
- [ ] T006 Add responsive action types to ChartAction in src/contexts/ChartContext.tsx: TOGGLE_DRAWER, SET_DRAWER_OPEN, SET_VIEWPORT_MODE, SET_VIEWPORT_DIMENSIONS

### Reducer Implementation

- [ ] T007 Implement TOGGLE_DRAWER reducer case in src/contexts/ChartContext.tsx (toggle isDrawerOpen boolean)
- [ ] T008 Implement SET_DRAWER_OPEN reducer case in src/contexts/ChartContext.tsx (set isDrawerOpen from payload)
- [ ] T009 Implement SET_VIEWPORT_MODE reducer case in src/contexts/ChartContext.tsx with auto-close drawer logic when transitioning mobile→desktop
- [ ] T010 Implement SET_VIEWPORT_DIMENSIONS reducer case in src/contexts/ChartContext.tsx (update width and height only)

### Viewport Detection Hook

- [ ] T011 Create useViewport custom hook at src/hooks/useViewport.ts with viewport detection, resize listener, and 150ms debouncing
- [ ] T012 Add viewport state initialization in src/app/page.tsx using useViewport hook and dispatch SET_VIEWPORT_MODE on mount and resize

**Checkpoint**: Foundation ready - context has responsive state, viewport hook working, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Desktop Chart Viewing (Priority: P1) 🎯 MVP

**Goal**: Maintain existing desktop layout with persistent sidebar when viewport ≥768px

**Independent Test**: Open application on desktop browser (≥768px width). Verify chart and sidebar both visible side-by-side. Resize window to various widths ≥768px. Both components remain visible and properly sized. Chart interactions work without layout shifts.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Update Sidebar component in src/components/Sidebar.tsx to accept isInDrawer prop for conditional styling based on viewportMode
- [ ] T014 [P] [US1] Add responsive layout styles to src/styles/page.module.css: .container (flex), .chartArea (flex: 1), .sidebarArea (width: 300px, desktop only)
- [ ] T015 [US1] Update page layout in src/app/page.tsx to conditionally render sidebar in .sidebarArea when viewportMode === 'desktop'
- [ ] T016 [US1] Update Sidebar.module.css in src/styles/Sidebar.module.css with .sidebar class for desktop styling (width: 300px, height: 100vh, padding, overflow-y: auto)
- [ ] T017 [US1] Verify TypeScript types for Sidebar props in src/components/Sidebar.tsx (add SidebarResponsiveExtensions interface: isInDrawer?: boolean)

**Checkpoint**: Desktop layout functional - sidebar persists, chart renders correctly at ≥768px widths, no mobile components visible

---

## Phase 4: User Story 2 - Mobile Chart Viewing (Priority: P1)

**Goal**: Hide sidebar on mobile (<768px) to maximize chart viewing area, providing 90%+ viewport width for chart

**Independent Test**: Open application on mobile device or resize browser to <768px width. Verify only chart visible, no sidebar. Chart fills available screen width. Resizing from desktop to mobile hides sidebar automatically.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Add media query to src/styles/page.module.css to hide .sidebarArea at widths <768px (@media (max-width: 767px))
- [ ] T019 [P] [US2] Update Chart.module.css in src/styles/Chart.module.css to ensure chart container uses full width on mobile (width: 100%)
- [ ] T020 [US2] Add conditional rendering logic in src/app/page.tsx to only render .sidebarArea div when viewportMode === 'desktop'
- [ ] T021 [US2] Verify chart canvas scales correctly on mobile by testing viewport changes in src/components/Chart.tsx (visual verification task)

**Checkpoint**: Mobile layout functional - sidebar hidden <768px, chart fills full width, no drawer/FAB visible yet

---

## Phase 5: User Story 3 - Mobile Drawer Access (Priority: P1)

**Goal**: Provide mobile drawer (bottom sheet) with FAB toggle for accessing sidebar features on mobile devices

**Independent Test**: On mobile (<768px), verify FAB visible at bottom-right. Tap FAB - drawer slides up from bottom covering 60-70% viewport height, displaying sidebar content. Tap outside drawer or close button - drawer closes. Sidebar functionality (polygon list, selection, editing) works within drawer. Resizing from mobile to desktop with drawer open - drawer auto-closes, sidebar appears.

### Implementation for User Story 3

- [ ] T022 [P] [US3] Create MobileDrawer component at src/components/MobileDrawer.tsx using MUI Drawer with anchor="bottom", height 65vh, borderRadius 16px on top corners
- [ ] T023 [P] [US3] Create DrawerToggleFab component at src/components/DrawerToggleFab.tsx using MUI Fab with MenuIcon/CloseIcon toggle, positioned bottom-right (16px from edges)
- [ ] T024 [P] [US3] Implement MUI Drawer configuration in MobileDrawer.tsx: open state from context, onClose dispatches SET_DRAWER_OPEN(false), PaperProps for height and border radius, ModalProps keepMounted: false
- [ ] T025 [P] [US3] Implement FAB click handler in DrawerToggleFab.tsx to dispatch TOGGLE_DRAWER action
- [ ] T026 [US3] Add conditional rendering in src/app/page.tsx to render MobileDrawer and DrawerToggleFab only when viewportMode === 'mobile'
- [ ] T027 [US3] Update Sidebar.module.css in src/styles/Sidebar.module.css with .sidebarInDrawer class for drawer context styling (width: 100%, padding: 8px 16px, transparent background)
- [ ] T028 [US3] Wire Sidebar component inside MobileDrawer in src/app/page.tsx, passing isInDrawer={true} prop
- [ ] T029 [US3] Verify drawer closes automatically on viewport mode change from mobile to desktop via SET_VIEWPORT_MODE reducer logic (already implemented in T009)
- [ ] T030 [US3] Add MUI Drawer styles to MobileDrawer.module.css: .drawerContent class with padding, overflow-y: auto, height: 100%

**Checkpoint**: Mobile drawer functional - FAB appears on mobile, drawer slides up from bottom, sidebar content accessible in drawer, auto-closes on desktop transition

---

## Phase 6: User Story 4 - Dynamic Chart Responsiveness (Priority: P2)

**Goal**: Chart automatically adapts dimensions and redraws when viewport size changes, maintaining zero pixel drift for polygons

**Independent Test**: Resize browser window across different widths (320px-2560px) or rotate mobile device. Verify chart canvas redraws within 500ms, polygons maintain correct positions (no drift), axis labels remain legible. Device orientation changes handled smoothly.

### Implementation for User Story 4

- [ ] T031 [P] [US4] Add resize listener in src/components/Chart.tsx to recalculate canvas dimensions when viewportWidth changes (useEffect with viewportWidth dependency)
- [ ] T032 [P] [US4] Create canvas resize utility function at src/utils/canvas/resizeCanvas.ts to handle canvas element resizing with devicePixelRatio scaling
- [ ] T033 [US4] Implement D3 scale recalculation in src/components/Chart.tsx when viewport changes: update xScale and yScale based on new container dimensions
- [ ] T034 [US4] Dispatch SET_COORDINATE_TRANSFORM action in src/components/Chart.tsx after scale recalculation to update coordinate transforms in context
- [ ] T035 [US4] Update useCoordinateTransform hook in src/hooks/useCoordinateTransform.ts to recalculate coordinate transforms when viewport changes (if hook exists, otherwise implement in Chart.tsx directly)
- [ ] T036 [US4] Trigger full canvas redraw in src/components/Chart.tsx after coordinate transforms updated (call renderAllLayers or equivalent)
- [ ] T037 [US4] Update useCanvasRenderer hook in src/hooks/useCanvasRenderer.ts to handle dynamic canvas sizing based on container dimensions (if hook exists, otherwise implement in Chart.tsx directly)
- [ ] T038 [US4] Verify zero pixel drift for polygons by testing that data space coordinates remain unchanged and coordinate transforms are pure functions (visual verification + console logging)
- [ ] T039 [US4] Add Chart.module.css responsive styles in src/styles/Chart.module.css to ensure chart container adapts to available space (.chartContainer { width: 100%; height: 100%; })

**Checkpoint**: Chart responsiveness complete - canvas resizes smoothly, polygons maintain positions, axis labels readable, 500ms redraw target met

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T040 [P] Update CLAUDE.md documentation to reflect responsive layout architecture (viewport hook, drawer state management, canvas resize strategy)
- [ ] T041 [P] Remove any console.log debugging statements added during implementation from all modified files
- [ ] T042 Performance validation: Test chart resize completes within 500ms across all user stories (SC-003)
- [ ] T043 Performance validation: Verify drawer animations run at 60 FPS using Chrome DevTools Performance tab (SC-004)
- [ ] T044 Visual validation: Verify zero pixel drift for polygons during resize by drawing test polygons and resizing (SC-005)
- [ ] T045 Cross-browser testing: Verify responsive behavior in Chrome, Firefox, Safari on both desktop and mobile viewports
- [ ] T046 Accessibility check: Verify FAB has proper aria-label and drawer has focus trap (MUI handles automatically, but verify)
- [ ] T047 [P] Code cleanup: Remove unused imports and ensure TypeScript strict mode passes with no errors
- [ ] T048 Edge case validation: Test rapid window resizing to verify 150ms debouncing prevents excessive re-renders
- [ ] T049 Edge case validation: Test device orientation changes (portrait ↔ landscape) on mobile device or simulator
- [ ] T050 Edge case validation: Test extremely small viewport (320px width) and very large viewport (2560px width) per SC-008
- [ ] T051 Run through quickstart.md manual test checklist to validate all user stories independently

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase (T004-T012) - Desktop layout
- **User Story 2 (Phase 4)**: Depends on Foundational phase (T004-T012) - Mobile layout (can run in parallel with US1)
- **User Story 3 (Phase 5)**: Depends on Foundational phase (T004-T012) AND User Story 2 (T018-T021) - Drawer requires mobile layout
- **User Story 4 (Phase 6)**: Depends on Foundational phase (T004-T012) AND User Stories 1-3 (T013-T030) - Resize affects all layouts
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Can run in parallel with US1, independently testable
- **User Story 3 (P1)**: Requires User Story 2 (mobile layout must exist before drawer can work) - Drawer builds on top of mobile layout
- **User Story 4 (P2)**: Requires User Stories 1-3 (resize must work for both desktop and mobile layouts with drawer)

### Within Each User Story

**User Story 1** (Desktop):
- T013, T014 can run in parallel (different files)
- T015 depends on T013, T014 (needs styled components)
- T016, T017 can run after T013 (sidebar styling)

**User Story 2** (Mobile):
- T018, T019 can run in parallel (different files)
- T020 integrates mobile layout logic
- T021 is visual verification (no code dependencies)

**User Story 3** (Drawer):
- T022, T023, T024, T025 can run in parallel (different components)
- T026, T027, T028 depend on T022-T025 (integration tasks)
- T029 is verification of existing T009 logic
- T030 adds final styles

**User Story 4** (Resize):
- T031, T032 can run in parallel (Chart component + utility)
- T033-T037 are sequential (scale → transform → redraw pipeline)
- T038, T039 are verification/styling

### Parallel Opportunities

**Phase 1 Setup**: T002 and T003 can run in parallel

**Phase 2 Foundational**:
- Context tasks (T004-T010) must be sequential within ChartContext.tsx
- T011 (useViewport hook) can run in parallel with T004-T010 (different file)
- T012 depends on T011 completion

**Phase 3 User Story 1**:
- T013 and T014 can run in parallel (Sidebar component vs page styles)

**Phase 4 User Story 2**:
- T018 and T019 can run in parallel (page styles vs Chart styles)

**Phase 5 User Story 3**:
- T022, T023, T024, T025 can run in parallel (4 different component files)

**Phase 6 User Story 4**:
- T031 and T032 can run in parallel (Chart component vs utility function)

**Phase 7 Polish**:
- T040, T041, T047 can run in parallel (documentation, cleanup, code quality)
- T042-T051 are validation tasks (can run after code complete)

---

## Parallel Example: User Story 3 (Drawer)

```bash
# Launch all component creation tasks together:
Task: "Create MobileDrawer component at src/components/MobileDrawer.tsx using MUI Drawer with anchor='bottom', height 65vh, borderRadius 16px on top corners" [T022]
Task: "Create DrawerToggleFab component at src/components/DrawerToggleFab.tsx using MUI Fab with MenuIcon/CloseIcon toggle, positioned bottom-right (16px from edges)" [T023]
Task: "Implement MUI Drawer configuration in MobileDrawer.tsx: open state from context, onClose dispatches SET_DRAWER_OPEN(false), PaperProps for height and border radius, ModalProps keepMounted: false" [T024]
Task: "Implement FAB click handler in DrawerToggleFab.tsx to dispatch TOGGLE_DRAWER action" [T025]

# Then integrate (sequential):
Task: "Add conditional rendering in src/app/page.tsx to render MobileDrawer and DrawerToggleFab only when viewportMode === 'mobile'" [T026]
Task: "Update Sidebar.module.css in src/styles/Sidebar.module.css with .sidebarInDrawer class for drawer context styling" [T027]
Task: "Wire Sidebar component inside MobileDrawer in src/app/page.tsx, passing isInDrawer={true} prop" [T028]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Desktop Layout

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T012) - **CRITICAL: blocks all stories**
3. Complete Phase 3: User Story 1 (T013-T017)
4. **STOP and VALIDATE**: Test desktop layout independently
   - Open at ≥768px width
   - Verify sidebar and chart both visible
   - Verify resize works, no layout shifts
5. Deploy/demo desktop responsive layout

**Estimated time**: ~2 hours (Setup: 30min, Foundational: 60min, US1: 30min)

### MVP+ (User Stories 1 + 2) - Desktop + Mobile Layout

1. Complete MVP First (Phases 1-3)
2. Complete Phase 4: User Story 2 (T018-T021)
3. **STOP and VALIDATE**: Test mobile layout independently
   - Resize to <768px width
   - Verify sidebar hidden, chart full width
   - Verify desktop→mobile transition works
4. Deploy/demo responsive layout (no drawer yet)

**Estimated time**: +30 minutes (total ~2.5 hours)

### Full P1 Scope (User Stories 1 + 2 + 3) - Complete Mobile Experience

1. Complete MVP+ (Phases 1-4)
2. Complete Phase 5: User Story 3 (T022-T030)
3. **STOP and VALIDATE**: Test drawer independently
   - FAB visible on mobile
   - Drawer opens/closes correctly
   - Sidebar functional in drawer
   - Auto-close on desktop transition
4. Deploy/demo complete P1 scope

**Estimated time**: +1 hour (total ~3.5 hours)

### Complete Feature (All User Stories) - Including Dynamic Resize

1. Complete Full P1 Scope (Phases 1-5)
2. Complete Phase 6: User Story 4 (T031-T039)
3. **STOP and VALIDATE**: Test chart resize independently
   - Resize across various widths
   - Verify 500ms performance target
   - Verify zero pixel drift for polygons
4. Complete Phase 7: Polish (T040-T051)
5. Final validation across all user stories
6. Deploy/demo complete feature

**Estimated time**: +1.5 hours (total ~5 hours)

### Parallel Team Strategy

With 2 developers:

1. **Both**: Complete Setup + Foundational together (Phases 1-2)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Desktop) [T013-T017]
   - **Developer B**: User Story 2 (Mobile) [T018-T021]
3. **Both**: Integrate and test US1+US2
4. **Developer A**: User Story 3 (Drawer) [T022-T030]
5. **Developer B**: User Story 4 (Resize) [T031-T039] (can start in parallel)
6. **Both**: Polish together [T040-T051]

**Estimated time with 2 devs**: ~3 hours total

With 3+ developers:

1. **All**: Complete Setup + Foundational together
2. **Dev A**: US1, **Dev B**: US2, **Dev C**: US3 (after US2 done)
3. **Dev D** (if available): US4 (can start after foundation)
4. **All**: Polish together

---

## Task Count Summary

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 9 tasks
- **Phase 3 (US1 - Desktop)**: 5 tasks
- **Phase 4 (US2 - Mobile)**: 4 tasks
- **Phase 5 (US3 - Drawer)**: 9 tasks
- **Phase 6 (US4 - Resize)**: 9 tasks
- **Phase 7 (Polish)**: 12 tasks

**Total**: 51 tasks

**MVP (US1 only)**: 17 tasks
**MVP+ (US1+US2)**: 21 tasks
**Full P1 (US1+US2+US3)**: 30 tasks
**Complete Feature (All)**: 51 tasks

---

## Notes

- **[P] tasks**: Different files, can run in parallel (13 parallelizable tasks total)
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story independently testable**: Can stop at any checkpoint to validate
- **No test tasks included**: Tests optional per constitution, not requested in spec
- **File paths are exact**: All paths start from repository root
- **TypeScript strict mode**: All tasks must maintain type safety
- **Performance targets**: SC-003 (500ms resize), SC-004 (60 FPS), SC-005 (zero drift)
- **Viewport range**: 320px-2560px per SC-008
- **Commit frequency**: Commit after each task or logical group for rollback safety
