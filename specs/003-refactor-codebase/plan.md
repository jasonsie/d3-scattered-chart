# Implementation Plan: Codebase Refactoring for Maintainability

**Branch**: `003-refactor-codebase` | **Date**: 2025-12-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-refactor-codebase/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor existing codebase to improve maintainability through: (1) Split ChartContext into domain-specific contexts (data, selection, UI), (2) Extract all inline styles to CSS modules with camel case naming, (3) Consolidate types into `/src/types` with domain-based organization, (4) Extract magic numbers/strings into shared constants and component-specific enums, (5) Add JSDoc documentation to all public functions, (6) Remove unused imports/variables, (7) Enforce ESLint import/no-cycle rule. Incremental refactoring strategy with manual validation after each component.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js >=20.9.0  
**Primary Dependencies**: Next.js 16.0.0, React 19.2.0, D3.js 7.9.0, Material-UI 7.3.5, Emotion 11.14.0  
**Storage**: CSV files (local data loading via `loadCsvData.ts`)  
**Testing**: Vitest 3.2.4, React Testing Library 16.3.0 (manual validation for this refactoring feature)  
**Target Platform**: Web browser (Next.js single-page application)  
**Project Type**: Web (Next.js frontend with client-side rendering)  
**Performance Goals**: <500ms scatter plot render for 5000+ points, <100ms polygon selection feedback, <200ms statistics update, 30% fewer re-renders post-refactoring  
**Constraints**: TypeScript strict mode enabled, zero inline styles allowed, zero magic numbers in logic, all types in `/src/types`  
**Scale/Scope**: 4 components (Chart, Polygon, PopupEditor, Sidebar), 6 hooks, 2 utils directories (canvas/, data/), ~4800 data points from CD45_pos.csv

**Architecture Patterns**:
- React Context API with useReducer for state management (currently single ChartContext, refactoring to 3 split contexts)
- CSS Modules for styling (currently Chart.module.css, page.module.css, globals.css exist; need to add Polygon.module.css, PopupEditor.module.css, Sidebar.module.css)
- D3.js data binding for SVG rendering
- Canvas-based rendering for data points layer
- Layer-based organization: /components, /hooks, /utils, /contexts, /styles, /types

**Refactoring Unknowns**:
- NEEDS CLARIFICATION: Specific pattern for splitting ChartContext into ChartDataContext, ChartSelectionContext, ChartUIContext
- NEEDS CLARIFICATION: TypeScript validation approach for incremental refactoring (per-component tsc --noEmit vs full build)
- NEEDS CLARIFICATION: CSS Module migration strategy (inline style → CSS class mapping patterns)
- NEEDS CLARIFICATION: JSDoc documentation depth (all exports vs complex logic only - RESOLVED in clarifications: standard JSDoc for all functions, inline comments for complex logic)
- NEEDS CLARIFICATION: ESLint configuration for import/no-cycle rule enforcement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Interactive UX First** ✅ **PASS**
- Refactoring maintains all existing interaction patterns (click-to-select, drag-to-draw)
- No changes to visual feedback timing (<100ms hover states, <100ms selection feedback)
- Context splitting improves performance → better interactive responsiveness
- CSS Modules refactoring doesn't affect interaction logic

**II. Data-Driven Rendering** ✅ **PASS**
- Refactoring maintains D3.js control of SVG rendering
- No changes to D3 selection patterns or data binding
- Context splitting separates data concerns (ChartDataContext) from rendering
- CSS extraction doesn't alter D3/React separation

**III. Context-Based State Management** ✅ **PASS (RESOLVED)**
- **Issue**: Splitting single ChartContext into 3 contexts (ChartDataContext, ChartSelectionContext, ChartUIContext) required design validation
- **Resolution (Phase 0)**: Research completed with clear domain separation pattern (see research.md section 1)
- **Verification (Phase 1)**: Context APIs designed in contracts/context-apis.md with unidirectional data flow and reducer pattern maintained
- **Result**: Improves upon current implementation by reducing re-render scope, fully aligns with constitution's "optimizations" clause

**IV. Type Safety** ✅ **PASS (RESOLVED)**
- TypeScript strict mode already enabled (`"strict": true` in tsconfig.json)
- **Issue**: Type consolidation into `/src/types` required validation against circular dependencies
- **Resolution (Phase 0)**: Research established type-only import pattern using `import type { ... }` syntax (see research.md section 7)
- **Verification (Phase 1)**: Type organization contract (contracts/type-organization.md) defines domain-based files (components.d.ts, state.d.ts, hooks.d.ts) with circular dependency prevention guidelines
- **Result**: ESLint import/no-cycle rule + type-only imports prevent runtime cycles

**V. Incremental Feature Delivery** ✅ **PASS**
- Refactoring uses incremental strategy: one component at a time with validation (see quickstart.md Steps 6-9)
- Each refactoring step maintains working functionality (FR-002)
- Clear prioritization: P1 structural improvements (contexts, types, constants) before P2 CSS refactoring
- No "preparatory refactoring" - each step delivers measurable maintainability value
- Timeline: 20 hours over 4 days with validation checkpoints

**Overall Gate Status**: ✅ **FULL PASS** - Phase 0 research and Phase 1 design resolved all conditional gates. No blockers for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/003-refactor-codebase/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── component-interfaces.md
│   ├── context-apis.md
│   └── css-module-conventions.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Chart.tsx
│   ├── Polygon.tsx
│   ├── PopupEditor.tsx
│   └── Sidebar.tsx
├── contexts/
│   ├── ChartContext.tsx              # EXISTING - to be split
│   ├── ChartDataContext.tsx          # NEW - data loading & scales
│   ├── ChartSelectionContext.tsx     # NEW - polygon & point selection
│   └── ChartUIContext.tsx            # NEW - UI state (editor, sidebar)
├── hooks/
│   ├── useCanvasRenderer.ts
│   ├── useCoordinateTransform.ts
│   ├── useDirtyRectTracking.ts
│   ├── usePolygonSelection.ts
│   ├── useSpatialIndex.ts
│   └── useViewportCulling.ts
├── styles/
│   ├── Chart.module.css              # EXISTING
│   ├── Polygon.module.css            # NEW
│   ├── PopupEditor.module.css        # NEW
│   ├── Sidebar.module.css            # NEW
│   ├── globals.css                   # EXISTING
│   └── page.module.css               # EXISTING
├── types/
│   ├── canvas.d.ts                   # EXISTING
│   ├── css.d.ts                      # EXISTING
│   ├── global.d.ts                   # EXISTING
│   ├── components.d.ts               # NEW - component prop types
│   ├── state.d.ts                    # NEW - context state types
│   └── hooks.d.ts                    # NEW - hook return types
├── utils/
│   ├── canvas/
│   │   ├── canvasRenderer.ts
│   │   ├── coordinateTransform.ts
│   │   ├── devicePixelRatio.ts
│   │   ├── dirtyRectTracking.ts
│   │   ├── polygonGeometry.ts
│   │   └── spatialIndex.ts
│   ├── data/
│   │   └── loadCsvData.ts
│   └── constants/                    # NEW - extracted constants
│       ├── chart.ts                  # Chart-specific constants
│       ├── colors.ts                 # Shared color constants
│       └── polygon.ts                # Polygon-specific enums
└── ...
```

**Structure Decision**: Web application using Next.js App Router. Layer-based organization maintains existing `/components`, `/hooks`, `/utils`, `/contexts` structure. Adding `/utils/constants` for extracted magic numbers/strings. Expanding `/types` with domain-specific type files. Expanding `/styles` with component-specific CSS modules. This preserves existing architecture while improving separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations requiring justification. The refactoring enhances existing patterns (Context-Based State Management) through optimization (context splitting) which is explicitly permitted by Constitution III. Type consolidation and CSS extraction align with Type Safety (Constitution IV) and code quality standards.
