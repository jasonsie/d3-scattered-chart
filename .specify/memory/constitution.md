<!--
Sync Impact Report:
- Version change: [CONSTITUTION_VERSION] → 1.0.0
- Modified principles: N/A (initial version)
- Added sections:
  - Core Principles (5 principles defined)
  - Visual Design Standards
  - Code Quality Standards
  - Governance
- Removed sections: N/A (initial version)
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section already present
  ✅ spec-template.md - User Scenarios & Testing aligns with Interactive UX principle
  ✅ tasks-template.md - Task organization supports incremental delivery
- Follow-up TODOs: None
-->

# D3 Scattered Chart Constitution

## Core Principles

### I. Interactive UX First

User interaction quality is paramount. Every visualization feature MUST support direct manipulation patterns where users can see immediate visual feedback. Features MUST be designed with these interaction principles:

- Click-to-select, drag-to-draw patterns over modal dialogs
- Visual state changes occur within 100ms of user action
- Hover states provide preview feedback before commitment
- Undo/redo capability for destructive actions

**Rationale**: Data visualization tools succeed when users can explore data naturally. Modal dialogs and delayed feedback break the flow of data exploration. Direct manipulation keeps users engaged with their analysis.

### II. Data-Driven Rendering

D3.js controls all visual representation through data binding. All visual elements (points, polygons, axes) MUST be rendered through D3 selections bound to state data. Implementation rules:

- React manages state and component lifecycle
- D3 handles DOM manipulation within SVG ref elements only
- D3 scales are created once and shared via context
- No direct SVG manipulation outside D3 selection patterns

**Rationale**: Mixing React's virtual DOM with direct SVG manipulation causes rendering conflicts. This clear separation prevents bugs and maintains predictable update cycles.

### III. Context-Based State Management

Application state MUST be managed through React Context API with useReducer pattern. State updates MUST flow unidirectionally through dispatched actions. Rules:

- Single ChartContext provides read-only state to all components
- ChartDispatchContext provides dispatch function separately
- All state mutations happen through chartReducer with typed actions
- No local state for data that affects multiple components

**Rationale**: Centralized state ensures polygon selections, drawing state, and data remain synchronized across the scatter plot, sidebar, and editor components. Reducer pattern provides predictable state transitions with full action history.

### IV. Type Safety

TypeScript strict mode MUST be enabled. All props, state, and function signatures MUST have explicit types. Exception: D3 event types may use any with justification comment.

- No implicit any types in new code
- CSV data must be validated and typed after parsing
- D3 scales must have generic type parameters
- Action types must use discriminated unions

**Rationale**: Type safety catches coordinate system mismatches (SVG space vs data space), prevents polygon point corruption, and documents expected data shapes for maintainability.

### V. Incremental Feature Delivery

New features MUST be developed as independently testable user stories with clear value propositions. Each story MUST deliver working functionality before starting the next. Rules:

- User stories prioritized P1, P2, P3 by user impact
- P1 stories are MVP-complete and deployable
- No "preparatory refactoring" before feature delivery
- Feature flags over long-lived branches

**Rationale**: Visualization features are high-risk for scope creep. Incremental delivery ensures the 2025 Data Visualization Challenge deadline is met with core functionality complete, even if nice-to-have features are deferred.

## Visual Design Standards

### Color and Accessibility

- Color palettes MUST provide sufficient contrast (WCAG AA minimum)
- Selected polygons MUST have distinct visual states (not color-only)
- Data point colors MUST remain distinguishable at 5% opacity overlaps

### Performance Thresholds

- Scatter plot MUST render 5000+ points within 500ms on target hardware
- Polygon selection feedback MUST complete within 100ms
- Statistical calculations (count, percentage) MUST update within 200ms

**Justification**: The CD45+ dataset contains ~4800 points. Rendering budget allows for dataset growth while maintaining interactive frame rates.

## Code Quality Standards

### Testing Requirements

Testing is OPTIONAL unless explicitly requested in feature specifications. When tests are requested:

- Integration tests MUST verify user interaction flows (click → draw → select → edit)
- Contract tests MUST validate CSV parsing and data structure assumptions
- Unit tests for statistical calculations (point-in-polygon, percentage calculations)

### Documentation Requirements

- Feature additions MUST update CLAUDE.md with architectural changes
- Breaking changes to polygon data format MUST update migration guide
- New D3 patterns MUST include coordinate system comments (data space vs SVG space)

## Governance

### Amendment Process

Constitution changes require:

1. Proposed amendment with rationale documented
2. Impact assessment on existing templates (plan, spec, tasks)
3. Version bump following semantic versioning (MAJOR.MINOR.PATCH)
4. Update to dependent template files before merge

### Complexity Justification

Violations of principles (e.g., adding global state outside Context, mixing React/D3 responsibilities) MUST be justified in plan.md Complexity Tracking table:

- What principle is violated
- Why the violation is necessary for user value
- What simpler alternatives were considered and why they're insufficient

### Compliance Review

Pull requests MUST verify:

- TypeScript strict mode passes with no suppressions
- Performance thresholds met (if feature affects rendering)
- Constitution principles followed or violations justified
- Templates updated if constitution referenced sections changed

**Version**: 1.0.0 | **Ratified**: 2025-11-30 | **Last Amended**: 2025-11-30
