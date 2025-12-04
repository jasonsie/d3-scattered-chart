/**
 * useViewport hook - Responsive viewport detection
 * Feature: 001-responsive-layout
 *
 * Detects viewport size and determines mobile vs desktop mode
 * based on MOBILE_BREAKPOINT (768px).
 *
 * Implements 150ms debouncing to prevent excessive re-renders
 * during window resizing.
 */

'use client';

import { useState, useEffect } from 'react';
import { LAYOUT_CONFIG } from '@/constants/layout';

export interface ViewportHookResult {
  viewportMode: 'mobile' | 'desktop';
  viewportWidth: number;
  viewportHeight: number;
  isMobile: boolean;
  isDesktop: boolean;
}

export function useViewport(): ViewportHookResult {
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('desktop');
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    // Update viewport state
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewportWidth(width);
      setViewportHeight(height);
      setViewportMode(width < LAYOUT_CONFIG.MOBILE_BREAKPOINT ? 'mobile' : 'desktop');
    };

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, LAYOUT_CONFIG.RESIZE_DEBOUNCE_MS);
    };

    // Initial call to set viewport state
    updateViewport();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
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
