# Quickstart: Codebase Refactoring

**Prerequisites**: Spec approved, Node.js ≥20.9.0, `npm install`, verify `npm run dev` works

## Implementation Phases (20 hours / 4 days)

**Phase 1: Setup** (Day 1)  
1. ESLint + TypeScript baseline  
2. Create constants files (5 files in `/src/utils/constants`)  
3. Create type files (3 files in `/src/types`)  
4. Split contexts (ChartData, ChartSelection, ChartUI)

**Phase 2: Components** (Days 2-3)  
For each (PopupEditor → Sidebar → Polygon → Chart):  
- Extract types → `/src/types`  
- Extract constants → `/src/utils/constants`  
- Migrate to CSS modules → `/src/styles`  
- Remove unused code (ESLint)  
- Add JSDoc

**Phase 3: Integration** (Day 4)  
5. Update components to use split contexts  
6. Remove old ChartContext  
7. Add JSDoc to hooks/utils  
8. Update architecture docs

## Detailed Steps

### Step 1: Setup ESLint & TypeScript

```bash
npm install --save-dev eslint-plugin-import
```

Add to `eslint.config.mjs`:
```javascript
import pluginImport from 'eslint-plugin-import';
export default [{
  plugins: { import: pluginImport },
  rules: { 'import/no-cycle': ['error', { maxDepth: 10 }] }
}];
```

Verify: `npm run lint && npm run tsc -- --noEmit` (0 errors)

### Step 2: Create Constants Files

```bash
mkdir -p src/utils/constants
```

Create 5 files (see [contracts/constants-definitions.md](contracts/constants-definitions.md)):
- `colors.ts` - COLORS, ColorKey
- `dimensions.ts` - CHART_DIMENSIONS, FONT_SIZES, MARGINS
- `performance.ts` - PERFORMANCE thresholds
- `chart.ts` - CHART_CONSTANTS, LAYER_Z_INDEX, LayerType
- `polygon.ts` - POLYGON_CONSTANTS, PolygonState enum, LineStyle
- `canvas.ts` - CANVAS_CONSTANTS, CanvasLayerId enum

Verify: `npm run type-check`

### Step 3: Create Type Definition Files

```bash
mkdir -p src/types
```

Create 3 files (see [contracts/type-organization.md](contracts/type-organization.md)):
- `components.d.ts` - ChartProps, PolygonProps, PopupEditorProps, SidebarProps, Polygon, Point, PolygonStyle
- `state.d.ts` - ChartData, DataPoint, SelectionState, UIState, ShowPopup, DrawMode, Margins
- `hooks.d.ts` - CanvasRendererResult, RenderFunction, CoordinateTransformResult, PolygonSelectionResult, SpatialIndexResult

Keep existing: `canvas.d.ts`, `css.d.ts`, `global.d.ts`

Verify: `npm run type-check && npm run lint`

### Step 4: Split Context

Create 3 contexts (see [contracts/context-apis.md](contracts/context-apis.md)):
- `ChartDataContext.tsx` - Immutable data (CSV, scales)
- `ChartSelectionContext.tsx` - Polygons, selection state (reducer with 10 actions)
- `ChartUIContext.tsx` - UI state (popup, drawMode, sidebar)

Update `src/app/page.tsx`:
```typescript
<ChartDataProvider csvPath="/data/CD45_pos.csv">
  <ChartSelectionProvider>
    <ChartUIProvider>
      {/* components */}
    </ChartUIProvider>
  </ChartSelectionProvider>
</ChartDataProvider>
```

Don't delete old `ChartContext.tsx` until Step 10.

### Steps 5-8: Refactor Components (PopupEditor → Sidebar → Polygon → Chart)

For each component:
1. **Extract types**: `import type { ComponentProps } from '@/types/components'`
2. **Extract constants**: `import { COLORS, LAYER_Z_INDEX } from '@/utils/constants/*'`
3. **Create CSS module**: `src/styles/ComponentName.module.css` (see [contracts/css-module-conventions.md](contracts/css-module-conventions.md))
4. **Update component**: Replace `style={{}}` with `className={styles.class}`
5. **Remove unused**: `npm run lint src/components/ComponentName.tsx` → fix
6. **Add JSDoc**: Document component purpose, params, returns

**Verify each**: `npm run type-check && npm run lint && npm run dev` (visual test)

**Checklist per component**:
- [ ] No inline styles (`grep 'style={{' returns 0`)
- [ ] Types from `/src/types`
- [ ] Constants replaced magic numbers
- [ ] CSS module applied
- [ ] Zero unused code
- [ ] JSDoc complete
- [ ] Visual/functional identical

### Step 9: Update Components to Use Split Contexts

For each component (Chart, Polygon, PopupEditor, Sidebar):

```typescript
// Before
import { useChartContext } from '@/contexts/ChartContext';
const { data, selectedPolygons, editorOpen } = useChartContext();

// After
import { useChartData } from '@/contexts/ChartDataContext';
import { useChartSelection } from '@/contexts/ChartSelectionContext';
import { useChartUI } from '@/contexts/ChartUIContext';
const { data } = useChartData();
const { selectedPolygons } = useChartSelection();
const { editorOpen } = useChartUI();
```

Verify: Test draw/select/edit/delete, check React DevTools for re-render reduction

### Step 10: Remove Old ChartContext

```bash
grep -r "ChartContext'" src/  # Should be 0 results
rm src/contexts/ChartContext.tsx
npm run build
```

### Step 11-12: Add JSDoc

Add to all hooks/utils:
```typescript
/**
 * [Purpose and responsibilities]
 * @param name - Description
 * @returns Description
 * @example const result = useHook();
 */
```

Focus: Coordinate transforms, spatial index, polygon geometry

### Step 13: Update Architecture Docs

Update `CLAUDE.md` or create `docs/architecture.md`:
- Context organization (3 domains)
- Component responsibilities
- CSS organization (CSS Modules)
- Common tasks (add property, debug re-renders)

## Final Validation

**Functionality**: App loads, CSV displays, draw/select/edit/delete works, sidebar stats correct  
**Code Quality**: `npm run type-check && npm run lint && npm run build` all pass, zero inline styles (`grep -r 'style={{' src/components/`), zero magic numbers, all JSDoc present, types in `/src/types`, constants in `/src/utils/constants`, zero unused code  
**Performance**: React DevTools shows 30% re-render reduction, <500ms render, <100ms selection  
**Documentation**: Architecture docs updated with context organization and common tasks

## Troubleshooting

**TypeScript errors**: Update imports to split context hooks  
**Visual regression**: Compare inline styles vs CSS classes in DevTools  
**Circular dependencies**: Extract shared types to `/src/types`  
**Performance regression**: Verify context subscriptions, add `useMemo`/`useCallback`

## Success Criteria (SC-001 to SC-011)

Verify: Zero inline styles, zero magic numbers, all types in `/src/types`, zero unused code, 30% re-render reduction, all JSDoc present, no circular dependencies, all functionality identical
