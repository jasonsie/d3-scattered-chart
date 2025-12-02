# Tasks: Upgrade Dependencies and Framework

**Feature**: 001-upgrade-dependencies  
**Input**: Design documents from `/specs/001-upgrade-dependencies/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: NOT included - testing is OPTIONAL per Constitution and not requested in feature spec

**Organization**: Tasks organized by user story to enable independent implementation and testing

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- File paths included in descriptions

---

## Phase 1: Setup (Pre-Upgrade Preparation)

**Purpose**: Baseline measurement and branch setup before dependency upgrades

- [X] T001 Create feature branch `001-upgrade-dependencies` from main branch
- [X] T002 [P] Record performance baseline: measure page load time with 4800 data points using browser DevTools Performance tab
- [X] T003 [P] Run security audit baseline using `yarn audit` and document vulnerability count
- [X] T004 [P] Record build time baseline using `yarn build` and note duration
- [X] T005 Verify current build works successfully with `yarn build` (exit code 0)

---

## Phase 2: User Story 1 - Developer Updates Project to Modern Stack (Priority: P1) 🎯 MVP

**Goal**: Update Node.js runtime, Next.js framework, and all npm dependencies to latest stable versions in coordinated upgrade

**Independent Test**: Verify package.json has target versions, run `yarn install` successfully, start dev server without errors, build for production successfully, and confirm all existing features work

### Implementation for User Story 1

- [X] T006 [P] Verify package.json engines.node is set to ">=20.9.0"
- [X] T007 [P] Verify package.json dependencies.next is "^16.0.0"
- [X] T008 [P] Verify package.json dependencies.react is "^19.2.0"
- [X] T009 [P] Verify package.json dependencies.react-dom is "^19.2.0"
- [X] T010 [P] Verify package.json dependencies.@mui/material is "^7.3.5"
- [X] T011 [P] Verify package.json dependencies.@mui/icons-material is "^7.3.5"
- [X] T012 [P] Verify package.json dependencies.@emotion/react is "^11.14.0"
- [X] T013 [P] Verify package.json dependencies.@emotion/styled is "^11.14.0"
- [X] T014 [P] Verify package.json dependencies.d3 is "^7.9.0"
- [X] T015 [P] Verify package.json devDependencies.typescript is "^5.9.3"
- [X] T016 [P] Verify package.json devDependencies.@types/react is "^19"
- [X] T017 [P] Verify package.json devDependencies.@types/react-dom is "^19"
- [X] T018 [P] Verify package.json devDependencies.@types/d3 is "^7.4.3"
- [X] T019 [P] Verify package.json devDependencies.@types/node is "^22"
- [X] T020 [P] Verify package.json devDependencies.eslint is "^9"
- [X] T021 [P] Verify package.json devDependencies.eslint-config-next is "^16.0.0"
- [X] T022 Remove node_modules directory and yarn.lock file for clean install
- [X] T023 Run `yarn install` to regenerate yarn.lock with upgraded dependency tree
- [X] T024 Verify `yarn install` completed without errors or peer dependency warnings
- [X] T025 Verify installed versions match package.json using `yarn list --pattern "react|next|@mui|typescript" --depth=0`
- [X] T026 [US1] Optionally add "noUncheckedSideEffectImports": true to tsconfig.json compilerOptions for React 19 compatibility
- [X] T027 [US1] Run TypeScript type check with `tsc --noEmit` and verify zero errors
- [X] T028 [US1] Run ESLint with `yarn lint` and verify zero errors
- [X] T029 [US1] Start development server with `yarn dev` and verify no warnings in terminal output
- [X] T030 [US1] Build for production with `yarn build` and verify successful completion
- [X] T031 [US1] Verify production build time is within 15% of baseline measurement
- [X] T032 [US1] Start production server with `yarn start` and verify it runs without errors
- [X] T033 [US1] Run security audit with `yarn audit` and verify zero high/critical vulnerabilities

**Checkpoint**: User Story 1 complete - All dependencies upgraded, builds successful, no errors

---

## Phase 3: User Story 2 - Application Maintains Functionality After Upgrade (Priority: P1) 🎯 MVP

**Goal**: Ensure all existing features continue working after dependency upgrades with no disruption to user workflows

**Independent Test**: Load application in staging with full 4800-point dataset, perform all key workflows (load data, view chart, draw polygons, select points), verify identical behavior to pre-upgrade version

### Implementation for User Story 2

- [X] T034 [US2] Open application at http://localhost:3000 in browser
- [X] T035 [US2] Verify page loads without console errors in browser DevTools
- [X] T036 [US2] Verify no React warnings in browser console
- [X] T037 [US2] Verify MUI theme is applied correctly (check Sidebar styling in src/components/Sidebar.tsx)
- [X] T038 [US2] Verify CSV data loads successfully from public/data/CD45_pos.csv
- [X] T039 [US2] Verify all 4800 data points render in scatter plot (Chart component in src/components/Chart.tsx)
- [X] T040 [US2] Verify chart axes display correctly with D3 scales
- [X] T041 [US2] Verify zoom interaction works on scatter plot
- [X] T042 [US2] Verify pan interaction works on scatter plot
- [X] T043 [US2] Verify click-to-start polygon drawing works (ChartContext state in src/contexts/ChartContext.tsx)
- [X] T044 [US2] Verify click-to-add polygon points works (Polygon component in src/components/Polygon.tsx)
- [X] T045 [US2] Verify polygon outline visual feedback displays correctly
- [X] T046 [US2] Verify complete polygon by clicking near start point works
- [X] T047 [US2] Verify sidebar shows selected point count and percentage correctly
- [X] T048 [US2] Verify edit polygon button opens PopupEditor (src/components/PopupEditor.tsx)
- [X] T049 [US2] Verify polygon modifications persist in PopupEditor
- [X] T050 [US2] Verify delete polygon removes it from chart
- [X] T051 [US2] Measure initial page load time with browser DevTools Performance tab and verify ≤5 seconds
- [X] T052 [US2] Measure scatter plot render time and verify ≤500ms target
- [X] T053 [US2] Measure polygon selection feedback time and verify ≤100ms target
- [X] T054 [US2] Verify performance metrics are within 15% of baseline measurements
- [X] T055 [US2] Test application in Chrome browser (latest version)
- [X] T056 [US2] Test application in Firefox browser (latest version)
- [X] T057 [US2] Test application in Safari browser (latest version)
- [X] T058 [US2] Verify no regressions compared to pre-upgrade behavior

**Checkpoint**: User Story 2 complete - All functionality verified working, performance within targets

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [X] T059 [P] Run contract validation for package.json using contracts/package-json-schema.md checklist
- [X] T060 [P] Run contract validation for tsconfig.json using contracts/tsconfig-schema.md checklist
- [X] T061 Review git changes with `git status` and `git diff package.json`
- [X] T062 Commit upgrade changes with descriptive message documenting all version updates
- [X] T063 Update project documentation (README.md, CLAUDE.md) if Node.js version requirement changed
- [X] T064 Mark spec.md as implemented and close feature issue #001

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - upgrades all dependencies
- **User Story 2 (Phase 3)**: Depends on User Story 1 completion - tests upgraded application
- **Polish (Phase 4)**: Depends on User Story 2 completion - final validation

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) - No dependencies on other stories
- **User Story 2 (P1)**: DEPENDS on User Story 1 - Cannot test functionality until dependencies are upgraded

### Within Each User Story

**User Story 1 (Upgrade Execution)**:
- Verification tasks (T006-T021) can all run in parallel [P]
- Clean install (T022-T025) must be sequential
- Configuration and validation (T026-T033) must run after install completes

**User Story 2 (Functionality Verification)**:
- All testing tasks can run in sequence as manual acceptance tests
- Browser testing (T055-T057) can run in parallel if multiple browsers available

### Parallel Opportunities

Within Phase 1 (Setup):
- T002, T003, T004 can run in parallel [P]

Within User Story 1:
- T006-T021 can run in parallel [P] (all are package.json verification)

Within Phase 4 (Polish):
- T059, T060 can run in parallel [P] (contract validations)

**Note**: Most User Story 2 tasks are manual testing and must be done sequentially

---

## Parallel Example: User Story 1 Package Verification

```bash
# Launch all package.json verification tasks together:
Task: "Verify package.json engines.node is set to '>=20.9.0'"
Task: "Verify package.json dependencies.next is '^16.0.0'"
Task: "Verify package.json dependencies.react is '^19.2.0'"
Task: "Verify package.json dependencies.react-dom is '^19.2.0'"
Task: "Verify package.json dependencies.@mui/material is '^7.3.5'"
# ... (all T006-T021 verification tasks)
```

---

## Implementation Strategy

### MVP First (Both P1 User Stories Required)

This feature requires BOTH P1 user stories to deliver value:

1. **Phase 1: Setup** (5 tasks, ~15 minutes)
   - Create branch and record baselines
   
2. **Phase 2: User Story 1** (28 tasks, ~30 minutes)
   - Upgrade all dependencies
   - Verify builds succeed
   
3. **Phase 3: User Story 2** (25 tasks, ~45 minutes)
   - Test all functionality works
   - Verify performance targets met
   
4. **Phase 4: Polish** (6 tasks, ~15 minutes)
   - Contract validation
   - Git commit and documentation

**Total MVP**: 64 tasks, ~2-3 hours (matches quickstart.md estimate)

### Incremental Delivery

Unlike features with independent user stories, this upgrade is **atomic**:
- Cannot deploy User Story 1 without User Story 2 (untested upgrade is risky)
- Both stories must complete together for safe deployment
- MVP = Setup + US1 + US2 + Polish (all phases)

### Why Both Stories Form Single Deliverable

- **US1** (upgrade) without **US2** (verification) = unvalidated changes (risky)
- **US2** (testing) without **US1** (upgrade) = nothing to test (no value)
- Safe deployment requires BOTH: upgrade executed AND functionality verified

### Rollback Strategy

If critical issues found during US2 (testing):
- Use rollback procedure from quickstart.md
- Git revert commits from US1
- Restore pre-upgrade dependencies with `yarn install`
- Investigate offline and retry

---

## Suggested MVP Scope

**MVP = Complete Feature (All Phases)**

This dependency upgrade is an **infrastructure feature** where the MVP must include:
- ✅ Phase 1: Setup (baseline measurement)
- ✅ Phase 2: User Story 1 (dependency upgrade)
- ✅ Phase 3: User Story 2 (functionality verification)
- ✅ Phase 4: Polish (validation and commit)

**Rationale**: 
- Cannot ship half-upgraded dependencies (breaks application)
- Cannot skip testing after upgrade (unsafe)
- Atomic operation: all or nothing

**Time Investment**: 2-3 hours for complete, validated upgrade

---

## Notes

- **[P]** tasks = different files or independent checks, can run in parallel
- **[US1]** tasks = User Story 1 (dependency upgrade execution)
- **[US2]** tasks = User Story 2 (functionality and performance verification)
- Research.md indicates all dependencies already at target versions - tasks focus on verification
- No test files to create (tests are OPTIONAL and not requested in spec)
- Verify each task completion before proceeding to next sequential task
- Use quickstart.md as detailed execution guide
- Commit after User Story 2 completion (all changes together in atomic commit)

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (User Story 1)**: 28 tasks
- **Phase 3 (User Story 2)**: 25 tasks
- **Phase 4 (Polish)**: 6 tasks
- **Total Tasks**: 64 tasks

**Parallel Opportunities**: 21 tasks marked [P] can run in parallel (within their phases)

**Independent Test Criteria**:
- **User Story 1**: `yarn install` succeeds, `yarn build` succeeds, `tsc --noEmit` passes, `yarn audit` shows zero high/critical issues
- **User Story 2**: All 4800 points render, all interactions work, performance ≤5s load time, no console errors

**Format Validation**: ✅ All tasks follow checklist format (checkbox, ID, optional [P] marker, [Story] label for US tasks, description with context)
