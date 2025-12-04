# Contract: AxisSelector Component API

**Purpose**: Define props and behavior for axis selection dropdown components

---

## Component Interface

### AxisSelector Component

**File**: `src/components/AxisSelector.tsx`

**Props**:
```typescript
interface AxisSelectorProps {
  /**
   * Which axis this selector controls ('x' or 'y')
   */
  axis: 'x' | 'y';
  
  /**
   * Optional: Override default label
   * @default 'X-Axis' for x, 'Y-Axis' for y
   */
  label?: string;
  
  /**
   * Optional: Custom styling class
   */
  className?: string;
}
```

**Return**: JSX.Element (Material-UI FormControl with Select)

---

## Behavior Contract

### Rendering

**Structure**:
```tsx
<FormControl fullWidth disabled={isRendering}>
  <InputLabel>{helperText}</InputLabel>
  <Select
    value={currentProperty}
    onChange={handleAxisChange}
    label={helperText}
  >
    {filteredOptions.map(prop => (
      <MenuItem key={prop} value={prop}>
        {displayLabel}
      </MenuItem>
    ))}
  </Select>
  <FormHelperText>{fieldLabel}</FormHelperText>
</FormControl>
```

**Helper Text (above dropdown)**:
- X-axis: "X-Axis"
- Y-axis: "Y-Axis"

**Field Label (below dropdown)**:
- X-axis: "x-axis || y-axis" (literal text per spec clarification)
- Y-axis: "x-axis || y-axis" (literal text per spec clarification)

**Dropdown Options**:
- All properties from `DATA_PROPERTY_NAMES` constant
- **Filtered**: Exclude the property selected in the opposite axis
- **Ordered**: Maintain CSV file order
- **Display**: Show full property name (e.g., "CD45-KrO", not abbreviated)

---

### Option Filtering Logic

**X-Axis Dropdown**:
```typescript
const xAxisOptions = DATA_PROPERTY_NAMES.filter(
  prop => prop !== axisConfig.yProperty
);
```

**Y-Axis Dropdown**:
```typescript
const yAxisOptions = DATA_PROPERTY_NAMES.filter(
  prop => prop !== axisConfig.xProperty
);
```

**Example**:
- Current state: xProperty = "CD45-KrO", yProperty = "SS INT LIN"
- X-axis dropdown: Shows all properties except "SS INT LIN" (14 options)
- Y-axis dropdown: Shows all properties except "CD45-KrO" (14 options)

**Dynamic Updates**:
- When user changes x-axis to "Kappa-FITC":
  - Y-axis dropdown removes "Kappa-FITC", adds "CD45-KrO" back
  - X-axis dropdown removes "SS INT LIN" (already excluded)

---

### Change Handler

**Signature**:
```typescript
const handleAxisChange = async (event: SelectChangeEvent<DataPropertyName>) => {
  const newProperty = event.target.value as DataPropertyName;
  
  // Check if polygons exist
  if (polygons.length > 0) {
    const keepPolygons = await showConfirmationDialog();
    if (!keepPolygons) {
      dispatch({ type: 'SET_POLYGONS', polygons: [] });
    }
  }
  
  // Update axis configuration
  const { marker, unit } = parsePropertyLabel(newProperty);
  dispatch({
    type: 'SET_AXIS_CONFIG',
    config: axis === 'x' 
      ? { xProperty: newProperty, xLabel: newProperty, xUnit: unit }
      : { yProperty: newProperty, yLabel: newProperty, yUnit: unit }
  });
};
```

**Steps**:
1. Extract selected property from event
2. If polygons exist, show confirmation dialog (FR-007)
3. If user chooses "Remove", dispatch SET_POLYGONS with empty array
4. Parse property label to extract unit
5. Dispatch SET_AXIS_CONFIG with updated property, label, and unit
6. Chart component handles rendering and scale updates

---

### Confirmation Dialog

**Trigger Condition**: `polygons.length > 0` when axis selection changes

**Dialog Content**:
- Title: "Keep existing polygons?"
- Message: "Changing axes will reposition data points. Keep polygons in current screen positions?"
- Actions:
  - "Remove" button (default/outlined)
  - "Keep" button (contained/primary)

**Implementation**:
```typescript
const showConfirmationDialog = (): Promise<boolean> => {
  return new Promise((resolve) => {
    setDialogOpen(true);
    setDialogResolver(() => resolve);
  });
};

const handleKeep = () => {
  dialogResolver?.(true);
  setDialogOpen(false);
};

const handleRemove = () => {
  dialogResolver?.(false);
  setDialogOpen(false);
};
```

**User Flow**:
1. User selects new axis from dropdown
2. Dropdown onChange fires
3. If polygons exist, dialog appears (blocks further execution)
4. User clicks "Keep" → returns true → axis changes, polygons preserved
5. User clicks "Remove" → returns false → polygons deleted, axis changes

---

### Disabled State

**Condition**: `isRendering === true` (from ChartContext)

**Effect**:
- FormControl `disabled` prop set to true
- Dropdown becomes non-interactive (grayed out)
- User cannot click or keyboard navigate

**When Disabled**:
- During chart re-render after axis change (SET_RENDERING dispatched by Chart)
- Prevents concurrent axis changes per FR-014

**Re-enable**:
- When Chart component completes render and dispatches SET_RENDERING(false)
- Typically 100-500ms after axis change initiated

---

## Integration Points

### With ChartContext

**Reads**:
- `axisConfig.xProperty` (for x-axis selector value)
- `axisConfig.yProperty` (for y-axis selector value)
- `isRendering` (for disabled state)
- `polygons` (for confirmation dialog trigger)

**Writes**:
- `SET_AXIS_CONFIG` action (on dropdown change)
- `SET_POLYGONS` action (if user chooses "Remove")

---

### With Sidebar Component

**Placement**: AxisSelector components rendered within Sidebar above polygon list

**Layout**:
```tsx
<Sidebar>
  <AxisSelector axis="x" />
  <AxisSelector axis="y" />
  <MeasurementUnitScaleControl />
  <Divider />
  <PolygonList />
  <StatisticsSummary />
</Sidebar>
```

**Spacing**: Material-UI spacing scale (2-3 units between controls)

---

## Accessibility

### Keyboard Navigation
- Tab: Focus dropdown
- Enter/Space: Open dropdown
- Arrow keys: Navigate options
- Enter: Select option
- Escape: Close dropdown

### Screen Readers
- FormControl provides ARIA label from InputLabel
- Select announces current value and option count
- FormHelperText provides additional context

### Focus Management
- Dropdown maintains focus during option navigation
- Focus returns to dropdown after selection
- Disabled state announced as "unavailable" or "disabled"

---

## Error States

### Invalid Property Selection

**Scenario**: User somehow selects invalid property (shouldn't happen with MUI Select)

**Handling**:
- TypeScript prevents at compile time (DataPropertyName type guard)
- Runtime: If invalid value reaches handler, log error and no-op
- Dropdown reverts to previous valid value

### Confirmation Dialog Dismissal

**Scenario**: User closes dialog without clicking button (e.g., clicks backdrop, presses Escape)

**Handling**:
- Treat as "Cancel" → do not change axis
- Dropdown value reverts to previous selection
- No state change dispatched

---

## Performance

### Render Performance
- Initial render: <10ms (15 options × simple MenuItem)
- Re-render on context change: <5ms (memoized filter logic)
- Dropdown open animation: 200ms (Material-UI default)

### State Update
- onChange event to dispatch: <1ms
- Dialog show/hide: <5ms (React state update)
- Total interaction latency: <50ms (well under 100ms target)

---

## Testing Contract

### Unit Tests (Optional)

**Dropdown Rendering**:
- ✓ Renders with correct helper text based on axis prop
- ✓ Shows all properties except opposite axis selection
- ✓ Current property value is selected in dropdown

**Option Filtering**:
- ✓ X-axis dropdown excludes current Y-axis property
- ✓ Y-axis dropdown excludes current X-axis property
- ✓ Options maintain CSV order

**Confirmation Dialog**:
- ✓ Dialog appears when polygons exist and axis changes
- ✓ "Keep" button preserves polygons
- ✓ "Remove" button clears polygons
- ✓ No dialog appears when no polygons exist

**Disabled State**:
- ✓ Dropdown disabled when isRendering is true
- ✓ Dropdown enabled when isRendering is false

### Integration Tests (Optional)

**Axis Change Flow**:
- ✓ User selects new x-axis → chart re-renders with new x-scale
- ✓ User selects new y-axis → chart re-renders with new y-scale
- ✓ User selects both axes → chart re-renders once with both scales

**Polygon Interaction**:
- ✓ Axis change with polygons → confirmation dialog → "Keep" → polygons preserved
- ✓ Axis change with polygons → confirmation dialog → "Remove" → polygons deleted
- ✓ Axis change without polygons → no dialog → chart updates immediately
