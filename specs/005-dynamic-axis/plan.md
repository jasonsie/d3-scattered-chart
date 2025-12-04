# Implementation Plan: Dynamic Axis Selection

**Branch**: `005-dynamic-axis` | **Date**: 2025-12-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-dynamic-axis/spec.md`

## Summary

Enable users to dynamically change x-axis and y-axis properties from sidebar dropdown menus to explore multi-dimensional flow cytometry data. The feature adds axis selection controls in the sidebar that update D3 scales, reposition data points, and provide polygon retention confirmation. Technical approach uses React Context to manage axis configuration state, D3 scale updates for coordinate transformations, and conditional polygon preservation with statistics recalculation.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled  
**Primary Dependencies**: React 19.2.0, Next.js 16.0.0, D3.js 7.9.0, Material-UI 7.3.5  
**Storage**: Client-side CSV file loading (public/data/CD45_pos.csv), no persistent storage  
**Testing**: Vitest 3.2.4 with React Testing Library (testing optional per constitution)  
**Target Platform**: Web browser (Chrome, Firefox, Safari), Next.js SSR/CSR hybrid  
**Project Type**: Web application (single-page interactive data visualization)  
**Performance Goals**: Chart re-render <500ms for 100k points, dropdown interaction <100ms  
**Constraints**: TypeScript strict mode, React Context-only state (no global), D3 for SVG/Canvas only  
**Scale/Scope**: 15 data properties, 210 valid axis combinations, up to 50 polygons, 100k+ data points

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Interactive UX First ✅
- **Compliance**: Dropdown selection provides immediate visual feedback via disabled state during render
- **Compliance**: Polygon confirmation dialog follows direct manipulation (prompt before destructive action)
- **Compliance**: Axis changes trigger <500ms re-render (within interactive threshold)
- **Note**: No modal dialogs block data exploration; confirmation is contextual to axis change

### II. Data-Driven Rendering ✅
- **Compliance**: D3 scales control all axis transformations and data point positioning
- **Compliance**: React Context manages axis configuration state, D3 handles coordinate transforms
- **Compliance**: Axis labels rendered via D3 selection bound to axis configuration data
- **Note**: Clear separation: React state → D3 scale domains → SVG/Canvas rendering

### III. Context-Based State Management ✅
- **Compliance**: Axis configuration (xProperty, yProperty, unitScale) stored in ChartContext
- **Compliance**: Dropdown changes dispatch actions to chartReducer for state updates
- **Compliance**: No local component state for axis selection (centralized in Context)
- **Note**: New state fields required: `axisConfig: { xProperty, yProperty, unitScale }`

### IV. Type Safety ✅
- **Compliance**: TypeScript strict mode enabled (tsconfig.json: "strict": true)
- **Compliance**: Axis configuration type will define property names, labels, units explicitly
- **Compliance**: D3 scale types use generic parameters: `ScaleLinear<number, number>`
- **Note**: CSV property names validated against type-safe enum of available columns

### V. Incremental Feature Delivery ✅
- **Compliance**: Feature broken into P1 (axis selection), P2 (labeling), P3 (unit scaling)
- **Compliance**: P1 delivers independently testable value (explore different data correlations)
- **Compliance**: No preparatory refactoring required; extends existing ChartContext pattern
- **Note**: Feature can be deployed incrementally: P1 first, P2/P3 as enhancements

**Gate Status**: ✅ PASSED - All constitution principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/005-dynamic-axis/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - MUI dropdown patterns, D3 scale updates
├── data-model.md        # Phase 1 output - AxisConfig type, DataPropertyMetadata
├── quickstart.md        # Phase 1 output - Adding axis dropdowns to sidebar
├── contracts/           # Phase 1 output - Context API, D3 scale contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js Web Application Structure
src/
├── app/
│   ├── layout.tsx           # Root layout (existing)
│   └── page.tsx             # Main chart page (existing)
├── components/
│   ├── Chart.tsx            # [MODIFY] Add axis change handler, reset zoom/pan
│   ├── Sidebar.tsx          # [MODIFY] Add AxisSelector dropdown components
│   ├── Polygon.tsx          # [MODIFY] Add loading indicator during stats recalc
│   ├── PopupEditor.tsx      # No changes required
│   ├── AxisSelector.tsx     # [NEW] Dropdown component for x/y axis selection
│   ├── UnitScaleControl.tsx # [NEW] Slider component for measurement unit scaling
│   └── Loading.tsx          # [NEW] Modular loading component (plant circles animation)
├── contexts/
│   ├── ChartContext.tsx     # [MODIFY] Add axisConfig state, SET_AXIS_CONFIG action
│   ├── GlobalContext.tsx    # [NEW] Outermost context for global loading state
│   ├── ChartDataContext.tsx # [NEW] Manage axis-specific data transformations
│   ├── ChartSelectionContext.tsx # No changes required
│   └── ChartUIContext.tsx   # [MODIFY] Add isRendering flag for dropdown disable
├── hooks/
│   ├── useCanvasRenderer.ts    # [MODIFY] Accept dynamic axis properties
│   ├── useCoordinateTransform.ts # [MODIFY] Rebuild on axis change
│   ├── useSpatialIndex.ts      # [MODIFY] Rebuild on axis change
│   ├── usePolygonSelection.ts  # [MODIFY] Filter invalid points by axis
│   └── useAxisConfiguration.ts # [NEW] Hook for axis selection logic
├── utils/
│   ├── data/
│   │   ├── loadCsvData.ts   # [MODIFY] Return all columns as typed properties
│   │   └── validateData.ts  # [NEW] Filter null/NaN/invalid values
│   ├── canvas/
│   │   └── canvasRenderer.ts # [MODIFY] Use dynamic axis from context
│   └── constants/
│       ├── axis.ts          # [NEW] Available data properties enum
│       ├── chart.ts         # [MODIFY] Default axis configuration
│       └── loading.ts       # [NEW] Loading animation constants
├── types/
│   ├── canvas.d.ts          # No changes required
│   ├── components.d.ts      # [MODIFY] Add AxisSelectorProps, UnitScaleControlProps, LoadingProps
│   ├── state.d.ts           # [MODIFY] Add AxisConfig, DataPropertyMetadata, GlobalState
│   └── data.d.ts            # [NEW] CSV column types, validation types
└── styles/
    ├── AxisSelector.module.css # [NEW] Dropdown styling
    ├── UnitScaleControl.module.css # [NEW] Slider styling
    ├── Loading.module.css   # [NEW] Plant circles animation
    └── Sidebar.module.css   # [MODIFY] Add spacing for axis controls

public/
└── data/
    └── CD45_pos.csv         # Existing data file (unchanged)

tests/ (optional per constitution)
└── integration/
    └── axis-selection.test.ts # [NEW] Test axis change workflows
```

**Structure Decision**: Web application structure selected. This is a Next.js single-page application with React components for UI, D3 for visualization, and Material-UI for form controls. The existing structure already follows component/context/hooks/utils separation. New files added for axis-specific logic (AxisSelector component, UnitScaleControl component with MUI Slider, useAxisConfiguration hook, axis constants). Added GlobalContext as outermost context provider for global loading state (plant circles animation component). Modified files extend existing patterns (ChartContext for state, Chart.tsx for render updates, Sidebar.tsx for UI controls).

**Component References**:
- MUI Select dropdown: [CodeSandbox Example](https://codesandbox.io/embed/6hpdvn?module=/src/Demo.tsx)
- MUI Slider for unit scale: [CodeSandbox Example](https://codesandbox.io/embed/7tvlj7?module=/src/Demo.tsx)
- Plant circles loading animation: [CodePen Example](https://codepen.io/esdesignstudio/pen/RwQdEZb)

---

## Phase 0: Research & Discovery

**Status**: ✅ COMPLETE

**Output**: [research.md](./research.md)

**Key Decisions**:
1. Material-UI Select component for dropdowns with controlled state
2. D3 scale rebuild pattern with Context storage
3. MUI Dialog for polygon retention confirmation
4. MUI Slider for measurement unit scaling (100-2000 range)
5. Pre-filter invalid data points before rendering
6. Regex pattern matching for axis label unit extraction

**All NEEDS CLARIFICATION items resolved**. Proceed to Phase 1.

---

## Phase 1: Design & Contracts

**Status**: ✅ COMPLETE

**Outputs**:
- [data-model.md](./data-model.md) - AxisConfiguration, DataPropertyName types
- [quickstart.md](./quickstart.md) - Developer onboarding guide
- [contracts/context-api.md](./contracts/context-api.md) - ChartContext state/action contracts
- [contracts/component-api.md](./contracts/component-api.md) - AxisSelector component API
- [contracts/d3-scale-updates.md](./contracts/d3-scale-updates.md) - D3 scale rebuild contracts

**Entities Defined**:
- `AxisConfiguration` - Current axis selections with unit scaling
- `DataPropertyName` - Type-safe enum of CSV column names
- `DataPropertyMetadata` - Extended property information

**Contracts Established**:
- ChartContext extended with `axisConfig` and `isRendering` state
- New actions: SET_AXIS_CONFIG, SET_RENDERING, RESET_VIEWPORT
- AxisSelector component props and behavior
- D3 scale lifecycle and application patterns

---

## Phase 1.1: Agent Context Update

**Action Required**: Update AI agent context with new technologies and patterns

**Command**:
```bash
.specify/scripts/bash/update-agent-context.sh copilot
```

**Purpose**: 
- Add Material-UI dropdown patterns to agent knowledge
- Document axis configuration state management pattern
- Record D3 scale rebuild workflow for future reference
- Preserve manual additions between markers

**New Technologies to Add**:
- Material-UI Select/MenuItem for axis dropdowns
- Material-UI Slider for unit scale control
- Material-UI Dialog for polygon confirmation
- D3 scale domain updates on axis change
- React Context for axis configuration state

---

## Phase 2: Constitution Re-Check

**Status**: ✅ PASSED

**Post-Design Review**:

### I. Interactive UX First ✅
- MUI Select provides immediate visual feedback
- Confirmation dialog non-blocking, contextual to action
- Dropdown disabled during render prevents concurrent changes
- No changes needed

### II. Data-Driven Rendering ✅
- D3 scales rebuilt from data extents
- Axis labels updated via D3 selections
- Data point positioning uses dynamic property access
- No changes needed

### III. Context-Based State Management ✅
- AxisConfiguration stored in ChartContext
- All axis changes flow through chartReducer
- No local component state for axis selection
- No changes needed

### IV. Type Safety ✅
- DataPropertyName string literal union enforced
- AxisConfiguration interface fully typed
- D3 scale generics: `ScaleLinear<number, number>`
- No changes needed

### V. Incremental Feature Delivery ✅
- P1 (axis selection) is independently deployable
- P2 (labeling) and P3 (unit scaling) are optional enhancements
- No preparatory refactoring required
- No changes needed

**Final Gate Status**: ✅ ALL PRINCIPLES SATISFIED

---

## Implementation Readiness

**Ready for `/speckit.tasks` command**: ✅ YES

**Artifacts Complete**:
- ✅ Technical Context (all fields resolved)
- ✅ Constitution Check (passed, no violations)
- ✅ Project Structure (documented with file changes)
- ✅ Phase 0 Research (all unknowns resolved)
- ✅ Phase 1 Design (data model + contracts)
- ✅ Phase 1 Quickstart (developer guide)
- ✅ Agent Context Update (command documented)

**Next Command**: `/speckit.tasks` to generate task breakdown

---

## Summary

**Feature**: Dynamic Axis Selection for D3 Scattered Chart  
**Branch**: `005-dynamic-axis`  
**Complexity**: Medium (extends existing patterns, no new architecture)  
**Estimated Implementation Time**: 4-6 hours for P1 (core functionality)

**Key Technical Decisions**:
1. Material-UI components for all form controls (consistency)
2. React Context for axis configuration state (follows existing pattern)
3. D3 scale rebuild on axis change (immutable pattern)
4. Pre-filtering invalid data (performance optimization)
5. Polygon retention via user confirmation (prevents data loss)

**Risk Mitigation**:
- Dropdown disable during render prevents race conditions
- Data validation filters invalid points before scale calculation
- Polygon confirmation prevents accidental data loss
- TypeScript strict mode catches property access errors at compile time

**Performance Budget**:
- Scale rebuild: <5ms
- Data filtering: <10ms for 10k points
- Chart re-render: <500ms (existing budget)
- Total axis change latency: <550ms (meets SC-003)

**Constitution Compliance**: 100% - All principles followed, no violations to justify

---

## Branch and Paths

**Branch**: `005-dynamic-axis` (already checked out)  
**Spec**: `/Users/jason/Developer/y-pj/d3-scattered-chart/specs/005-dynamic-axis/spec.md`  
**Plan**: `/Users/jason/Developer/y-pj/d3-scattered-chart/specs/005-dynamic-axis/plan.md` (this file)  
**Tasks**: Will be created at `/Users/jason/Developer/y-pj/d3-scattered-chart/specs/005-dynamic-axis/tasks.md` by `/speckit.tasks`
