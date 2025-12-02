/**
 * Custom hook for Canvas rendering with requestAnimationFrame
 */

import { useRef, useEffect, RefObject } from 'react';
import { setupCanvas } from '@/utils/canvas/devicePixelRatio';
import type { CanvasLayer } from '@/types/canvas';

interface CanvasRendererOptions {
  width: number;
  height: number;
  devicePixelRatio?: number;
}

interface CanvasRendererResult {
  context: CanvasRenderingContext2D | null;
  render: (renderFn: RenderFunction) => void;
  clear: () => void;
  invalidateRect: (rect: DOMRect) => void;
  layer: CanvasLayer | null;
}

type RenderFunction = (ctx: CanvasRenderingContext2D) => void;

/**
 * Hook for managing Canvas rendering with requestAnimationFrame
 * 
 * @param canvasRef - Reference to canvas element
 * @param options - Canvas configuration options
 * @returns Canvas rendering utilities
 */
export function useCanvasRenderer(
  canvasRef: RefObject<HTMLCanvasElement>,
  options: CanvasRendererOptions
): CanvasRendererResult {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const layerRef = useRef<CanvasLayer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Initialize Canvas context
  useEffect(() => {
    if (!canvasRef.current || contextRef.current) return;

    const ctx = setupCanvas(canvasRef.current, options.width, options.height);
    contextRef.current = ctx;

    // Initialize layer metadata
    layerRef.current = {
      canvas: canvasRef.current,
      context: ctx,
      zIndex: 0,
      clearOnRender: true,
      devicePixelRatio: window.devicePixelRatio || 1,
      dirtyRects: [],
    };
  }, [canvasRef, options.width, options.height]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, []);

  const render = (renderFn: RenderFunction) => {
    if (!contextRef.current) return;

    // Cancel previous frame if pending
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
    }

    frameIdRef.current = requestAnimationFrame(() => {
      if (contextRef.current) {
        renderFn(contextRef.current);
      }
      frameIdRef.current = null;
    });
  };

  const clear = () => {
    if (!contextRef.current) return;
    contextRef.current.clearRect(0, 0, options.width, options.height);
  };

  const invalidateRect = (rect: DOMRect) => {
    if (layerRef.current) {
      layerRef.current.dirtyRects.push(rect);
    }
  };

  return {
    context: contextRef.current,
    render,
    clear,
    invalidateRect,
    layer: layerRef.current,
  };
}
