/**
 * DrawerToggleFab Component
 * Feature: 001-responsive-layout
 *
 * Floating Action Button to toggle the mobile drawer.
 * Only visible on mobile devices.
 */

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
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
    </Fab>
  );
}
