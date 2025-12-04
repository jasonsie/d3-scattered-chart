# Feature Specification: Dynamic Axis Selection

**Feature Branch**: `005-dynamic-axis`  
**Created**: 2025-12-03  
**Status**: Draft  
**Input**: User description: "Dynamic axis selection feature allowing users to change x-axis and y-axis from sidebar"

## Clarifications

### Session 2025-12-03

- Q: What helper text should appear above the x-axis and y-axis dropdown fields? → A: "X-Axis" and "Y-Axis"
- Q: What label (field label) should appear below each dropdown field? → A: "x-axis || y-axis" format to indicate the axis being configured
- Q: How should the dropdown options be organized/ordered? → A: Order as they appear in the CSV file
- Q: What should happen to existing drawn polygons when a user changes the axis selection? → A: Ask user to confirm - "Keep existing polygons?"
- Q: Should the same property be selectable for both x-axis and y-axis simultaneously? → A: No - once an item is selected from x-dropdown, it should be removed from y-dropdown, and vice versa
- Q: How should measurement unit scaling be controlled? → A: Via sidebar range control from 100 to 2000, with default value of 1000
- Q: When should the confirmation dialog appear? → A: After dropdown selection but before chart re-renders (user sees selection, then confirms)
- Q: How should the system indicate to the user that polygon statistics are being recalculated? → A: Show a loading indicator on each polygon while statistics recalculate
- Q: Should zoom and pan transformations be preserved when axes change? → A: Always reset zoom/pan to show full data extent in new axis coordinate system
- Q: How should data points with missing/invalid values in selected axis properties be handled? → A: Filter out (exclude from rendering) data points with missing/invalid values
- Q: How should the system prevent issues when users interact with dropdowns during chart rendering? → A: Disable dropdown menus during chart rendering (re-enable when complete)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Different Axes for Visualization (Priority: P1)

A researcher analyzing flow cytometry data wants to examine the relationship between different cellular markers. They need to dynamically select which data properties appear on the x-axis and y-axis to explore various correlations without reloading data or creating multiple chart instances.

**Why this priority**: This is the core functionality that delivers immediate value. Users can explore their data from different perspectives, which is essential for scientific analysis and pattern discovery in multi-dimensional datasets.

**Independent Test**: Can be fully tested by opening the sidebar, selecting different properties from dropdown menus for x and y axes, and verifying the chart re-renders with the selected axes. Delivers value by enabling data exploration without requiring any other features.

**Acceptance Scenarios**:

1. **Given** the chart is displaying data with default axes (CD45-KrO on x-axis, SS INT LIN on y-axis), **When** the user selects "Kappa-FITC" from the x-axis dropdown, **Then** the chart re-renders with Kappa-FITC values on the x-axis and all data points are repositioned accordingly
2. **Given** the chart is displaying any data, **When** the user selects "Lambda-PE" from the y-axis dropdown, **Then** the chart re-renders with Lambda-PE values on the y-axis and all data points are repositioned accordingly
3. **Given** the user has selected custom axes, **When** they select different properties for both x and y axes simultaneously, **Then** the chart updates to reflect both new axes in a single re-render
4. **Given** the user has selected "CD45-KrO" for the x-axis, **When** they open the y-axis dropdown, **Then** "CD45-KrO" is not available as an option in the y-axis dropdown
5. **Given** the user has selected "SS INT LIN" for the y-axis, **When** they open the x-axis dropdown, **Then** "SS INT LIN" is not available as an option in the x-axis dropdown
6. **Given** the user changes x-axis from "CD45-KrO" to "Kappa-FITC", **When** they open the y-axis dropdown, **Then** "CD45-KrO" becomes available again and "Kappa-FITC" is removed from the y-axis options
7. **Given** the chart has existing polygons drawn, **When** the user changes either axis, **Then** the system prompts the user to confirm whether to keep existing polygons before applying the axis change
8. **Given** the user confirms to keep polygons after changing axes, **When** the chart re-renders, **Then** the polygons remain in their screen positions and statistics are recalculated based on which data points fall within them in the new coordinate system
9. **Given** the user chooses not to keep polygons after changing axes, **When** the chart re-renders, **Then** all existing polygons are removed from the chart

---

### User Story 2 - Understand Current Axis Configuration (Priority: P2)

A user needs to know which data properties are currently being visualized on each axis to properly interpret the chart and communicate findings to colleagues.

**Why this priority**: Clear labeling is essential for data interpretation but secondary to the ability to change axes. Users can still explore data without perfect labels, but cannot explore without axis selection.

**Independent Test**: Can be tested by verifying that axis labels update when axes are changed, and that labels are clearly visible on the chart. Delivers value by preventing misinterpretation of data.

**Acceptance Scenarios**:

1. **Given** the user has selected "CD10-ECD" for the x-axis, **When** the chart renders, **Then** the x-axis label displays "CD10-ECD"
2. **Given** the user has selected "CD5-PC5.5" for the y-axis, **When** the chart renders, **Then** the y-axis label displays "CD5-PC5.5"
3. **Given** the user changes axes multiple times, **When** viewing the chart, **Then** the axis labels always match the currently selected properties

---

### User Story 3 - Control Measurement Unit Scaling (Priority: P3)

A researcher needs to adjust the scale of measurement units on the axes to better visualize data patterns at different zoom levels or to match specific analysis requirements.

**Why this priority**: While important for detailed analysis and customization, users can still explore and interpret data with default scaling. This is an enhancement to the core axis selection functionality.

**Independent Test**: Can be tested by adjusting the measurement unit range control in the sidebar and verifying that axis scales update accordingly. Delivers value by providing flexibility in data visualization scale.

**Acceptance Scenarios**:

1. **Given** the chart is displaying data with default measurement unit scale (1000), **When** the user adjusts the measurement unit control to 500, **Then** the axis scales update to reflect the new unit measurement
2. **Given** the user is viewing the chart, **When** they adjust the measurement unit control from 100 to 2000, **Then** the chart re-renders smoothly showing the full range of scaling options
3. **Given** the measurement unit control is set to any value, **When** the user changes the axis property selection, **Then** the measurement unit setting is preserved and applied to the new axis

---

### Edge Cases

- What happens when a user selects the same property for both x-axis and y-axis? (This is prevented - the selected property in one dropdown is automatically removed from the other dropdown's options)
- How does the system handle data properties with extreme value ranges (e.g., values from 0-100 vs 0-10000)? (D3 scales should automatically adjust domains and ranges to fit all data)
- What happens to polygon selection statistics when axes change? (User is prompted to confirm whether to keep polygons; if kept, polygon screen positions remain fixed but the data points they contain may change as points are repositioned in the new coordinate system)
- How does the chart handle missing or invalid data values in the selected properties? (Data points with missing or invalid values (null, undefined, NaN, non-numeric) are excluded from rendering)
- What happens when dropdown menus are interacted with while the chart is rendering? (Dropdown menus are disabled during chart rendering to prevent race conditions and state conflicts, and re-enabled when rendering completes)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide dropdown menus in the sidebar with helper text "X-Axis" (above x-axis dropdown) and "Y-Axis" (above y-axis dropdown) for selecting axis properties
- **FR-002**: System MUST populate dropdown menus with all available numeric data properties from the loaded dataset in the order they appear in the CSV file (FS INT LIN, SS INT LIN, Kappa-FITC, Lambda-PE, CD10-ECD, CD5-PC5.5, CD200-PC7, CD34-APC, CD38-APC-A700, CD20-APC-A750, CD19-PB, CD45-KrO, TIME, FS PEAK LIN, SS PEAK LIN)
- **FR-002a**: System MUST display a label (field label) below each dropdown in the format "x-axis || y-axis" to indicate the axis being configured
- **FR-002b**: System MUST exclude the currently selected x-axis property from the y-axis dropdown options, and exclude the currently selected y-axis property from the x-axis dropdown options
- **FR-003**: System MUST display the currently selected axis properties as the default values in the dropdown menus
- **FR-004**: System MUST re-render the chart when either x-axis or y-axis selection changes
- **FR-005**: System MUST update D3 scale domains based on the min/max values of the selected data properties
- **FR-006**: System MUST reposition all data points according to the new axis selections
- **FR-007**: System MUST prompt user with a confirmation dialog asking "Keep existing polygons?" after dropdown selection is made but before chart re-renders, when polygons exist on the chart
- **FR-007a**: System MUST maintain existing polygons in their screen coordinates when user confirms to keep them after axis change
- **FR-007b**: System MUST remove all existing polygons when user chooses not to keep them after axis change
- **FR-008**: System MUST recalculate polygon statistics (point counts and percentages) based on which data points fall within polygons after axis change
- **FR-008a**: System MUST display a loading indicator on each polygon while its statistics are being recalculated
- **FR-009**: System MUST update the x-axis label to display the name of the selected x-axis property
- **FR-010**: System MUST update the y-axis label to display the name of the selected y-axis property
- **FR-011**: System MUST display measurement units on axis labels where applicable
- **FR-011a**: System MUST provide a range control in the sidebar for adjusting measurement unit scaling from 100 to 2000
- **FR-011b**: System MUST set the default measurement unit scale to 1000 when the chart is first loaded
- **FR-011c**: System MUST update axis scales and re-render the chart when the measurement unit control value changes
- **FR-012**: System MUST reset zoom and pan transformations to show the full data extent when axes are changed
- **FR-013**: System MUST exclude data points with missing or invalid values (null, undefined, NaN, non-numeric) in the selected axis properties from rendering
- **FR-014**: System MUST disable axis dropdown menus while chart is rendering and re-enable them when rendering completes

### Key Entities

- **Axis Configuration**: Represents the current x and y axis selections
  - xProperty: The name of the data property mapped to the x-axis
  - yProperty: The name of the data property mapped to the y-axis
  - xLabel: Display label for x-axis
  - yLabel: Display label for y-axis
  - xUnit: Unit of measurement for x-axis (may be empty string if dimensionless)
  - yUnit: Unit of measurement for y-axis (may be empty string if dimensionless)
  - unitScale: Numeric value controlling measurement unit scaling (100-2000, default 1000)

- **Data Property Metadata**: Information about available data columns
  - propertyName: Column name from CSV (e.g., "CD45-KrO")
  - displayLabel: Human-readable label for UI
  - unit: Measurement unit (e.g., "INT LIN" for intensity values, empty for dimensionless)
  - dataType: Numeric (all properties in this dataset are numeric)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select and change x-axis property from a dropdown menu containing all available numeric data properties
- **SC-002**: Users can select and change y-axis property from a dropdown menu containing all available numeric data properties
- **SC-003**: Chart completely re-renders within 500ms of axis selection change for datasets up to 100,000 data points
- **SC-004**: All data points are correctly repositioned according to new axis values with 100% accuracy
- **SC-005**: Axis labels update immediately and correctly match the selected properties in 100% of cases
- **SC-006**: Users are prompted to confirm keeping or removing existing polygons when axes change, and the system correctly maintains or clears polygons based on user choice
- **SC-007**: Polygon statistics (counts and percentages) are recalculated correctly based on the new axis coordinate system
- **SC-008**: Users can explore all valid axis combinations (15 properties × 14 remaining properties = 210 combinations, excluding same property on both axes) without errors or crashes
- **SC-009**: The interface remains responsive during axis changes (no UI freezing or lag perceptible to users)
- **SC-010**: Users can adjust measurement unit scaling from 100 to 2000 via sidebar range control, and the chart updates accordingly within 500ms

## Assumptions

- The CSV data file contains only numeric values for all properties (non-numeric columns like labels or categories are not present in CD45_pos.csv)
- Default axes remain CD45-KrO (x-axis) and SS INT LIN (y-axis) when the feature is first loaded
- Dropdown menus are placed in the sidebar component alongside existing polygon controls
- A measurement unit range control (slider or numeric input) is placed in the sidebar near the axis dropdown controls
- Measurement unit scaling applies uniformly to both axes (not independently controllable per axis)
- Each dropdown has helper text above it ("X-Axis" or "Y-Axis") and a label (field label) below it ("x-axis || y-axis" format)
- Dropdown options are ordered exactly as they appear in the CSV file header
- All data properties use similar measurement scales (fluorescence intensity values); no logarithmic scale transformations are required initially
- Property names from the CSV headers are suitable for display in dropdown menus without additional formatting
- Confirmation dialog for polygon retention is a simple modal with "Keep" and "Remove" options (or equivalent yes/no choice)
- Unit labels can be derived from property name suffixes (e.g., "INT LIN" indicates intensity linear scale)
- The feature does not require saving or persisting axis selections across sessions (resets to defaults on page reload)
- Chart dimensions and margins remain constant when axes change (no responsive resizing based on label lengths)
