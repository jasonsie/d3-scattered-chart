# Quickstart: Responsive Layout Implementation

**Feature**: 001-responsive-layout
**Date**: 2025-12-04
**For**: Developers implementing the responsive layout feature

## Overview

This guide provides step-by-step instructions for implementing the responsive layout feature. Follow the sections in order to maintain consistency with the architecture decisions.

---

## Prerequisites

- Familiarity with React Context API and useReducer pattern
- Understanding of MUI v6 component library
- Knowledge of D3.js scale recalculation
- Access to project constitution and existing codebase

**Key Files to Review Before Starting**:
- `src/contexts/ChartContext.tsx` - Existing context structure
- `src/components/Chart.tsx` - Canvas rendering logic
- `src/components/Sidebar.tsx` - Sidebar component to be wrapped
- `CLAUDE.md` - Architecture overview

---

## Implementation Sequence

Follow this sequence to build incrementally testable features:

1. **Phase 1**: Context state extensions (30 min)
2. **Phase 2**: Viewport detection hook (45 min)
3. **Phase 3**: Mobile drawer component (30 min)
4. **Phase 4**: Floating action button (15 min)
5. **Phase 5**: Chart resize logic (60 min)
6. **Phase 6**: Sidebar responsive behavior (20 min)
7. **Phase 7**: Integration and testing (40 min)

**Total estimated time**: ~4 hours

---

## Phase 1: Context State Extensions

### Step 1.1: Add State Fields

**File**: `src/contexts/ChartContext.tsx`

```typescript
// Locate the ChartState interface and add these fields:

type ChartState = {
  // ... existing state fields

  // Responsive layout additions
  isDrawerOpen: boolean;
  viewportMode: 'mobile' | 'desktop';
  viewportWidth: number;
  viewportHeight: number;
}
```

### Step 1.2: Update Initial State

```typescript
const initialState: ChartState = {
  // ... existing initial state

  // Responsive defaults
  isDrawerOpen: false,
  viewportMode: 'desktop', // SSR-safe default
  viewportWidth: 0,
  viewportHeight: 0,
}
```

### Step 1.3: Add Action Types

```typescript
type ChartAction =
  // ... existing actions

  // Responsive actions
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_DRAWER_OPEN'; payload: boolean }
  | { type: 'SET_VIEWPORT_MODE'; payload: { mode: 'mobile' | 'desktop'; width: number; height?: number } }
  | { type: 'SET_VIEWPORT_DIMENSIONS'; payload: { width: number; height: number } }
```

### Step 1.4: Implement Reducer Cases

```typescript
function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    // ... existing cases

    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen };

    case 'SET_DRAWER_OPEN':
      return { ...state, isDrawerOpen: action.payload };

    case 'SET_VIEWPORT_MODE': {
      const { mode, width, height } = action.payload;

      // Auto-close drawer when transitioning to desktop
      const shouldCloseDrawer = mode === 'desktop' && state.viewportMode === 'mobile' && state.isDrawerOpen;

      return {
        ...state,
        viewportMode: mode,
        viewportWidth: width,
        viewportHeight: height ?? state.viewportHeight,
        isDrawerOpen: shouldCloseDrawer ? false : state.isDrawerOpen,
      };
    }

    case 'SET_VIEWPORT_DIMENSIONS':
      return {
        ...state,
        viewportWidth: action.payload.width,
        viewportHeight: action.payload.height,
      };

    default:
      return state;
  }
}
```

**Test Checkpoint**: Verify TypeScript compiles without errors. Context state is now ready for use.

---

## Phase 2: Viewport Detection Hook

### Step 2.1: Create Constants File

**File**: `src/constants/layout.ts` (NEW)

```typescript
export const LAYOUT_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  DRAWER_HEIGHT_VH: 65,
  DRAWER_BORDER_RADIUS: 16,
  FAB_POSITION: {
    bottom: 16,
    right: 16,
  },
  RESIZE_DEBOUNCE_MS: 150,
} as const;
```

### Step 2.2: Create useViewport Hook

**File**: `src/hooks/useViewport.ts` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { LAYOUT_CONFIG } from '@/constants/layout';

export function useViewport() {
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('desktop');
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewportWidth(width);
      setViewportHeight(height);
      setViewportMode(width < LAYOUT_CONFIG.MOBILE_BREAKPOINT ? 'mobile' : 'desktop');
    };

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, LAYOUT_CONFIG.RESIZE_DEBOUNCE_MS);
    };

    updateViewport(); // Initial call
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    viewportMode,
    viewportWidth,
    viewportHeight,
    isMobile: viewportMode === 'mobile',
    isDesktop: viewportMode === 'desktop',
  };
}
```

### Step 2.3: Integrate Hook in Root Component

**File**: `src/app/page.tsx`

```typescript
'use client';

import { useViewport } from '@/hooks/useViewport';
import { useChart, useChartDispatch } from '@/contexts/ChartContext';
import { useEffect } from 'react';

export default function Page() {
  const { viewportMode, viewportWidth, viewportHeight } = useViewport();
  const dispatch = useChartDispatch();

  // Sync viewport state to context
  useEffect(() => {
    dispatch({
      type: 'SET_VIEWPORT_MODE',
      payload: { mode: viewportMode, width: viewportWidth, height: viewportHeight },
    });
  }, [viewportMode, viewportWidth, viewportHeight, dispatch]);

  // ... rest of component
}
```

**Test Checkpoint**: Resize browser window and check console.log(viewportMode). Should toggle at 768px.

---

## Phase 3: Mobile Drawer Component

### Step 3.1: Create MobileDrawer Component

**File**: `src/components/MobileDrawer.tsx` (NEW)

```typescript
'use client';

import { Drawer } from '@mui/material';
import { useChart, useChartDispatch } from '@/contexts/ChartContext';
import { LAYOUT_CONFIG } from '@/constants/layout';

interface MobileDrawerProps {
  children: React.ReactNode;
}

export function MobileDrawer({ children }: MobileDrawerProps) {
  const { isDrawerOpen, viewportMode } = useChart();
  const dispatch = useChartDispatch();

  // Only render on mobile
  if (viewportMode !== 'mobile') return null;

  const handleClose = () => {
    dispatch({ type: 'SET_DRAWER_OPEN', payload: false });
  };

  return (
    <Drawer
      anchor="bottom"
      open={isDrawerOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          height: `${LAYOUT_CONFIG.DRAWER_HEIGHT_VH}vh`,
          borderTopLeftRadius: LAYOUT_CONFIG.DRAWER_BORDER_RADIUS,
          borderTopRightRadius: LAYOUT_CONFIG.DRAWER_BORDER_RADIUS,
        },
      }}
      ModalProps={{
        keepMounted: false,
      }}
    >
      {children}
    </Drawer>
  );
}
```

### Step 3.2: Create Drawer Styles (Optional)

**File**: `src/styles/MobileDrawer.module.css` (NEW)

```css
.drawerContent {
  padding: 16px;
  overflow-y: auto;
  height: 100%;
}
```

**Test Checkpoint**: Temporarily set `viewportMode: 'mobile'` and `isDrawerOpen: true` in context to verify drawer renders with bottom sheet appearance.

---

## Phase 4: Floating Action Button

### Step 4.1: Create DrawerToggleFab Component

**File**: `src/components/DrawerToggleFab.tsx` (NEW)

```typescript
'use client';

import { Fab } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useChart, useChartDispatch } from '@/contexts/ChartContext';
import { LAYOUT_CONFIG } from '@/constants/layout';

export function DrawerToggleFab() {
  const { isDrawerOpen, viewportMode } = useChart();
  const dispatch = useChartDispatch();

  // Only show on mobile
  if (viewportMode !== 'mobile') return null;

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_DRAWER' });
  };

  return (
    <Fab
      color="primary"
      onClick={handleToggle}
      aria-label="Toggle sidebar drawer"
      sx={{
        position: 'fixed',
        bottom: LAYOUT_CONFIG.FAB_POSITION.bottom,
        right: LAYOUT_CONFIG.FAB_POSITION.right,
        zIndex: (theme) => theme.zIndex.drawer + 1, // Above chart, below drawer
      }}
    >
      {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
    </Fab>
  );
}
```

**Test Checkpoint**: Resize to mobile width. FAB should appear at bottom-right. Click to toggle drawer open/close.

---

## Phase 5: Chart Resize Logic

### Step 5.1: Add Resize Listener to Chart Component

**File**: `src/components/Chart.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useChart } from '@/contexts/ChartContext';

export function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { viewportWidth, viewportMode } = useChart();

  // Resize canvas when viewport changes
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Resize canvas layers (existing utility)
    resizeCanvasLayer(dataPointsCanvasRef.current, containerWidth, containerHeight);
    resizeCanvasLayer(polygonCanvasRef.current, containerWidth, containerHeight);

    // Recalculate D3 scales
    const newXScale = d3.scaleLinear()
      .domain([200, 1000]) // CD45-KrO range
      .range([0, containerWidth - margins.left - margins.right]);

    const newYScale = d3.scaleLinear()
      .domain([0, 1000]) // SS INT LIN range
      .range([containerHeight - margins.top - margins.bottom, 0]);

    // Update coordinate transforms in context
    dispatch({
      type: 'SET_COORDINATE_TRANSFORM',
      payload: createCoordinateTransform(newXScale, newYScale, margins),
    });

    // Trigger full redraw
    renderAllLayers();
  }, [viewportWidth]); // Recalculate when viewport width changes

  // ... rest of component
}
```

### Step 5.2: Create Canvas Resize Utility (if not exists)

**File**: `src/utils/canvas/resizeCanvas.ts`

```typescript
export function resizeCanvasLayer(
  canvas: HTMLCanvasElement | null,
  containerWidth: number,
  containerHeight: number
) {
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;

  // Set CSS size
  canvas.style.width = `${containerWidth}px`;
  canvas.style.height = `${containerHeight}px`;

  // Set actual size (scaled for HiDPI)
  canvas.width = containerWidth * dpr;
  canvas.height = containerHeight * dpr;

  // Scale context for HiDPI
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
}
```

**Test Checkpoint**: Resize browser. Chart should redraw within 500ms without pixel drift in polygon positions.

---

## Phase 6: Sidebar Responsive Behavior

### Step 6.1: Update Sidebar Component

**File**: `src/components/Sidebar.tsx`

```typescript
'use client';

import { useChart } from '@/contexts/ChartContext';
import styles from '@/styles/Sidebar.module.css';

export function Sidebar() {
  const { viewportMode } = useChart();

  // On mobile, sidebar only renders inside drawer
  // On desktop, sidebar renders in main layout
  return (
    <aside className={viewportMode === 'mobile' ? styles.sidebarInDrawer : styles.sidebar}>
      {/* ... existing sidebar content */}
    </aside>
  );
}
```

### Step 6.2: Update Sidebar Styles

**File**: `src/styles/Sidebar.module.css`

```css
/* Desktop sidebar (≥768px) */
.sidebar {
  width: 300px;
  height: 100vh;
  padding: 16px;
  overflow-y: auto;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
}

/* Mobile sidebar (inside drawer) */
.sidebarInDrawer {
  width: 100%;
  padding: 8px 16px;
  background-color: transparent; /* Drawer provides background */
}
```

---

## Phase 7: Integration and Testing

### Step 7.1: Update Page Layout

**File**: `src/app/page.tsx`

```typescript
import { Chart } from '@/components/Chart';
import { Sidebar } from '@/components/Sidebar';
import { MobileDrawer } from '@/components/MobileDrawer';
import { DrawerToggleFab } from '@/components/DrawerToggleFab';
import { useChart } from '@/contexts/ChartContext';
import styles from '@/styles/page.module.css';

export default function Page() {
  const { viewportMode } = useChart();

  return (
    <div className={styles.container}>
      <div className={styles.chartArea}>
        <Chart />
      </div>

      {/* Desktop sidebar */}
      {viewportMode === 'desktop' && (
        <div className={styles.sidebarArea}>
          <Sidebar />
        </div>
      )}

      {/* Mobile drawer */}
      {viewportMode === 'mobile' && (
        <>
          <MobileDrawer>
            <Sidebar />
          </MobileDrawer>
          <DrawerToggleFab />
        </>
      )}
    </div>
  );
}
```

### Step 7.2: Update Page Styles

**File**: `src/styles/page.module.css`

```css
.container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.chartArea {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.sidebarArea {
  width: 300px;
  flex-shrink: 0;
}

/* Mobile: Full-width chart */
@media (max-width: 767px) {
  .chartArea {
    width: 100%;
  }

  .sidebarArea {
    display: none; /* Sidebar hidden on mobile (rendered in drawer instead) */
  }
}
```

### Step 7.3: Manual Test Checklist

**Desktop (≥768px)**:
- [ ] Sidebar visible on right side
- [ ] Chart fills remaining space
- [ ] No FAB visible
- [ ] Resize window - chart adapts smoothly

**Mobile (<768px)**:
- [ ] Sidebar hidden
- [ ] Chart fills full width
- [ ] FAB visible at bottom-right
- [ ] Click FAB - drawer slides up from bottom
- [ ] Drawer covers 60-70% of viewport height
- [ ] Click outside drawer - drawer closes
- [ ] Click FAB again - drawer closes

**Resize Transitions**:
- [ ] Desktop → Mobile: Sidebar disappears, FAB appears
- [ ] Mobile → Desktop: Drawer closes (if open), sidebar appears
- [ ] Mobile (drawer open) → Desktop: Drawer auto-closes, sidebar appears
- [ ] Chart polygons maintain positions (zero pixel drift)

### Step 7.4: Performance Validation

**Check DevTools Performance Tab**:
- [ ] Chart resize completes within 500ms
- [ ] Drawer animation runs at 60 FPS
- [ ] No memory leaks during rapid resizing
- [ ] Debouncing reduces resize events to ~6-7/sec max

---

## Troubleshooting

### Issue: Drawer doesn't close when resizing to desktop

**Solution**: Verify `SET_VIEWPORT_MODE` reducer case includes auto-close logic:

```typescript
case 'SET_VIEWPORT_MODE': {
  const shouldCloseDrawer = action.payload.mode === 'desktop' && state.viewportMode === 'mobile' && state.isDrawerOpen;
  return {
    ...state,
    // ...
    isDrawerOpen: shouldCloseDrawer ? false : state.isDrawerOpen,
  };
}
```

### Issue: Chart polygons drift after resize

**Solution**: Ensure coordinate transforms recalculated before redraw:

```typescript
// Update scales first
const newXScale = d3.scaleLinear().domain([200, 1000]).range([...]);
const newYScale = d3.scaleLinear().domain([0, 1000]).range([...]);

// Then update transforms
dispatch({ type: 'SET_COORDINATE_TRANSFORM', payload: createCoordinateTransform(newXScale, newYScale, margins) });

// Then redraw
renderAllLayers();
```

### Issue: FAB obstructs chart data

**Solution**: Adjust FAB position in `LAYOUT_CONFIG.FAB_POSITION` or add transparency:

```typescript
sx={{
  // ...
  opacity: 0.9, // Slightly transparent
}}
```

### Issue: Resize events fire too frequently

**Solution**: Verify debounce logic clears previous timeout:

```typescript
const handleResize = () => {
  clearTimeout(timeoutId); // Must clear previous timeout
  timeoutId = setTimeout(updateViewport, LAYOUT_CONFIG.RESIZE_DEBOUNCE_MS);
};
```

---

## Architecture Compliance

### Constitution Checklist

- [x] **Principle I (Interactive UX)**: Drawer provides immediate feedback at 60 FPS
- [x] **Principle II (Data-Driven Rendering)**: D3 scales recalculated on resize, no direct SVG manipulation
- [x] **Principle III (Context-Based State)**: All drawer/viewport state in ChartContext via reducer
- [x] **Principle IV (Type Safety)**: All new interfaces defined in contracts/
- [x] **Principle V (Incremental Delivery)**: Each phase independently testable

### Code Review Checklist

- [ ] TypeScript strict mode passes without errors
- [ ] No implicit `any` types
- [ ] All MUI props typed via @mui/material
- [ ] Cleanup functions in useEffect for event listeners
- [ ] Debounce timeout cleared on unmount
- [ ] Performance thresholds met (SC-003, SC-004, SC-005)

---

## Next Steps

After completing implementation:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Update CLAUDE.md with responsive architecture notes
3. (Optional) Add integration tests for viewport transitions
4. Deploy to staging for cross-device testing

---

## Reference Links

- [MUI Drawer Docs](https://mui.com/material-ui/react-drawer/)
- [MUI Fab Docs](https://mui.com/material-ui/react-floating-action-button/)
- [D3 Scale Docs](https://d3js.org/d3-scale)
- [Project Constitution](/.specify/memory/constitution.md)
- [Feature Spec](./spec.md)
- [Data Model](./data-model.md)
- [Component Contracts](./contracts/component-interfaces.ts)
