# Contract: D3 Scale Updates

**Purpose**: Define how D3 scales are rebuilt and applied when axis configuration changes

---

## Scale Lifecycle

### Creation Phase

**When**: On initial mount and after axis configuration change

**Inputs**:
- `data: CellData[]` - Full dataset from ChartContext
- `axisConfig.xProperty: DataPropertyName` - Selected x-axis property
- `axisConfig.yProperty: DataPropertyName` - Selected y-axis property
- `innerWidth: number` - Chart width minus margins
- `innerHeight: number` - Chart height minus margins

**Outputs**:
- `xScale: d3.ScaleLinear<number, number>` - X-axis scale
- `yScale: d3.ScaleLinear<number, number>` - Y-axis scale

---

### Scale Builder Function

**Signature**:
```typescript
const buildScales = (
  data: CellData[],
  xProperty: DataPropertyName,
  yProperty: DataPropertyName,
  width: number,
  height: number
): {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
} => {
  // Filter valid data points for selected axes
  const validData = data.filter(d => 
    isValidDataPoint(d, xProperty, yProperty)
  );
  
  // Calculate domains from data extents
  const xDomain = d3.extent(validData, d => d[xProperty]) as [number, number];
  const yDomain = d3.extent(validData, d => d[yProperty]) as [number, number];
  
  // Create linear scales
  const xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, width])
    .nice(); // Round domain to nice values
  
  const yScale = d3.scaleLinear()
    .domain(yDomain)
    .range([height, 0]) // Inverted for SVG coordinates
    .nice();
  
  return { xScale, yScale };
};
```

**Key Decisions**:
- **Data filtering**: Only valid points contribute to domain calculation (prevents NaN/null skewing scale)
- **nice()**: Round domain bounds to clean values (e.g., [0.23, 9.87] → [0, 10])
- **Y-axis inversion**: SVG coordinates have origin at top-left; y-axis scale inverts to match data space

---

### Scale Storage

**Location**: ChartContext state

**Structure**:
```typescript
scales: {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
} | null
```

**Invalidation**: Set to `null` when axis configuration changes (triggers rebuild)

**Update Pattern**:
```typescript
// In Chart component useEffect
useEffect(() => {
  if (!scales || axisConfigChanged) {
    const newScales = buildScales(
      data, 
      axisConfig.xProperty, 
      axisConfig.yProperty,
      innerWidth,
      innerHeight
    );
    dispatch({ type: 'SET_SCALES', scales: newScales });
  }
}, [data, axisConfig, innerWidth, innerHeight, scales, dispatch]);
```

---

## Scale Application

### Data Point Positioning

**Before (Hardcoded Axes)**:
```typescript
const xPos = xScale(dataPoint.x);  // Always CD45-KrO
const yPos = yScale(dataPoint.y);  // Always SS INT LIN
```

**After (Dynamic Axes)**:
```typescript
const xPos = xScale(dataPoint[axisConfig.xProperty]);
const yPos = yScale(dataPoint[axisConfig.yProperty]);
```

**Usage in Rendering**:
```typescript
// Canvas rendering
data.forEach(d => {
  const x = scales.xScale(d[axisConfig.xProperty]);
  const y = scales.yScale(d[axisConfig.yProperty]);
  ctx.fillRect(x - 2, y - 2, 4, 4); // Draw 4px square
});

// SVG rendering (axes)
const xAxis = d3.axisBottom(scales.xScale);
const yAxis = d3.axisLeft(scales.yScale);
```

---

### Axis Label Updates

**X-Axis Label**:
```typescript
const xAxisLabel = axisConfig.xUnit 
  ? `${axisConfig.xLabel} (${axisConfig.xUnit})`
  : axisConfig.xLabel;

// D3 selection to update label text
d3.select('.x-axis-label')
  .text(xAxisLabel);
```

**Y-Axis Label**:
```typescript
const yAxisLabel = axisConfig.yUnit
  ? `${axisConfig.yLabel} (${axisConfig.yUnit})`
  : axisConfig.yLabel;

d3.select('.y-axis-label')
  .text(yAxisLabel);
```

**Example Output**:
- X-axis: "CD45-KrO (KrO)" → becomes "CD45-KrO (KrO)"
- Y-axis: "SS INT LIN (INT LIN)" → becomes "SS INT LIN (INT LIN)"
- TIME axis: "TIME" → stays "TIME" (no unit)

---

## Measurement Unit Scaling

**Purpose**: Allow users to adjust the visible scale of measurement units (FR-011a)

**Range**: 100 to 2000, default 1000

**Application**: Multiply scale range by `unitScale / 1000`

**Modified Scale Builder**:
```typescript
const buildScalesWithUnitScale = (
  data: CellData[],
  xProperty: DataPropertyName,
  yProperty: DataPropertyName,
  width: number,
  height: number,
  unitScale: number
): { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> } => {
  const validData = data.filter(d => isValidDataPoint(d, xProperty, yProperty));
  
  const xDomain = d3.extent(validData, d => d[xProperty]) as [number, number];
  const yDomain = d3.extent(validData, d => d[yProperty]) as [number, number];
  
  // Apply unit scaling to domains
  const scaleFactor = unitScale / 1000;
  const xScaledDomain: [number, number] = [
    xDomain[0] * scaleFactor,
    xDomain[1] * scaleFactor
  ];
  const yScaledDomain: [number, number] = [
    yDomain[0] * scaleFactor,
    yDomain[1] * scaleFactor
  ];
  
  const xScale = d3.scaleLinear()
    .domain(xScaledDomain)
    .range([0, width])
    .nice();
  
  const yScale = d3.scaleLinear()
    .domain(yScaledDomain)
    .range([height, 0])
    .nice();
  
  return { xScale, yScale };
};
```

**Effect**:
- `unitScale = 500` → domain compressed by 0.5× → data appears zoomed in
- `unitScale = 1000` → no change (default)
- `unitScale = 2000` → domain expanded by 2× → data appears zoomed out

**Note**: This affects domain calculation, not data values themselves. Data points maintain their original values; only the visual scale changes.

---

## Polygon Coordinate Transformation

**Challenge**: Polygons stored in screen coordinates; data points move when scales change

**User Choice**:
1. **Keep polygons**: Polygon screen positions fixed, but contained data points may change
2. **Remove polygons**: Polygons deleted before axis change applied

### Keep Polygons Logic

**Polygon Screen Coordinates**: Unchanged
```typescript
polygon.points = [
  { x: 100, y: 200 },  // Screen pixels (unchanged)
  { x: 150, y: 250 },
  // ...
];
```

**Data Point Positions**: Recalculated
```typescript
// Old axes (CD45-KrO x SS INT LIN)
const oldXPos = oldXScale(dataPoint['CD45-KrO']); // e.g., 100px
const oldYPos = oldYScale(dataPoint['SS INT LIN']); // e.g., 200px

// New axes (Kappa-FITC x Lambda-PE)
const newXPos = newXScale(dataPoint['Kappa-FITC']); // e.g., 300px (different!)
const newYPos = newYScale(dataPoint['Lambda-PE']); // e.g., 400px (different!)
```

**Point-in-Polygon Test**: Use unchanged polygon screen coordinates against new data point screen positions

```typescript
const isPointInPolygon = (dataPoint: CellData, polygon: Polygon, scales: Scales, axisConfig: AxisConfiguration): boolean => {
  const x = scales.xScale(dataPoint[axisConfig.xProperty]);
  const y = scales.yScale(dataPoint[axisConfig.yProperty]);
  const testPoint: [number, number] = [x, y];
  
  const polygonPath = polygon.points.map(p => [p.x, p.y] as [number, number]);
  return d3.polygonContains(polygonPath, testPoint);
};
```

**Statistics Recalculation**:
```typescript
const recalculatePolygonStats = (polygon: Polygon, data: CellData[], scales: Scales, axisConfig: AxisConfiguration) => {
  const containedPoints = data.filter(d => 
    isPointInPolygon(d, polygon, scales, axisConfig)
  );
  
  return {
    count: containedPoints.length,
    percentage: (containedPoints.length / data.length) * 100,
  };
};
```

**Loading Indicator**: Display on polygon while stats recalculate (FR-008a)

---

## Edge Cases

### Empty Data After Filtering

**Scenario**: All data points have invalid values for selected axes

**Handling**:
```typescript
if (validData.length === 0) {
  // Fallback to default domain [0, 1]
  return {
    xScale: d3.scaleLinear().domain([0, 1]).range([0, width]),
    yScale: d3.scaleLinear().domain([0, 1]).range([height, 0]),
  };
}
```

**Effect**: Chart renders empty (no data points), axes show [0, 1] range

---

### Single Data Point

**Scenario**: Only one valid data point for selected axes

**Handling**: D3 `extent()` returns [value, value] → domain is zero-width

**Solution**: Add padding to domain
```typescript
if (xDomain[0] === xDomain[1]) {
  xDomain = [xDomain[0] - 1, xDomain[1] + 1];
}
if (yDomain[0] === yDomain[1]) {
  yDomain = [yDomain[0] - 1, yDomain[1] + 1];
}
```

---

### Extreme Value Ranges

**Scenario**: One axis has range [0, 100], other has range [0, 10000]

**Handling**: D3 `nice()` independently rounds each axis domain → different tick spacing

**Effect**: 
- X-axis might show ticks: [0, 20, 40, 60, 80, 100]
- Y-axis might show ticks: [0, 2000, 4000, 6000, 8000, 10000]

**Acceptable**: Each axis scales independently; no normalization needed

---

## Performance Contracts

### Scale Rebuild Time
- **d3.extent()**: O(n) where n = data point count → ~2ms for 10k points
- **d3.scaleLinear()**: O(1) → <1ms
- **nice()**: O(1) → <1ms
- **Total per axis**: ~2ms
- **Both axes**: ~4ms

### Scale Application Time
- **Per data point**: O(1) → <0.001ms per point
- **10k points**: ~10ms total for coordinate transformation
- **Bottleneck**: Canvas rendering (50-100ms), not scale application

### Memory Overhead
- **Scale object size**: ~1KB per scale
- **Both scales**: ~2KB (negligible)
- **Cached in Context**: No per-component duplication

**Total overhead from scale management**: <5ms (well within 500ms budget)

---

## Testing Contract

### Unit Tests (Optional)

**Scale Creation**:
- ✓ Builds scales with correct domain from data extents
- ✓ Applies nice() to round domain bounds
- ✓ Y-scale range is inverted [height, 0]

**Data Filtering**:
- ✓ Excludes null values from domain calculation
- ✓ Excludes NaN values from domain calculation
- ✓ Handles empty data gracefully

**Unit Scaling**:
- ✓ unitScale 1000 → no domain change
- ✓ unitScale 500 → domain compressed by 0.5×
- ✓ unitScale 2000 → domain expanded by 2×

### Integration Tests (Optional)

**Axis Change Flow**:
- ✓ Changing x-axis property rebuilds xScale with new domain
- ✓ Changing y-axis property rebuilds yScale with new domain
- ✓ Data points repositioned correctly after scale update
- ✓ Axis labels update to match new property names
