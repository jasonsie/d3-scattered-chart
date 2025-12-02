# Research: Codebase Refactoring for Maintainability

**Date**: 2025-12-02  
**Phase**: 0 - Research & Discovery  
**Status**: Complete

## Research Questions

Based on Technical Context gaps and Constitution Check requirements:

1. **Context Splitting Strategy**: How to split ChartContext into domain-specific contexts for optimal re-rendering?
2. **TypeScript Validation**: What checklist ensures strict mode compliance during refactoring?
3. **CSS Module Migration**: Best practices for migrating inline styles to CSS modules in React?
4. **JSDoc Standards**: What level of JSDoc detail for React components, hooks, and utilities?
5. **ESLint Configuration**: How to configure import/no-cycle rule for circular dependency prevention?
6. **Constants Extraction**: What patterns for extracting magic numbers/strings into shared constants and component-specific enums?
7. **Type Consolidation**: How to organize types in `/src/types` to prevent circular dependencies?
8. **Unused Code Cleanup**: What tools and process for removing unused imports/variables?

---

## 1. Context Splitting Strategy

### Decision
Split single ChartContext into three domain-specific contexts:
- **ChartDataContext**: Immutable data (CSV points, scales, dimensions)
- **ChartSelectionContext**: Interactive state (selected polygons, hover state)
- **ChartUIContext**: UI state (drawing mode, editor visibility, sidebar state)

### Rationale
- **Performance**: Components subscribing only to relevant context reduce unnecessary re-renders
- **Constitution Compliance**: Aligns with Context-Based State Management principle (III)
- **Maintainability**: Clear separation of concerns makes state flow easier to understand

### Implementation Pattern
```typescript
// ChartDataContext.tsx - Read-only data
const ChartDataContext = createContext<ChartData | null>(null);
const useChartData = () => {
  const context = useContext(ChartDataContext);
  if (!context) throw new Error('useChartData must be used within ChartDataProvider');
  return context;
};

// ChartSelectionContext.tsx - Selection state with dispatch
const ChartSelectionContext = createContext<SelectionState | null>(null);
const ChartSelectionDispatchContext = createContext<Dispatch<SelectionAction> | null>(null);

// ChartUIContext.tsx - UI state with dispatch
const ChartUIContext = createContext<UIState | null>(null);
const ChartUIDispatchContext = createContext<Dispatch<UIAction> | null>(null);
```

### Alternatives Considered
- **Single Context with useMemo selectors**: Still causes all consumers to re-render on any state change
- **Redux/Zustand**: Over-engineering for this project size; React Context sufficient per constitution
- **Component prop drilling**: Violates DRY principle and makes state harder to track

### Reference
- React docs: [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- Kent C. Dodds: [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

---

## 2. TypeScript Validation Checklist

### Decision
Enforce strict mode compliance through:
1. **Pre-refactor audit**: Run `tsc --noEmit` to catch existing issues
2. **Incremental validation**: Run `tsc --noEmit` after each component refactoring
3. **Explicit types required**: All function parameters, return types, props interfaces
4. **No `any` escape hatches**: Use `unknown` for truly dynamic types, then narrow with type guards
5. **D3 exception**: D3 event types may use `any` with `// @ts-expect-error D3 event typing` comment

### Rationale
- **Constitution**: Type Safety principle (IV) mandates explicit types
- **Early detection**: Catches coordinate system bugs (SVG vs data space) during refactoring
- **Documentation**: Type signatures serve as inline API documentation

### Validation Commands
```bash
# Check entire codebase
npm run tsc -- --noEmit

# Check specific file during refactoring
npm run tsc -- --noEmit src/components/PopupEditor.tsx
```

### Common Patterns
```typescript
// ✅ Good: Explicit types
interface PopupEditorProps {
  label: string;
  color: string;
  onSave: (label: string, color: string) => void;
  onClose: () => void;
}

export default function PopupEditor({ label, color, onSave, onClose }: PopupEditorProps): JSX.Element {
  // ...
}

// ❌ Bad: Implicit any
function PopupEditor({ label, color, onSave, onClose }) {
  // ...
}
```

### Reference
- TypeScript handbook: [Type Checking JavaScript Files](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
- Current tsconfig.json already has `"strict": true` enabled

---

## 3. CSS Module Migration

### Decision
Use CSS Modules with camel case class names matching component structure:
1. Create `ComponentName.module.css` co-located with `ComponentName.tsx`
2. Convert inline style objects to CSS classes
3. Use camel case naming: `.componentName`, `.componentNameElement`
4. Import as: `import styles from './ComponentName.module.css'`
5. Apply as: `className={styles.componentName}`

### Rationale
- **Scoping**: CSS Modules prevent class name collisions automatically
- **Maintainability**: Centralized styles easier to modify than scattered inline objects
- **Performance**: CSS classes more performant than inline styles (no object creation on each render)
- **Theming**: Centralized CSS enables future theme changes

### Migration Pattern
```tsx
// Before: Inline styles
<div style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px'
}}>

// After: CSS Module
import styles from './PopupEditor.module.css';
<div className={styles.modal}>

// PopupEditor.module.css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
}
```

### Dynamic Styles Exception
For truly dynamic values (e.g., polygon colors from data), use CSS custom properties:
```tsx
<div 
  className={styles.polygon} 
  style={{ '--polygon-color': color } as React.CSSProperties}
>

// CSS
.polygon {
  fill: var(--polygon-color);
}
```

### Reference
- Next.js docs: [CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- Project already uses CSS modules (Chart.module.css, page.module.css exist)

---

## 4. JSDoc Standards

### Decision
JSDoc for all exported functions, complex logic only:
1. **Components**: Document purpose, props are typed (no need to duplicate)
2. **Hooks**: Document purpose, parameters, return value
3. **Utilities**: Full JSDoc with @param, @returns, @example for public functions
4. **Complex logic**: Inline comments explaining "why" not "what"

### Rationale
- **Spec requirement**: "Standard: JSDoc for all functions, inline comments for complex logic only"
- **TypeScript synergy**: Types provide "what", JSDoc provides "why"
- **IDE support**: JSDoc shows in autocomplete tooltips

### Patterns
```typescript
/**
 * Custom hook for managing polygon selection state with spatial indexing.
 * Uses Flatbush R-tree for efficient point-in-polygon queries on large datasets.
 * 
 * @returns {Object} Selection state and handlers
 * @returns {Polygon[]} return.selectedPolygons - Currently selected polygons
 * @returns {Function} return.selectPolygon - Handler to add polygon to selection
 */
export function usePolygonSelection() {
  // ...
}

/**
 * Transforms data coordinates to SVG viewport coordinates.
 * Accounts for zoom level and pan offset.
 * 
 * @param x - Data space X coordinate
 * @param y - Data space Y coordinate
 * @param scale - D3 scale function
 * @returns {[number, number]} SVG [x, y] coordinates
 */
export function dataToSVG(x: number, y: number, scale: d3.ScaleLinear<number, number>): [number, number] {
  return [scale(x), scale(y)];
}
```

### Reference
- JSDoc official: [Getting Started](https://jsdoc.app/about-getting-started.html)
- TypeScript + JSDoc: [JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

---

## 5. ESLint Configuration

### Decision
Add `eslint-plugin-import` with `import/no-cycle` rule:

```json
// .eslintrc or eslint.config.mjs
{
  "plugins": ["import"],
  "rules": {
    "import/no-cycle": ["error", { "maxDepth": 10 }]
  }
}
```

### Rationale
- **Spec requirement**: FR-008 requires automated circular dependency prevention
- **Constitution**: Supports modular design principle
- **Automated**: Catches cycles during development, not at runtime

### Installation
```bash
npm install --save-dev eslint-plugin-import
```

### Current Status
- Project uses ESLint (eslint-config-next present in package.json)
- Uses new flat config format (eslint.config.mjs exists)
- Need to add import plugin and configure rule

### Reference
- eslint-plugin-import: [import/no-cycle](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md)
- Next.js ESLint: [ESLint Plugin](https://nextjs.org/docs/app/building-your-application/configuring/eslint)

---

## 6. Constants Extraction

### Decision
Extract magic numbers and strings into two categories:

**Shared Constants** (`/src/utils/constants/`):
- `colors.ts`: Color values used across components
- `dimensions.ts`: Chart dimensions, margins, default sizes
- `performance.ts`: Performance thresholds (render budgets, timeouts)

**Component-Specific Enums** (co-located with usage):
- `chart.ts`: Chart-specific constants (data domains, layer z-indexes, axis labels)
- `polygon.ts`: Polygon states, limits (max 50 polygons), default styles
- `canvas.ts`: Canvas settings (device pixel ratio defaults, clear flags)

### Rationale
- **Reusability**: Shared constants (colors, dimensions) used across multiple components
- **Maintainability**: Single source of truth for values like color palette
- **Type Safety**: Enums provide autocomplete and prevent typos
- **Discoverability**: Constants organized by domain make values easy to find

### Implementation Pattern
```typescript
// src/utils/constants/colors.ts
export const COLORS = {
  POLYGON_DEFAULT: '#808080',
  POINT_UNSELECTED: 'white',
  POINT_SELECTED_ALPHA: 0.4,
  POINT_UNSELECTED_ALPHA: 0.89,
} as const;

// src/utils/constants/chart.ts
export const CHART_CONSTANTS = {
  DATA_DOMAIN_X: [200, 1000] as const,
  DATA_DOMAIN_Y: [0, 1000] as const,
  MARGINS: { top: 20, right: 20, bottom: 50, left: 60 } as const,
  AXIS_LABELS: {
    X: 'CD45-KrO',
    Y: 'SS INT LIN',
  },
} as const;

export const LAYER_Z_INDEX = {
  DATA_POINTS: 0,
  POLYGON_OVERLAY: 1,
  INTERACTION: 2,
  AXES: 3,
} as const;

// src/utils/constants/polygon.ts
export const POLYGON_CONSTANTS = {
  MAX_POLYGONS: 50,
  DEFAULT_LINE_WIDTH: 2,
  SELECTION_FEEDBACK_MS: 100,
} as const;

export enum PolygonState {
  Idle = 'idle',
  Drawing = 'drawing',
  Selected = 'selected',
  Hovered = 'hovered',
}
```

### Usage Example
```typescript
// Before
const margin = { top: 20, right: 20, bottom: 50, left: 60 };
const limitedPolygons = action.polygons.slice(0, 50);

// After
import { CHART_CONSTANTS, POLYGON_CONSTANTS } from '@/utils/constants';
const margin = CHART_CONSTANTS.MARGINS;
const limitedPolygons = action.polygons.slice(0, POLYGON_CONSTANTS.MAX_POLYGONS);
```

### Alternatives Considered
- **All constants in single file**: Rejected as it creates one massive constants file
- **Constants in component files**: Rejected as it prevents reusability
- **No extraction of low-level primitives** (0, 1, 2): Accepted - only extract meaningful domain values

### Reference
- TypeScript handbook: [const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- Clean Code: Magic numbers should be named constants

---

## 7. Type Consolidation

### Decision
Consolidate types into `/src/types` with domain-based organization:

**Existing files** (keep as-is):
- `canvas.d.ts`: Canvas-specific types (Viewport, CanvasLayer, CoordinateTransform)
- `css.d.ts`: CSS module type declarations
- `global.d.ts`: Global type augmentations

**New files** (add for refactoring):
- `components.d.ts`: Component prop interfaces (ChartProps, PolygonProps, PopupEditorProps, SidebarProps)
- `state.d.ts`: Context state types (ChartData, SelectionState, UIState)
- `hooks.d.ts`: Hook return types and parameters
- `constants.d.ts`: Type definitions for constants (if needed for complex constant structures)

### Rationale
- **Single source of truth**: All types in one directory prevents duplication
- **Prevents circular dependencies**: Types can't import from components/hooks
- **IDE support**: Centralized types improve autocomplete across project
- **Constitution compliance**: Type Safety principle (IV) requires explicit type management

### Import Pattern
```typescript
// Component imports type-only
import type { ChartProps } from '@/types/components';
import type { ChartData } from '@/types/state';

// Prevents circular dependencies (type imports are erased at runtime)
export default function Chart({ width, height }: ChartProps) {
  // ...
}
```

### Migration Strategy
1. Create new type files in `/src/types`
2. Move interface definitions from component files to appropriate type files
3. Update component files to import types
4. Run `tsc --noEmit` to verify no circular dependencies
5. Run ESLint with import/no-cycle to catch runtime cycles

### Circular Dependency Prevention
```typescript
// ❌ BAD: Creates cycle (Component -> Type -> Component)
// types/components.d.ts
import { useChartData } from '@/contexts/ChartDataContext'; // Imports component code!

// ✅ GOOD: Type-only import (erased at runtime)
// types/components.d.ts
import type { ChartData } from './state';

export interface ChartProps {
  data: ChartData; // Type reference only
}
```

### Reference
- TypeScript handbook: [Type-only imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)
- ESLint import/no-cycle: Detects runtime circular dependencies

---

## 8. Unused Code Cleanup

### Decision
Use automated tooling + manual review for unused code removal:

**Tooling**:
1. **ESLint**: `@typescript-eslint/no-unused-vars` rule (already enabled in Next.js ESLint config)
2. **TypeScript**: `tsc --noUnusedLocals --noUnusedParameters` (optional strict flags)
3. **Manual review**: Check each refactored file for unused exports

**Scope** (per clarifications):
- ✅ Remove unused imports in files being actively refactored
- ✅ Remove unused variables in refactored files
- ❌ Don't scan entire codebase (only refactored components/hooks/utils)

### Rationale
- **Maintainability**: Unused code creates confusion about what's actually needed
- **Performance**: Reduces bundle size (tree-shaking works better with no unused exports)
- **Spec requirement**: FR-020 requires unused code removal in refactored files

### Process (per component refactoring)
```bash
# 1. Run ESLint to find unused variables
npm run lint src/components/PopupEditor.tsx

# 2. Run TypeScript compiler checks
tsc --noEmit --noUnusedLocals --noUnusedParameters src/components/PopupEditor.tsx

# 3. Manual review
# - Check for unused exports (ESLint doesn't catch these in all cases)
# - Remove commented-out code
# - Remove unused type parameters
```

### Common Patterns
```typescript
// ❌ Unused import
import { useEffect, useState, useMemo } from 'react'; // useMemo never used

// ✅ Fixed
import { useEffect, useState } from 'react';

// ❌ Unused variable
const PopupEditor = ({ label, color, line, dot }) => {
  const [localLabel, setLocalLabel] = useState(label);
  // line and dot never used!
};

// ✅ Fixed (remove unused props)
const PopupEditor = ({ label, color }) => {
  const [localLabel, setLocalLabel] = useState(label);
};
```

### Exceptions
- **Future-use imports**: Remove (add back when needed via Git)
- **Debugging variables**: Remove before commit
- **Type-only imports for complex types**: Keep if used in type annotations (ESLint sometimes reports false positives)

### Reference
- ESLint: [@typescript-eslint/no-unused-vars](https://typescript-eslint.io/rules/no-unused-vars/)
- TypeScript: [--noUnusedLocals compiler option](https://www.typescriptlang.org/tsconfig#noUnusedLocals)

---

## Summary

All research questions resolved with concrete decisions:

| Topic | Decision | Implementation Complexity |
|-------|----------|--------------------------|
| Context Splitting | 3 domain contexts (Data, Selection, UI) | Medium - requires careful state migration |
| TypeScript Validation | Checklist + `tsc --noEmit` per component | Low - tooling already exists |
| CSS Module Migration | `.module.css` with camel case classes | Low - Next.js already supports |
| JSDoc Standards | All exports, complex logic only | Low - standard practice |
| ESLint Configuration | Add import plugin with no-cycle rule | Low - plugin installation + config |
| Constants Extraction | Shared constants + component-specific enums | Low - straightforward extraction |
| Type Consolidation | Domain-based files in `/src/types` | Medium - requires careful migration to avoid cycles |
| Unused Code Cleanup | ESLint + tsc + manual review | Low - automated tooling + spot checks |

**No blockers identified.** Ready to proceed to Phase 1: Design & Contracts.
