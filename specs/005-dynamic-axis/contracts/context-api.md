# Contract: ChartContext API Extension

**Purpose**: Define state and action contracts for axis configuration management

---

## State Contract

### Extended ChartState

**Added Fields**:
```typescript
interface ChartState {
  // ... existing fields (data, polygons, scales, etc.)
  
  /**
   * Current axis configuration
   * @default DEFAULT_AXIS_CONFIG (CD45-KrO x-axis, SS INT LIN y-axis, scale 1000)
   */
  axisConfig: AxisConfiguration;
  
  /**
   * Flag indicating if chart is currently rendering
   * Used to disable axis dropdowns during render to prevent race conditions
   * @default false
   */
  isRendering: boolean;
}
```

**Backward Compatibility**: All existing fields remain unchanged. New fields are additive.

---

## Action Contracts

### SET_AXIS_CONFIG

**Purpose**: Update axis configuration (property selection or unit scale change)

**Action Shape**:
```typescript
{
  type: 'SET_AXIS_CONFIG';
  config: Partial<AxisConfiguration>;
}
```

**Parameters**:
- `config`: Partial axis configuration to merge with current state
  - Can update one or more fields of AxisConfiguration
  - Unspecified fields retain current values

**Examples**:
```typescript
// Change only x-axis property
dispatch({ 
  type: 'SET_AXIS_CONFIG', 
  config: { 
    xProperty: 'Kappa-FITC',
    xLabel: 'Kappa-FITC',
    xUnit: 'FITC'
  } 
});

// Change unit scale only
dispatch({ 
  type: 'SET_AXIS_CONFIG', 
  config: { unitScale: 1500 } 
});

// Change both axes simultaneously
dispatch({ 
  type: 'SET_AXIS_CONFIG', 
  config: { 
    xProperty: 'CD10-ECD',
    xLabel: 'CD10-ECD',
    xUnit: 'ECD',
    yProperty: 'CD5-PC5.5',
    yLabel: 'CD5-PC5.5',
    yUnit: 'PC5.5'
  } 
});
```

**Side Effects**:
- Invalidates `scales` (set to null) → triggers scale rebuild in Chart component
- Does NOT automatically trigger chart re-render (Chart component listens to state change)
- Does NOT validate xProperty !== yProperty (validation occurs in AxisSelector component)

**Invariants**:
- `axisConfig.xProperty` must be valid DataPropertyName
- `axisConfig.yProperty` must be valid DataPropertyName
- `axisConfig.unitScale` must be in range [100, 2000]

---

### SET_RENDERING

**Purpose**: Control dropdown enabled/disabled state during chart rendering

**Action Shape**:
```typescript
{
  type: 'SET_RENDERING';
  isRendering: boolean;
}
```

**Parameters**:
- `isRendering`: true to disable dropdowns, false to enable

**Usage Pattern**:
```typescript
// At start of axis change render
dispatch({ type: 'SET_RENDERING', isRendering: true });

// After render completes
dispatch({ type: 'SET_RENDERING', isRendering: false });
```

**Purpose**: Implements FR-014 (disable dropdowns during rendering)

---

### RESET_VIEWPORT

**Purpose**: Reset zoom and pan to show full data extent

**Action Shape**:
```typescript
{
  type: 'RESET_VIEWPORT';
}
```

**Parameters**: None

**Side Effects**:
- Resets `viewport.translateX` to 0
- Resets `viewport.translateY` to 0
- Resets `viewport.scale` to 1

**When Used**: After axis change to show full extent of data in new coordinate system

---

## Reducer Behavior

### SET_AXIS_CONFIG Handler

```typescript
case 'SET_AXIS_CONFIG':
  return {
    ...state,
    axisConfig: {
      ...state.axisConfig,
      ...action.config,
    },
    // Invalidate scales to trigger rebuild
    scales: null,
  };
```

**Guarantees**:
- Partial update: Only specified fields in `action.config` are changed
- Immutable: Returns new state object
- Scale invalidation: Setting scales to null signals Chart component to rebuild

---

### SET_RENDERING Handler

```typescript
case 'SET_RENDERING':
  return { 
    ...state, 
    isRendering: action.isRendering 
  };
```

**Guarantees**:
- Simple flag toggle
- No side effects on other state

---

### RESET_VIEWPORT Handler

```typescript
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
```

**Guarantees**:
- Preserves viewport object if exists
- Safe if viewport is null (no-op)

---

## Hook Contracts

### useChartState()

**Returns**: `ChartState` (extended with axisConfig and isRendering)

**Usage**:
```typescript
const { axisConfig, isRendering, scales, data } = useChartState();
```

**Consumer Components**:
- AxisSelector: Reads axisConfig for dropdown values, isRendering for disabled state
- Chart: Reads axisConfig to determine which properties to scale
- Sidebar: Reads axisConfig for displaying current axis labels

---

### useChartDispatch()

**Returns**: `Dispatch<ChartAction>` (includes new action types)

**Usage**:
```typescript
const dispatch = useChartDispatch();

// Dispatch axis change
dispatch({ 
  type: 'SET_AXIS_CONFIG', 
  config: { xProperty: 'Kappa-FITC', xLabel: 'Kappa-FITC', xUnit: 'FITC' } 
});

// Dispatch rendering state
dispatch({ type: 'SET_RENDERING', isRendering: true });
```

---

## State Transition Examples

### Example 1: User Changes X-Axis

**Initial State**:
```typescript
{
  axisConfig: {
    xProperty: 'CD45-KrO',
    yProperty: 'SS INT LIN',
    // ... other fields
  },
  scales: { xScale: [existing], yScale: [existing] },
  isRendering: false
}
```

**Actions**:
1. `SET_AXIS_CONFIG { xProperty: 'Kappa-FITC', xLabel: 'Kappa-FITC', xUnit: 'FITC' }`
2. `SET_RENDERING { isRendering: true }`
3. (Chart rebuilds scales internally)
4. `SET_SCALES { xScale: [new], yScale: [existing] }`
5. `RESET_VIEWPORT`
6. `SET_RENDERING { isRendering: false }`

**Final State**:
```typescript
{
  axisConfig: {
    xProperty: 'Kappa-FITC',
    yProperty: 'SS INT LIN',
    xLabel: 'Kappa-FITC',
    xUnit: 'FITC',
    // ... other fields preserved
  },
  scales: { xScale: [new], yScale: [new] },
  viewport: { translateX: 0, translateY: 0, scale: 1 },
  isRendering: false
}
```

---

### Example 2: User Changes Unit Scale

**Initial State**:
```typescript
{
  axisConfig: {
    // ... properties
    unitScale: 1000
  },
  isRendering: false
}
```

**Actions**:
1. `SET_AXIS_CONFIG { unitScale: 1500 }`
2. `SET_RENDERING { isRendering: true }`
3. (Chart applies new scale to axes)
4. `SET_RENDERING { isRendering: false }`

**Final State**:
```typescript
{
  axisConfig: {
    // ... properties unchanged
    unitScale: 1500
  },
  isRendering: false
}
```

---

## Error Handling

### Invalid Property Name

**Scenario**: Action dispatched with property not in DataPropertyName enum

**Handling**: 
- Validation occurs in AxisSelector component before dispatch (TypeScript compile-time safety)
- Runtime: If invalid property somehow dispatched, state accepts it but Chart component filters it out
- No crashes, degrades gracefully to previous valid state

### Concurrent Axis Changes

**Scenario**: User clicks dropdown while chart is rendering

**Handling**:
- `isRendering` flag disables dropdown (via `disabled` prop)
- User cannot trigger concurrent axis changes
- Race condition prevented at UI level per FR-014

### Scale Rebuild Failure

**Scenario**: D3 extent calculation fails (e.g., all data invalid for selected property)

**Handling**:
- Chart component catches error, logs warning
- Falls back to previous scales
- Displays error message to user (optional UX enhancement)

---

## Performance Contracts

### Action Dispatch Time
- SET_AXIS_CONFIG: <1ms (state merge only)
- SET_RENDERING: <1ms (boolean flag update)
- RESET_VIEWPORT: <1ms (object update)

### State Update Propagation
- Context provider re-render: <5ms
- Consumer component re-renders: <10ms total
- Full chart re-render (separate): <500ms (per SC-003)

**Total overhead from Context state change**: <20ms (negligible in 500ms budget)
