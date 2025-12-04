# Quickstart: Dynamic Axis Selection

**Feature**: 005-dynamic-axis | **For**: Developers implementing this feature  
**Goal**: Get axis selection dropdowns working in <30 minutes

---

## Prerequisites

- D3 Scattered Chart project already set up (existing codebase)
- Material-UI installed (`@mui/material`, `@mui/icons-material`)
- TypeScript strict mode enabled
- Familiar with React Context API and D3.js basics

---

## Step 1: Add Axis Constants (5 min)

Create `/src/utils/constants/axis.ts`:

```typescript
import type { AxisConfiguration, DataPropertyName, DataPropertyMetadata } from '@/types/state';

// All available data properties from CSV (in CSV order)
export const DATA_PROPERTY_NAMES: readonly DataPropertyName[] = [
  'FS INT LIN',
  'SS INT LIN',
  'Kappa-FITC',
  'Lambda-PE',
  'CD10-ECD',
  'CD5-PC5.5',
  'CD200-PC7',
  'CD34-APC',
  'CD38-APC-A700',
  'CD20-APC-A750',
  'CD19-PB',
  'CD45-KrO',
  'TIME',
  'FS PEAK LIN',
  'SS PEAK LIN',
] as const;

// Default axis configuration
export const DEFAULT_AXIS_CONFIG: AxisConfiguration = {
  xProperty: 'CD45-KrO',
  yProperty: 'SS INT LIN',
  xLabel: 'CD45-KrO',
  yLabel: 'SS INT LIN',
  xUnit: 'KrO',
  yUnit: 'INT LIN',
  unitScale: 1000,
};

// Utility: Parse property name to extract marker and unit
export const parsePropertyLabel = (propertyName: string): { marker: string; unit: string } => {
  const match = propertyName.match(/^(.+?)[-_\s](.+)$/);
  if (match) {
    return { marker: match[1].trim(), unit: match[2].trim() };
  }
  return { marker: propertyName, unit: '' };
};
```

**Why**: Centralizes axis configuration data for type safety and consistency.

---

## Step 2: Extend Type Definitions (5 min)

Add to `/src/types/state.d.ts`:

```typescript
// Available data property names
export type DataPropertyName = 
  | 'FS INT LIN'
  | 'SS INT LIN'
  | 'Kappa-FITC'
  | 'Lambda-PE'
  | 'CD10-ECD'
  | 'CD5-PC5.5'
  | 'CD200-PC7'
  | 'CD34-APC'
  | 'CD38-APC-A700'
  | 'CD20-APC-A750'
  | 'CD19-PB'
  | 'CD45-KrO'
  | 'TIME'
  | 'FS PEAK LIN'
  | 'SS PEAK LIN';

// Axis configuration
export interface AxisConfiguration {
  xProperty: DataPropertyName;
  yProperty: DataPropertyName;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  unitScale: number;
}

// Property metadata
export interface DataPropertyMetadata {
  propertyName: DataPropertyName;
  displayLabel: string;
  unit: string;
  dataType: 'numeric';
}
```

**Why**: TypeScript ensures compile-time safety for axis property access.

---

## Step 3: Update ChartContext (10 min)

Edit `/src/contexts/ChartContext.tsx`:

**Add to ChartState interface**:
```typescript
interface ChartState {
  // ... existing fields
  axisConfig: AxisConfiguration;
  isRendering: boolean;
}
```

**Add to ChartAction type**:
```typescript
type ChartAction =
  | { type: 'SET_AXIS_CONFIG'; config: Partial<AxisConfiguration> }
  | { type: 'SET_RENDERING'; isRendering: boolean }
  | { type: 'RESET_VIEWPORT' }
  // ... existing actions
```

**Update initialState**:
```typescript
import { DEFAULT_AXIS_CONFIG } from '@/utils/constants/axis';

const initialState: ChartState = {
  // ... existing fields
  axisConfig: DEFAULT_AXIS_CONFIG,
  isRendering: false,
};
```

**Add reducer cases**:
```typescript
function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    // ... existing cases
    
    case 'SET_AXIS_CONFIG':
      return {
        ...state,
        axisConfig: { ...state.axisConfig, ...action.config },
        scales: null, // Invalidate scales to trigger rebuild
      };
    
    case 'SET_RENDERING':
      return { ...state, isRendering: action.isRendering };
    
    case 'RESET_VIEWPORT':
      return {
        ...state,
        viewport: state.viewport ? {
          ...state.viewport,
          translateX: 0,
          translateY: 0,
          scale: 1,
        } : null,
      };
    
    default:
      return state;
  }
}
```

**Why**: Extends Context to manage axis configuration state.

---

## Step 4: Create AxisSelector Component (15 min)

Create `/src/components/AxisSelector.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useChartState, useChartDispatch } from '@/contexts/ChartContext';
import { DATA_PROPERTY_NAMES, parsePropertyLabel } from '@/utils/constants/axis';
import type { DataPropertyName } from '@/types/state';

interface AxisSelectorProps {
  axis: 'x' | 'y';
  label?: string;
  className?: string;
}

export default function AxisSelector({ axis, label, className }: AxisSelectorProps) {
  const { axisConfig, isRendering, polygons } = useChartState();
  const dispatch = useChartDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingProperty, setPendingProperty] = useState<DataPropertyName | null>(null);
  
  const currentProperty = axis === 'x' ? axisConfig.xProperty : axisConfig.yProperty;
  const oppositeProperty = axis === 'x' ? axisConfig.yProperty : axisConfig.xProperty;
  const helperText = label || (axis === 'x' ? 'X-Axis' : 'Y-Axis');
  const fieldLabel = 'x-axis || y-axis';
  
  // Filter options: exclude opposite axis selection
  const availableOptions = DATA_PROPERTY_NAMES.filter(prop => prop !== oppositeProperty);
  
  const handleChange = (event: any) => {
    const newProperty = event.target.value as DataPropertyName;
    
    // If polygons exist, show confirmation dialog
    if (polygons.length > 0) {
      setPendingProperty(newProperty);
      setDialogOpen(true);
    } else {
      applyAxisChange(newProperty);
    }
  };
  
  const applyAxisChange = (newProperty: DataPropertyName) => {
    const { marker, unit } = parsePropertyLabel(newProperty);
    
    dispatch({
      type: 'SET_AXIS_CONFIG',
      config: axis === 'x'
        ? { xProperty: newProperty, xLabel: newProperty, xUnit: unit }
        : { yProperty: newProperty, yLabel: newProperty, yUnit: unit }
    });
  };
  
  const handleKeepPolygons = () => {
    if (pendingProperty) {
      applyAxisChange(pendingProperty);
    }
    setDialogOpen(false);
    setPendingProperty(null);
  };
  
  const handleRemovePolygons = () => {
    dispatch({ type: 'SET_POLYGONS', polygons: [] });
    if (pendingProperty) {
      applyAxisChange(pendingProperty);
    }
    setDialogOpen(false);
    setPendingProperty(null);
  };
  
  const handleDialogClose = () => {
    // Cancel axis change if user dismisses dialog
    setDialogOpen(false);
    setPendingProperty(null);
  };
  
  return (
    <>
      <FormControl fullWidth disabled={isRendering} className={className}>
        <InputLabel>{helperText}</InputLabel>
        <Select
          value={currentProperty}
          onChange={handleChange}
          label={helperText}
        >
          {availableOptions.map(prop => (
            <MenuItem key={prop} value={prop}>
              {prop}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{fieldLabel}</FormHelperText>
      </FormControl>
      
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Keep existing polygons?</DialogTitle>
        <DialogContent>
          Changing axes will reposition data points. Keep polygons in current screen positions?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemovePolygons}>Remove</Button>
          <Button onClick={handleKeepPolygons} variant="contained">Keep</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
```

**Why**: Provides UI for axis selection with polygon retention confirmation.

---

## Step 5: Add to Sidebar (5 min)

Edit `/src/components/Sidebar.tsx`:

```typescript
import AxisSelector from './AxisSelector';

export default function Sidebar() {
  // ... existing code
  
  return (
    <div className={styles.sidebar}>
      {/* Add axis selectors at top */}
      <AxisSelector axis="x" />
      <AxisSelector axis="y" />
      
      {/* Existing polygon list and stats */}
      {/* ... */}
    </div>
  );
}
```

**Why**: Integrates axis selection into existing sidebar UI.

---

## Step 6: Update Chart Component (10 min)

Edit `/src/components/Chart.tsx`:

**Update scale creation to use axisConfig**:

```typescript
import { isValidDataPoint } from '@/utils/data/validateData';

// In Chart component
const { data, axisConfig, scales, isRendering } = useChartState();

// Rebuild scales when axis changes
useEffect(() => {
  if (!data.length) return;
  
  // Filter valid data for selected axes
  const validData = data.filter(d => 
    isValidDataPoint(d, axisConfig.xProperty, axisConfig.yProperty)
  );
  
  if (validData.length === 0) {
    console.warn('No valid data points for selected axes');
    return;
  }
  
  // Calculate domains
  const xExtent = d3.extent(validData, d => d[axisConfig.xProperty]) as [number, number];
  const yExtent = d3.extent(validData, d => d[axisConfig.yProperty]) as [number, number];
  
  // Create scales
  const xScale = d3.scaleLinear()
    .domain(xExtent)
    .range([0, innerWidth])
    .nice();
  
  const yScale = d3.scaleLinear()
    .domain(yExtent)
    .range([innerHeight, 0])
    .nice();
  
  dispatch({ type: 'SET_SCALES', scales: { xScale, yScale } });
  dispatch({ type: 'RESET_VIEWPORT' });
  
}, [data, axisConfig.xProperty, axisConfig.yProperty, innerWidth, innerHeight, dispatch]);

// Wrap rendering in SET_RENDERING actions
useEffect(() => {
  if (!scales) return;
  
  dispatch({ type: 'SET_RENDERING', isRendering: true });
  
  // ... existing render logic
  
  requestAnimationFrame(() => {
    dispatch({ type: 'SET_RENDERING', isRendering: false });
  });
}, [scales, data, dispatch]);
```

**Update axis labels**:

```typescript
// Update x-axis label
d3.select('.x-axis-label')
  .text(axisConfig.xUnit ? `${axisConfig.xLabel} (${axisConfig.xUnit})` : axisConfig.xLabel);

// Update y-axis label
d3.select('.y-axis-label')
  .text(axisConfig.yUnit ? `${axisConfig.yLabel} (${axisConfig.yUnit})` : axisConfig.yLabel);
```

**Why**: Makes chart respond to axis configuration changes.

---

## Step 7: Add Data Validation Utility (5 min)

Create `/src/utils/data/validateData.ts`:

```typescript
import type { CellData } from './loadCsvData';
import type { DataPropertyName } from '@/types/state';

export const isValidDataPoint = (
  d: CellData,
  xProp: DataPropertyName,
  yProp: DataPropertyName
): boolean => {
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
};
```

**Why**: Filters out invalid data points per FR-013.

---

## Step 8: Add UnitScaleControl Component (10 min)

Create `/src/components/UnitScaleControl.tsx`:

```typescript
'use client';

import { Slider, Typography, Box } from '@mui/material';
import { useChartState, useChartDispatch } from '@/contexts/ChartContext';

export default function UnitScaleControl() {
  const { axisConfig, isRendering } = useChartState();
  const dispatch = useChartDispatch();
  
  const handleChange = (_: Event, value: number | number[]) => {
    // Update local state during drag (optional, for preview)
  };
  
  const handleChangeCommitted = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    dispatch({
      type: 'SET_AXIS_CONFIG',
      config: { unitScale: value as number }
    });
  };
  
  return (
    <Box sx={{ width: '100%', px: 2 }}>
      <Typography gutterBottom>Measurement Unit Scale</Typography>
      <Slider
        value={axisConfig.unitScale}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
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
    </Box>
  );
}
```

Add to Sidebar:
```typescript
import UnitScaleControl from './UnitScaleControl';

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <AxisSelector axis="x" />
      <AxisSelector axis="y" />
      <UnitScaleControl />
      {/* ... existing polygon list */}
    </div>
  );
}
```

**Reference**: [MUI Slider Example](https://codesandbox.io/embed/7tvlj7?module=/src/Demo.tsx)

---

## Step 9: Add Global Loading Component (15 min)

Create `/src/contexts/GlobalContext.tsx`:

```typescript
'use client';

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
    </GlobalContext.Provider>
  );
}

export const useGlobalState = () => useContext(GlobalContext);
export const useGlobalDispatch = () => {
  const dispatch = useContext(GlobalDispatchContext);
  if (!dispatch) throw new Error('useGlobalDispatch must be used within GlobalProvider');
  return dispatch;
};
```

Create `/src/components/Loading.tsx`:

```typescript
'use client';

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

Create `/src/styles/Loading.module.css`:

```css
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

.message {
  color: white;
  margin-top: 16px;
  font-size: 14px;
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

Update `/src/app/layout.tsx`:

```typescript
'use client';

import { GlobalProvider, useGlobalState } from '@/contexts/GlobalContext';
import { ChartProvider } from '@/contexts/ChartContext';
import Loading from '@/components/Loading';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isLoading, loadingMessage } = useGlobalState();
  
  return (
    <>
      {isLoading && <Loading message={loadingMessage} />}
      {children}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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

**Reference**: [Plant Circles Animation](https://codepen.io/esdesignstudio/pen/RwQdEZb)

**Usage Example**:
```typescript
// In Chart component during axis change
const updateGlobal = useGlobalDispatch();

updateGlobal({ isLoading: true, loadingMessage: 'Updating chart axes...' });
// ... perform axis change
updateGlobal({ isLoading: false });
```

---

## Step 10: Update Chart to Use Global Loading (5 min)

Edit `/src/components/Chart.tsx`:

```typescript
import { useGlobalDispatch } from '@/contexts/GlobalContext';

export default function Chart({ width, height }: ChartProps) {
  const updateGlobal = useGlobalDispatch();
  
  // In axis change effect
  useEffect(() => {
    if (!scales) return;
    
    updateGlobal({ isLoading: true, loadingMessage: 'Rendering chart...' });
    dispatch({ type: 'SET_RENDERING', isRendering: true });
    
    // ... existing render logic
    
    requestAnimationFrame(() => {
      dispatch({ type: 'SET_RENDERING', isRendering: false });
      updateGlobal({ isLoading: false });
    });
  }, [scales, data, dispatch, updateGlobal]);
}
```

**Why**: Provides global loading feedback during chart operations.

---

## Testing Your Implementation

### Manual Test 1: Change X-Axis
1. Open chart in browser
2. Click X-Axis dropdown in sidebar
3. Select "Kappa-FITC"
4. ✓ Chart re-renders with new x-axis
5. ✓ X-axis label shows "Kappa-FITC (FITC)"
6. ✓ Dropdown disabled during render (grayed out briefly)

### Manual Test 2: Polygon Retention
1. Draw a polygon on chart
2. Change Y-Axis to "Lambda-PE"
3. ✓ Confirmation dialog appears
4. Click "Keep"
5. ✓ Polygon remains visible
6. ✓ Polygon stats recalculate
7. ✓ Chart re-renders with new y-axis

### Manual Test 3: Opposite Axis Filtering
1. Select "CD45-KrO" for x-axis
2. Open y-axis dropdown
3. ✓ "CD45-KrO" is NOT in the list
4. Select "CD10-ECD" for y-axis
5. Open x-axis dropdown
6. ✓ "CD10-ECD" is NOT in the list
7. ✓ "CD45-KrO" is back in the list

### Manual Test 4: Unit Scale Control
1. Locate the Measurement Unit Scale slider in sidebar
2. Drag slider to 500
3. ✓ Chart axes update to show compressed scale
4. Drag slider to 2000
5. ✓ Chart axes update to show expanded scale
6. ✓ Slider disabled during rendering

### Manual Test 5: Global Loading Component
1. Change x-axis property
2. ✓ Plant circles loading animation appears
3. ✓ Loading message shows "Rendering chart..."
4. ✓ Loading disappears after chart renders (~500ms)
5. ✓ Loading overlay blocks interaction during render

---

## Common Issues

### Issue: Dropdown doesn't update chart
**Fix**: Check that `SET_AXIS_CONFIG` action is dispatched and reducer updates state

### Issue: Chart shows empty after axis change
**Fix**: Verify data filtering logic - you may have filtered out all data points

### Issue: TypeScript error on data[axisConfig.xProperty]
**Fix**: Ensure DataPropertyName type matches CSV column names exactly (case-sensitive)

### Issue: Scales not rebuilding
**Fix**: Ensure `scales: null` is set in SET_AXIS_CONFIG reducer case

### Issue: Loading animation doesn't appear
**Fix**: Verify GlobalProvider wraps ChartProvider in layout.tsx and AppContent uses useGlobalState

### Issue: Unit scale slider doesn't update chart
**Fix**: Check that onChangeCommitted dispatches SET_AXIS_CONFIG and Chart rebuilds scales on axisConfig.unitScale change

---

## Next Steps

1. **Add unit scale slider** (FR-011a): Follow similar pattern as AxisSelector
2. **Add loading indicators on polygons** (FR-008a): Show spinner during stats recalc
3. **Optimize rendering** (FR-003): Batch state updates, memoize expensive calculations
4. **Add error handling**: Catch D3 scale errors, show user-friendly messages

---

## File Checklist

Created/modified files:
- ✓ `/src/utils/constants/axis.ts` (new)
- ✓ `/src/types/state.d.ts` (modified)
- ✓ `/src/contexts/ChartContext.tsx` (modified)
- ✓ `/src/components/AxisSelector.tsx` (new)
- ✓ `/src/components/Sidebar.tsx` (modified)
- ✓ `/src/components/Chart.tsx` (modified)
- ✓ `/src/utils/data/validateData.ts` (new)

**Total time**: ~45 minutes (including testing)

---

## Getting Help

- **Contracts**: See `/specs/005-dynamic-axis/contracts/` for detailed API specifications
- **Data Model**: See `/specs/005-dynamic-axis/data-model.md` for entity definitions
- **Research**: See `/specs/005-dynamic-axis/research.md` for implementation patterns
- **Constitution**: See `.specify/memory/constitution.md` for project principles

**Question?** Check existing implementation patterns in completed features (001-upgrade-dependencies, 002-canvas-rendering, 003-refactor-codebase).
