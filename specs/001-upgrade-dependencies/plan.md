# Implementation Plan: Upgrade Dependencies and Framework

**Branch**: `001-upgrade-dependencies` | **Date**: 2025-12-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-upgrade-dependencies/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Upgrade Node.js runtime to 20.9.0 LTS, Next.js framework to 16.0.0, React to 19.2.0, MUI to 7.3.5, and TypeScript to 5.9.3 in a coordinated upgrade. Use semi-automated approach with `yarn upgrade-interactive` to resolve peer dependency conflicts while maintaining all existing functionality. Ensure security vulnerabilities are eliminated and performance thresholds (<5s initial load for 4800 points) are maintained.

## Technical Context

**Language/Version**: TypeScript 5.9.3, JavaScript (ES2017+)  
**Primary Dependencies**: Next.js 16.0.0, React 19.2.0, D3.js 7.9.0, MUI 7.3.5  
**Storage**: N/A (client-side CSV file loading)  
**Testing**: OPTIONAL (not requested in feature spec)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari latest versions), Node.js 20.9.0+ runtime  
**Project Type**: Web application (Next.js App Router with React Server Components)  
**Performance Goals**: Initial page load ≤5 seconds for 4800 data points, scatter plot render ≤500ms, polygon selection feedback ≤100ms  
**Constraints**: Must maintain existing D3-based rendering pipeline, preserve Context-based state management, zero breaking changes to user workflows  
**Scale/Scope**: Single-page application, ~4800 data points, 5 React components, 1 context provider, CSV data source

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Interactive UX First**: PASS - Dependency upgrade does not introduce modal dialogs or delayed feedback. All existing direct manipulation patterns (click-to-select, drag-to-draw) remain unchanged.

✅ **Data-Driven Rendering**: PASS - React 19 and D3.js 7.9.0 maintain separation of concerns. D3 continues to control SVG DOM within React refs. No changes to rendering architecture required.

✅ **Context-Based State Management**: PASS - React 19's Context API remains backward compatible. ChartContext/ChartDispatchContext pattern preserved. No global state additions.

✅ **Type Safety**: PASS - TypeScript 5.9.3 strict mode enabled. Dependency upgrades improve type definitions (@types/react@19, @types/d3@7.4.3). No new implicit any types.

✅ **Incremental Feature Delivery**: PASS - Upgrade is a single P1 user story with clear rollback strategy. Delivers independently testable value (security patches, performance improvements) before other features.

**GATE STATUS**: ✅ ALL GATES PASSED - No constitution violations. Proceed to Phase 0.

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
# Web application (Next.js App Router)
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with MUI ThemeProvider
│   └── page.tsx         # Main scatter plot page
├── components/          # React components
│   ├── Chart.tsx        # D3-based scatter plot (main upgrade impact)
│   ├── Polygon.tsx      # Polygon rendering component
│   ├── PopupEditor.tsx  # Polygon editing UI
│   └── Sidebar.tsx      # Data display sidebar
├── contexts/            # React Context providers
│   └── ChartContext.tsx # State management (React 19 Context API)
├── utils/
│   └── data/
│       └── loadCsvData.ts  # CSV parsing logic
├── types/
│   └── global.d.ts      # TypeScript type definitions
└── styles/              # CSS modules

public/
└── data/
    └── CD45_pos.csv     # Sample dataset (4800 points)

specs/                   # Feature specifications
└── 001-upgrade-dependencies/
    ├── spec.md
    ├── plan.md          # This file
    ├── research.md      # Phase 0 output (to be generated)
    ├── data-model.md    # Phase 1 output (to be generated)
    ├── quickstart.md    # Phase 1 output (to be generated)
    └── contracts/       # Phase 1 output (to be generated)
```

**Structure Decision**: Standard Next.js App Router web application structure. All source code under `src/` with clear separation: `app/` for routes, `components/` for React UI, `contexts/` for state management, `utils/` for data processing. Upgrade impacts all TypeScript files due to type definition updates and potential React 19 API changes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected** - All constitution principles are satisfied by this upgrade:
- Interactive UX First: No changes to user interaction patterns
- Data-Driven Rendering: No changes to D3/React rendering architecture  
- Context-Based State Management: No changes to ChartContext pattern
- Type Safety: Strict mode maintained, improved type definitions
- Incremental Feature Delivery: Single atomic upgrade with clear value

No complexity justification required.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion (research.md, data-model.md, contracts/, quickstart.md)*

✅ **Interactive UX First**: PASS - Design maintains all direct manipulation patterns. No modal dialogs or delayed feedback introduced. Upgrade is infrastructure-only with zero UX impact.

✅ **Data-Driven Rendering**: PASS - Design preserves D3.js rendering pipeline within React refs. React 19 hooks remain backward compatible. D3 version unchanged (7.9.0). Separation of concerns maintained.

✅ **Context-Based State Management**: PASS - Design confirms ChartContext/ChartDispatchContext pattern remains unchanged. React 19 Context API is backward compatible. No new global state introduced.

✅ **Type Safety**: PASS - Design enforces TypeScript strict mode (verified in contracts/tsconfig-schema.md). Type definitions improved (@types/react@19, @types/d3@7.4.3). Contract validation ensures zero implicit any types.

✅ **Incremental Feature Delivery**: PASS - Design delivers single P1 user story with clear acceptance criteria. Quickstart.md provides 2-3 hour execution path with rollback strategy. Feature independently testable and deployable.

**FINAL GATE STATUS**: ✅ ALL GATES PASSED - No constitution violations detected. Ready for Phase 2 (tasks generation via /speckit.tasks command).

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE
- **Output**: [research.md](research.md) - 10 research tasks completed
- **Key Findings**: 
  - All dependencies already at target versions in package.json
  - React 19 migration path validated (backward compatible hooks/Context)
  - Next.js 16 App Router already in use (no Pages Router migration needed)
  - MUI 7 requires coordinated Emotion upgrade (validated)
  - TypeScript 5.9.3 provides improved React 19 type support
  - Performance targets achievable (≤5s load time)
  - Security vulnerabilities to be validated post-upgrade via yarn audit

### Phase 1: Design ✅ COMPLETE
- **Outputs**:
  - [data-model.md](data-model.md) - 5 entities defined with validation rules
  - [contracts/package-json-schema.md](contracts/package-json-schema.md) - JSON Schema and validation tests
  - [contracts/tsconfig-schema.md](contracts/tsconfig-schema.md) - TypeScript config contract
  - [quickstart.md](quickstart.md) - 7-phase execution guide with rollback procedures
  
- **Key Design Decisions**:
  - Package manifest entity defines 16 core dependencies with semver constraints
  - Yarn lock file entity ensures reproducible builds with checksum validation
  - TypeScript config enforces strict mode (Constitutional requirement)
  - ESLint config aligns with Next.js 16 best practices
  - Node.js runtime validated at 20.9.0+ via package.json engines field
  - Validation pipeline: pre-install → post-install → build → runtime
  - Performance baseline comparison built into quickstart workflow
  - Rollback strategy: Git-based with yarn.lock restoration

### Phase 2: Tasks Generation ⏸️ PENDING
- **Next Command**: `/speckit.tasks` to generate [tasks.md](tasks.md)
- **Expected Output**: Granular task breakdown for upgrade execution
- **Estimated Tasks**: 15-20 tasks covering dependency updates, testing, validation, and deployment
