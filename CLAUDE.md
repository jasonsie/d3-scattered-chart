# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D3.js-based data visualization application for the 2025 Data Visualization Challenge. It displays cell distribution data (CD45+) as an interactive scatter plot where users can create arbitrary polygons to select and analyze data points.

## Development Commands

```bash
# Install dependencies
yarn

# Run development server (uses Turbopack)
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linter
yarn lint
```

The development server runs at http://localhost:3000.

## Technology Stack

- **Framework**: Next.js 15.1.3 (App Router)
- **Visualization**: D3.js v7
- **UI Library**: Material-UI (MUI) v6
- **Styling**: CSS Modules
- **Language**: TypeScript
- **State Management**: React Context API with useReducer

## Architecture Overview

### State Management

The application uses a centralized Context API pattern with `ChartContext` (src/contexts/ChartContext.tsx):

- **ChartContext**: Provides read-only state to all components
- **ChartDispatchContext**: Provides the dispatch function for state updates
- **chartReducer**: Handles all state transitions through action types

Key state includes:
- `data`: Array of cell data points loaded from CSV
- `polygons`: Array of user-created polygon regions
- `currentPoints`: Points being drawn for new polygon
- `selectedPolygonId`: Array of currently selected polygon IDs
- `isDrawing`: Boolean tracking polygon drawing state
- `scales`: D3 scale functions (xScale, yScale) shared across components

### Component Structure

1. **page.tsx**: Root component wrapping everything in `ChartProvider`
2. **Chart.tsx**: Creates D3 scatter plot, manages SVG setup, axes, and data points
3. **Polygon.tsx**: Handles polygon drawing interactions, rendering, and selection
4. **Sidebar.tsx**: Displays polygon list with controls
5. **PopupEditor.tsx**: Modal for editing polygon properties

### D3 Integration Pattern

The app uses a hybrid React + D3 approach:

- React manages component lifecycle and state
- D3 handles DOM manipulation within SVG elements via refs
- D3 event handlers dispatch actions to update React state
- State changes trigger re-renders that update D3 visualizations

**Important**: The Chart component creates D3 scales and passes them to Polygon component. Scales are also stored in context via `SET_SCALES` action for use by other components.

### Data Flow

1. CSV data loads on mount in `ChartContext` (src/utils/data/loadCsvData.ts)
2. Chart component creates scatter plot using D3
3. User clicks to create polygon points (handled by Polygon component)
4. Points are tracked in context state (`currentPoints`)
5. On polygon completion, statistics are calculated (count, percentage of total points inside)
6. Completed polygon is added to `polygons` array in state
7. All components re-render with updated state
8. D3 visualizations update based on new state

### Polygon Selection Logic

- Points inside polygons are detected using `d3.polygonContains()`
- Polygon coordinates are in SVG space (transformed by D3 scales)
- Data points are transformed from data space to SVG space using xScale/yScale
- Multiple polygons can be selected (tracked in `selectedPolygonId` array)
- Selected polygons have visual highlighting (red stroke, increased stroke width)

### Key Files

- `src/contexts/ChartContext.tsx`: Central state management, defines all action types
- `src/components/Chart.tsx`: D3 scatter plot setup, scale creation (lines 47-48)
- `src/components/Polygon.tsx`: Interactive polygon drawing and rendering logic
- `src/utils/data/loadCsvData.ts`: CSV parsing (loads from `/public/data/CD45_pos.csv`)
- `src/types/global.d.ts`: Global type declarations for CSS modules

## Important Implementation Details

### Coordinate Systems

The application uses two coordinate systems:
1. **Data space**: Raw CSV values (CD45-KrO, SS INT LIN)
2. **SVG space**: Pixel coordinates after D3 scale transformation

Margins are applied via SVG transform (Chart.tsx:74), and polygon points are stored in SVG coordinates relative to the transformed group.

### Event Handling

Polygon drawing uses D3 event handlers attached to SVG:
- `mousedown`: Add points or complete polygon
- `mousemove`: Show preview line while drawing
- Click detection uses `d3.pointer()` to get coordinates relative to SVG group

Event propagation is carefully managed with `event.stopPropagation()` to prevent conflicts between polygon selection and drawing.

### Performance Considerations

The CSV file contains ~4800 data points. All points are rendered as circles, with colors dynamically calculated based on polygon membership (Chart.tsx:114-129).

### Styling

Uses CSS Modules for component-specific styles. Key style files:
- `src/styles/page.module.css`: Main layout and container styles
- `src/styles/Chart.module.css`: Chart-specific styles
- `src/styles/globals.css`: Global styles and resets
