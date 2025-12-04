/**
 * ViewportHandler Component
 * Feature: 001-responsive-layout
 *
 * Manages viewport detection and syncs viewport state to ChartContext.
 * Conditionally renders mobile drawer and FAB based on viewport mode.
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useViewport } from '@/hooks/useViewport';
import { useChart, useChartDispatch } from '@/contexts/ChartContext';
import { MobileDrawer } from './MobileDrawer';
import { DrawerToggleFab } from './DrawerToggleFab';
import Sidebar from './Sidebar';

interface ViewportHandlerProps {
  children: ReactNode;
}

export function ViewportHandler({ children }: ViewportHandlerProps) {
  const { viewportMode, viewportWidth, viewportHeight } = useViewport();
  const { viewportMode: contextMode } = useChart();
  const dispatch = useChartDispatch();

  // Sync viewport state to context
  useEffect(() => {
    dispatch({
      type: 'SET_VIEWPORT_MODE',
      payload: { mode: viewportMode, width: viewportWidth, height: viewportHeight },
    });
  }, [viewportMode, viewportWidth, viewportHeight, dispatch]);

  return (
    <>
      {children}
      {/* Mobile-specific UI */}
      {contextMode === 'mobile' && (
        <>
          <MobileDrawer>
            <Sidebar />
          </MobileDrawer>
          <DrawerToggleFab />
        </>
      )}
    </>
  );
}
