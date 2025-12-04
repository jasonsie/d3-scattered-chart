# Research: Dynamic Axis Selection

**Feature**: 005-dynamic-axis | **Date**: 2025-12-03  
**Purpose**: Resolve Technical Context unknowns and establish implementation patterns

## Research Tasks Completed

### 1. Material-UI Dropdown Implementation Pattern

**Question**: How to implement dropdown menus with dynamic option filtering (exclude selected axis from opposite dropdown)?

**Decision**: Use Material-UI Select component with controlled state

**Rationale**: 
- Material-UI Select provides built-in accessibility (ARIA labels, keyboard navigation)
- Controlled component pattern integrates cleanly with React Context state
- Native support for disabled state (required for FR-014: disable during rendering)
- MenuItem filtering can be implemented via array filter before map

**Implementation Pattern**:
```tsx
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// X-axis dropdown
<FormControl fullWidth disabled={isRendering}>
  <InputLabel>X-Axis</InputLabel>
  <Select
    value={axisConfig.xProperty}
    onChange={(e) => handleAxisChange('x', e.target.value)}
  >
    {availableProperties
      .filter(prop => prop !== axisConfig.yProperty)
      .map(prop => (
        <MenuItem key={prop} value={prop}>{prop}</MenuItem>
      ))
    }
  </Select>
</FormControl>
```

**Alternatives Considered**:
- Native HTML `<select>`: Rejected due to limited styling control and no MUI theme integration
- Custom dropdown component: Rejected as over-engineering; MUI Select handles all requirements

**Reference**: [MUI Select Documentation](https://mui.com/material-ui/react-select/)

---

### 2. D3 Scale Domain Updates for Axis Changes

**Question**: How to efficiently update D3 scale domains when axis properties change without recreating entire chart?

**Decision**: Rebuild scales with new domains, preserve scale references in Context

**Rationale**:
- D3 scales are immutable; domain changes require new scale instances
- Storing scales in Context (existing pattern in ChartContext) enables efficient propagation
- Scale recreation is O(1) operation; re-rendering data points is the bottleneck (already optimized)
- Preserving scale type (linear) means no need to rebuild scale factory

**Implementation Pattern**:
```tsx
// In Chart component or custom hook
const updateScales = useCallback((xProp: string, yProp: string) => {
  const xExtent = d3.extent(data, d => d[xProp]);
  const yExtent = d3.extent(data, d => d[yProp]);
  
  const xScale = d3.scaleLinear()
    .domain([xExtent[0]!, xExtent[1]!])
    .range([0, innerWidth]);
    
  const yScale = d3.scaleLinear()
    .domain([yExtent[0]!, yExtent[1]!])
    .range([innerHeight, 0]); // Inverted for SVG coordinates
    
  dispatch({ type: 'SET_SCALES', scales: { xScale, yScale } });
}, [data, innerWidth, innerHeight, dispatch]);
```

**Performance Impact**:
- Scale recreation: <1ms (negligible)
- Data point repositioning: ~50-100ms for 10k points (within 500ms budget)
- Spatial index rebuild: ~20ms (required for accurate point-in-polygon after coordinate change)

**Alternatives Considered**:
- Mutate existing scales via `.domain()`: Rejected due to React immutability principles and harder change detection
- Cache scales per property pair: Rejected as premature optimization; 210 combinations would waste memory

**Reference**: [D3 Scale Documentation](https://d3js.org/d3-scale)

---

### 3. Polygon Retention Confirmation Dialog

**Question**: What dialog component should be used for polygon retention confirmation?

**Decision**: Use Material-UI Dialog with custom confirmation buttons

**Rationale**:
- MUI Dialog provides modal overlay with focus trap (accessibility)
- Customizable actions allow "Keep" and "Remove" button labels (clearer than generic Yes/No)
- Dialog component is already used in the project (consistency)
- Blocks axis change until user decides (prevents accidental polygon loss)

**Implementation Pattern**:
```tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

<Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
  <DialogTitle>Keep existing polygons?</DialogTitle>
  <DialogContent>
    Changing axes will reposition data points. Keep polygons in current screen positions?
  </DialogContent>
  <DialogActions>
    <Button onClick={handleRemovePolygons}>Remove</Button>
    <Button onClick={handleKeepPolygons} variant="contained">Keep</Button>
  </DialogActions>
</Dialog>
```

**UX Flow**:
1. User selects new axis from dropdown
2. If polygons exist: Dialog appears immediately (before axis change applied)
3. User clicks "Keep" → Polygons preserved in screen coordinates, axis changes, stats recalculate
4. User clicks "Remove" → Polygons deleted, axis changes, chart re-renders clean

**Alternatives Considered**:
- Inline confirmation (banner/snackbar): Rejected because axis change shouldn't proceed until decision made
- Browser `confirm()`: Rejected due to poor UX and no customization

**Reference**: [MUI Dialog Documentation](https://mui.com/material-ui/react-dialog/)

---

### 4. Measurement Unit Scaling Control

**Question**: What UI component should be used for the measurement unit range control (100-2000)?

**Decision**: Use Material-UI Slider component with value labels

**Rationale**:
- Slider provides intuitive visual feedback for continuous range selection
- Built-in value labels show current scale value during drag
- Marks can be added at key intervals (100, 500, 1000, 1500, 2000) for reference
- onChange event fires during drag, onChangeCommitted fires on release (optimize render timing)

**Implementation Pattern**:
```tsx
import { Slider, Typography } from '@mui/material';

<FormControl fullWidth>
  <Typography gutterBottom>Measurement Unit Scale</Typography>
  <Slider
    value={unitScale}
    onChange={(_, value) => setUnitScale(value as number)}
    onChangeCommitted={(_, value) => handleUnitScaleChange(value as number)}
    min={100}
    max={2000}
    step={10}
    valueLabelDisplay="auto"
    marks={[
      { value: 100, label: '100' },
      { value: 1000, label: '1000' },
      { value: 2000, label: '2000' },
    ]}
    disabled={isRendering}
  />
</FormControl>
```

**Performance Consideration**: Use `onChangeCommitted` for actual axis update to avoid triggering re-renders during slider drag (improves perceived performance).

**Alternatives Considered**:
- Number input field: Rejected because less intuitive for range selection, no visual scale feedback
- Segmented control: Rejected because limited to discrete steps, not continuous range

**Reference**: [MUI Slider Documentation](https://mui.com/material-ui/react-slider/)

---

### 5. Modular Loading Component with GlobalContext

**Question**: How to implement a modular loading component for the entire app with centralized state management?

**Decision**: Create GlobalContext as outermost provider with plant circles animation component

**Rationale**:
- GlobalContext wraps entire app → provides loading state to all components
- Plant circles animation provides visual feedback during data operations
- Separates global concerns (loading) from feature-specific state (ChartContext)
- Modular Loading component can be reused across different loading scenarios

**Implementation Pattern**:
```tsx
// GlobalContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalState {
  isLoading: boolean;
  loadingMessage?: string;
}

const GlobalContext = createContext<GlobalState>({ isLoading: false });
const GlobalDispatchContext = createContext<((update: Partial<GlobalState>) => void) | null>(null);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalState>({ isLoading: false });
  
  const updateGlobal = (update: Partial<GlobalState>) => {
    setState(prev => ({ ...prev, ...update }));
  };
  
  return (
    <GlobalContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={updateGlobal}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalDispatchContext.Provider>
  );
}

export const useGlobalState = () => useContext(GlobalContext);
export const useGlobalDispatch = () => useContext(GlobalDispatchContext);
```

**Loading Component (Plant Circles Animation)**:
```tsx
// Loading.tsx
import styles from '@/styles/Loading.module.css';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message }: LoadingProps) {
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.plantCircles}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
```

**CSS Animation (Plant Circles)**:
```css
/* Loading.module.css - Based on CodePen example */
.loadingOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.plantCircles {
  display: flex;
  gap: 12px;
}

.circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  animation: grow 1.2s ease-in-out infinite;
}

.circle:nth-child(2) {
  animation-delay: 0.2s;
}

.circle:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes grow {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
```

**Usage in App Layout**:
```tsx
// app/layout.tsx
import { GlobalProvider } from '@/contexts/GlobalContext';
import Loading from '@/components/Loading';
import { useGlobalState } from '@/contexts/GlobalContext';

function AppContent({ children }) {
  const { isLoading, loadingMessage } = useGlobalState();
  
  return (
    <>
      {isLoading && <Loading message={loadingMessage} />}
      {children}
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GlobalProvider>
          <ChartProvider>
            <AppContent>{children}</AppContent>
          </ChartProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
```

**Trigger Loading State**:
```tsx
// In any component
const updateGlobal = useGlobalDispatch();

// Show loading
updateGlobal({ isLoading: true, loadingMessage: 'Loading data...' });

// Hide loading
updateGlobal({ isLoading: false });
```

**Alternatives Considered**:
- Add loading state to ChartContext: Rejected because loading is a global concern, not chart-specific
- Use external loading library: Rejected to maintain full control over animation and styling
- No global loading state: Rejected because multiple features need coordinated loading feedback

**Reference**: [Plant Circles Animation](https://codepen.io/esdesignstudio/pen/RwQdEZb)

---

### 6. Data Validation for Missing/Invalid Values

**Question**: How to efficiently filter data points with invalid values in selected axis properties?

**Decision**: Pre-filter data array on axis change before passing to D3 scales and renderers

**Rationale**:
- Single pass filter operation: O(n) complexity, ~5-10ms for 10k points (acceptable)
- Avoids null checks in render loop (cleaner, more performant)
- Invalid points excluded from both scale domain calculation and rendering
- Consistent with existing data loading pattern (loadCsvData already parses numeric values)

**Implementation Pattern**:
```tsx
const filterValidDataPoints = useCallback((
  data: CellData[], 
  xProp: string, 
  yProp: string
): CellData[] => {
  return data.filter(d => {
    const xValue = d[xProp];
    const yValue = d[yProp];
    return (
      xValue != null && 
      yValue != null && 
      !isNaN(xValue) && 
      !isNaN(yValue) &&
      isFinite(xValue) &&
      isFinite(yValue)
    );
  });
}, []);
```

**Edge Cases Handled**:
- `null` or `undefined`: Excluded via `!= null` check
- `NaN`: Excluded via `!isNaN()` check
- `Infinity` or `-Infinity`: Excluded via `isFinite()` check

**Performance Impact**: Filtering 10k points with 2 property checks: ~5ms (negligible in 500ms render budget)

**Alternatives Considered**:
- Filter during render: Rejected due to repeated checks in render loop
- Replace with defaults (0 or mean): Rejected per spec decision (filter out, don't impute)

---

### 6. Axis Label Derivation from Property Names

**Question**: How to extract measurement units from CSV column names for axis labels?

**Decision**: Use regex pattern matching on property name suffixes

**Rationale**:
- CSV columns follow consistent naming: `[Marker]-[Unit]` (e.g., "CD45-KrO", "SS INT LIN")
- Unit suffix extraction via regex is deterministic and type-safe
- Fallback to full property name if pattern doesn't match (handles edge cases)

**Implementation Pattern**:
```tsx
const parsePropertyLabel = (propertyName: string): { marker: string; unit: string } => {
  // Match pattern: "Property-Unit" or "Property Unit" or "Property_Unit"
  const match = propertyName.match(/^(.+?)[-_\s](.+)$/);
  
  if (match) {
    return {
      marker: match[1].trim(),
      unit: match[2].trim(),
    };
  }
  
  // Fallback: No unit detected
  return {
    marker: propertyName,
    unit: '',
  };
};

// Usage for axis label
const xAxisLabel = axisConfig.xProperty; // e.g., "CD45-KrO"
const { marker, unit } = parsePropertyLabel(xAxisLabel);
const displayLabel = unit ? `${marker} (${unit})` : marker; // "CD45 (KrO)"
```

**Data Properties from CD45_pos.csv**:
- Properties with units: "FS INT LIN", "SS INT LIN", "CD45-KrO", "Kappa-FITC", etc.
- Properties without units: "TIME"
- Unit examples: "INT LIN", "KrO", "FITC", "PE", "ECD", "PC5.5", "PC7", "APC", "PB"

**Alternatives Considered**:
- Manual unit mapping table: Rejected as brittle (requires maintenance for new datasets)
- No unit display: Rejected because units provide essential context for interpretation

---

## Best Practices Summary

### React + D3 Integration
- **Principle**: React owns state and lifecycle, D3 owns DOM manipulation within refs
- **Pattern**: Store D3 scales in Context, compute in useEffect, apply via D3 selections
- **Reference**: [Integrating D3 with React](https://2019.wattenberger.com/blog/react-and-d3)

### Material-UI Form Controls
- **Principle**: Use controlled components with Context state for all form inputs
- **Pattern**: FormControl wrapper → InputLabel + Select/Slider → dispatch on change
- **Accessibility**: MUI components include ARIA labels, keyboard navigation, and focus management

### Performance Optimization
- **Data filtering**: Single-pass filter before render (not during render loop)
- **Scale updates**: Rebuild scales on axis change, cache in Context to avoid re-creation
- **Render batching**: Use `onChangeCommitted` for sliders to batch updates
- **Spatial index**: Rebuild on axis change (required for accurate point-in-polygon)

### TypeScript Type Safety
- **Axis properties**: Define as string literal union type from CSV columns
- **Scale types**: Use `d3.ScaleLinear<number, number>` with explicit generics
- **Action types**: Discriminated union for axis change actions in reducer

---

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:

1. ✅ **MUI dropdown implementation**: Material-UI Select with controlled state
2. ✅ **D3 scale updates**: Rebuild scales with new domains, store in Context
3. ✅ **Polygon confirmation dialog**: MUI Dialog with "Keep"/"Remove" actions
4. ✅ **Unit scale control**: MUI Slider (100-2000 range, default 1000)
5. ✅ **Data validation**: Pre-filter invalid values before rendering
6. ✅ **Axis label derivation**: Regex pattern matching on property name suffixes

**Next Phase**: Proceed to Phase 1 (Design & Contracts) with all technical unknowns resolved.
