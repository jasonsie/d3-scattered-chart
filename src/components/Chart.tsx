'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import styles from '@/styles/Chart.module.css';
import Polygon from './Polygon';
import { useChartDispatch, useChartState } from '@/contexts/ChartContext';
import { CellData } from '@/utils/data/loadCsvData';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useCoordinateTransform } from '@/hooks/useCoordinateTransform';
import { useSpatialIndex } from '@/hooks/useSpatialIndex';
import { useViewportCulling } from '@/hooks/useViewportCulling';
import { usePolygonSelection } from '@/hooks/usePolygonSelection';
import { setupCanvas } from '@/utils/canvas/devicePixelRatio';
import { clearCanvas } from '@/utils/canvas/canvasRenderer';
import { renderPolygonFill, renderPolygonStroke } from '@/utils/canvas/canvasRenderer';
import type { DataX, DataY, ScreenX, ScreenY, Viewport } from '@/types/canvas';

export interface ChartProps {
   width?: number;
   height?: number;
}

/**
 * Chart Component
 *
 * A Canvas-based scatter plot component that allows polygon-based point selection.
 * Features:
 * - Dual-layer Canvas rendering (data points + polygon overlays)
 * - Viewport culling for 10k+ point performance
 * - Interactive pan/zoom
 * - Polygon drawing for point selection
 *
 * @param {number} width - Canvas width in CSS pixels
 * @param {number} height - Canvas height in CSS pixels
 */
export default function Chart({ width = 800, height = 600 }: ChartProps) {
   // Refs for Canvas elements
   const dataLayerRef = useRef<HTMLCanvasElement>(null);
   const polygonLayerRef = useRef<HTMLCanvasElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);

   // Chart state from context
   const { data, loading, polygons, viewport, spatialIndex, coordinateTransform } = useChartState();
   const dispatch = useChartDispatch();

   // Mounted state for client-side rendering
   const [isMounted, setIsMounted] = useState(false);
   const [dimensions, setDimensions] = useState({ width, height });

   // Chart dimensions (memoized to prevent recreation)
   const margin = useRef({ top: 20, right: 20, bottom: 50, left: 60 }).current;
   const innerWidth = dimensions.width - margin.left - margin.right;
   const innerHeight = dimensions.height - margin.top - margin.bottom;

   useEffect(() => {
      setIsMounted(true);
   }, []);

   // Measure actual container size on mount
   useEffect(() => {
      if (!containerRef.current) return;
      
      const resizeObserver = new ResizeObserver(entries => {
         for (const entry of entries) {
            const { width: containerWidth, height: containerHeight } = entry.contentRect;
            // Use container size if available, otherwise fall back to props
            const actualWidth = containerWidth > 0 ? containerWidth : width;
            const actualHeight = containerHeight > 0 ? containerHeight : height;
            setDimensions({ width: actualWidth, height: actualHeight });
         }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
   }, [width, height]);

   // Initialize Canvas contexts (T065-T070)
   useEffect(() => {
      if (!dataLayerRef.current || !polygonLayerRef.current) return;

      const dataCtx = setupCanvas(dataLayerRef.current, innerWidth, innerHeight);
      const polygonCtx = setupCanvas(polygonLayerRef.current, innerWidth, innerHeight);

      dispatch({
         type: 'SET_CANVAS_LAYERS',
         layers: {
            dataPoints: {
               canvas: dataLayerRef.current,
               context: dataCtx,
               zIndex: 0,
               clearOnRender: true,
               devicePixelRatio: window.devicePixelRatio || 1,
               dirtyRects: [],
            },
            polygonOverlay: {
               canvas: polygonLayerRef.current,
               context: polygonCtx,
               zIndex: 1,
               clearOnRender: true,
               devicePixelRatio: window.devicePixelRatio || 1,
               dirtyRects: [],
            },
         },
      });
   }, [innerWidth, innerHeight, dispatch]);

   // Build spatial index (T073-T074) - stable callback
   const getBounds = useCallback((point: CellData) => ({ x: point.x, y: point.y }), []);
   const spatialIndexHook = useSpatialIndex(data, getBounds);

   useEffect(() => {
      if (spatialIndexHook && spatialIndexHook !== spatialIndex) {
         dispatch({ type: 'REBUILD_SPATIAL_INDEX', index: spatialIndexHook });
      }
   }, [spatialIndexHook, spatialIndex, dispatch]);

   // Initialize viewport (T075-T076) - only once
   useEffect(() => {
      if (viewport) return; // Skip if already initialized
      
      const initialViewport: Viewport = {
         minX: 200 as DataX,
         maxX: 1000 as DataX,
         minY: 0 as DataY,
         maxY: 1000 as DataY,
         scale: 1.0,
         translateX: 0,
         translateY: 0,
      };
      dispatch({ type: 'SET_VIEWPORT', viewport: initialViewport });
   }, [viewport, dispatch]);

   // Create coordinate transform (T071-T072) with stable references
   const dataDomain = useMemo(() => ({ x: [200, 1000] as [number, number], y: [0, 1000] as [number, number] }), []);
   const screenRange = useMemo(() => ({ x: [0, innerWidth] as [number, number], y: [innerHeight, 0] as [number, number] }), [innerWidth, innerHeight]);
   
   const transform = useCoordinateTransform(dataDomain, screenRange, viewport);

   useEffect(() => {
      if (transform && transform !== coordinateTransform) {
         dispatch({ type: 'SET_COORDINATE_TRANSFORM', transform });
      }
   }, [transform, coordinateTransform, dispatch]);

   // Get visible points via viewport culling (T077) - reuse getBounds
   const visiblePoints = useViewportCulling(
      data,
      viewport,
      spatialIndex,
      getBounds
   );

   // Calculate polygon selection (T110)
   const selectionMap = usePolygonSelection(
      data,
      polygons.map(p => ({ id: p.id, points: p.points, isVisible: p.isVisible })),
      transform
   );

   // Render data points (T078-T082, T111-T115)
   useEffect(() => {
      if (!dataLayerRef.current || !transform) return;

      if (data.length === 0) return;

      const ctx = dataLayerRef.current.getContext('2d');
      if (!ctx) return;

      // Pre-filter visible polygons
      const visiblePolygons = polygons.filter(p => p.isVisible && selectionMap[p.id]);

      // Performance monitoring
      const startTime = performance.now();

      const frameId = requestAnimationFrame(() => {
         // Clear canvas
         clearCanvas(ctx, innerWidth, innerHeight);

         // Build reverse index: point index -> containing polygons (O(n*m) once, not per point)
         const pointToPolygons = new Map<number, typeof visiblePolygons>();
         visiblePolygons.forEach(polygon => {
            const selectedIndices = selectionMap[polygon.id] || [];
            selectedIndices.forEach(dataIndex => {
               if (!pointToPolygons.has(dataIndex)) {
                  pointToPolygons.set(dataIndex, []);
               }
               pointToPolygons.get(dataIndex)!.push(polygon);
            });
         });

         // Batch rendering by color to reduce context switches
         // 1. Render all unselected points first
         ctx.fillStyle = 'white';
         ctx.globalAlpha = 0.4;
         ctx.beginPath();
         data.forEach((point, dataIndex) => {
            if (!pointToPolygons.has(dataIndex)) {
               const screenPos = transform.toScreen({ x: point.x as DataX, y: point.y as DataY });
               ctx.moveTo(screenPos.x + 1, screenPos.y);
               ctx.arc(screenPos.x, screenPos.y, 1, 0, Math.PI * 2);
            }
         });
         ctx.fill();

         // 2. Render selected points grouped by their first polygon's dot color
         const colorGroups = new Map<string, number[]>();
         pointToPolygons.forEach((containingPolygons, dataIndex) => {
            const dotColor = containingPolygons[0]?.dot || 'white';
            if (!colorGroups.has(dotColor)) {
               colorGroups.set(dotColor, []);
            }
            colorGroups.get(dotColor)!.push(dataIndex);
         });

         colorGroups.forEach((indices, dotColor) => {
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            indices.forEach(dataIndex => {
               const point = data[dataIndex];
               const screenPos = transform.toScreen({ x: point.x as DataX, y: point.y as DataY });
               ctx.moveTo(screenPos.x + 1, screenPos.y);
               ctx.arc(screenPos.x, screenPos.y, 1, 0, Math.PI * 2);
            });
            ctx.fill();
         });

         // 3. Render polygon color overlays (batched by color)
         const overlayGroups = new Map<string, number[]>();
         pointToPolygons.forEach((containingPolygons, dataIndex) => {
            containingPolygons.forEach(polygon => {
               if (polygon.color) {
                  if (!overlayGroups.has(polygon.color)) {
                     overlayGroups.set(polygon.color, []);
                  }
                  overlayGroups.get(polygon.color)!.push(dataIndex);
               }
            });
         });

         overlayGroups.forEach((indices, color) => {
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            // Use Set to avoid duplicate points
            const uniqueIndices = [...new Set(indices)];
            uniqueIndices.forEach(dataIndex => {
               const point = data[dataIndex];
               const screenPos = transform.toScreen({ x: point.x as DataX, y: point.y as DataY });
               ctx.moveTo(screenPos.x + 1, screenPos.y);
               ctx.arc(screenPos.x, screenPos.y, 1, 0, Math.PI * 2);
            });
            ctx.fill();
         });

         ctx.globalAlpha = 1.0; // Reset

         const endTime = performance.now();
         const renderTime = endTime - startTime;
         console.log(`[Performance] Rendered ${data.length} points in ${renderTime.toFixed(2)}ms`);
      });

      return () => cancelAnimationFrame(frameId);
   }, [data, polygons, transform, innerWidth, innerHeight, selectionMap]);

   // Render polygons (T102-T109)
   useEffect(() => {
      if (!polygonLayerRef.current) return;

      const ctx = polygonLayerRef.current.getContext('2d');
      if (!ctx) return;

      const visiblePolygons = polygons.filter(p => p.isVisible && p.points && p.points.length >= 3);

      const frameId = requestAnimationFrame(() => {
         // Clear polygon layer
         clearCanvas(ctx, innerWidth, innerHeight);

         // Render finished polygons only
         visiblePolygons.forEach(polygon => {
            // Render fill
            if (polygon.color) {
               renderPolygonFill(ctx, polygon.points, polygon.color, 0.2);
            }

            // Render stroke
            const strokeColor = polygon.line || polygon.color || '#808080';
            renderPolygonStroke(ctx, polygon.points, strokeColor, 2);
         });
      });

      return () => cancelAnimationFrame(frameId);
   }, [polygons, innerWidth, innerHeight]);

   // Keep D3 scales for backward compatibility with Polygon component - memoized
   const xScale = useMemo(() => 
      d3.scaleLinear().domain([200, 1000]).range([0, innerWidth]),
      [innerWidth]
   );
   const yScale = useMemo(() => 
      d3.scaleLinear().domain([0, 1000]).range([innerHeight, 0]),
      [innerHeight]
   );

   useEffect(() => {
      dispatch({ type: 'SET_SCALES', scales: { xScale, yScale } });
   }, [dispatch, xScale, yScale]);

   if (!isMounted) return null;

   return (
      <div ref={containerRef} className={styles.chartContainer} style={{ minWidth: width, minHeight: height }}>
         {loading ? (
            <div>Loading...</div>
         ) : (
            <>
               {/* Layer 0: Data points */}
               <canvas
                  ref={dataLayerRef}
                  className={styles.dataLayer}
                  width={innerWidth}
                  height={innerHeight}
                  style={{ position: 'absolute', zIndex: 0, left: margin.left, top: margin.top, width: innerWidth, height: innerHeight }}
               />

               {/* Layer 1: Polygon overlays */}
               <canvas
                  ref={polygonLayerRef}
                  className={styles.polygonLayer}
                  width={innerWidth}
                  height={innerHeight}
                  style={{ position: 'absolute', zIndex: 1, left: margin.left, top: margin.top, width: innerWidth, height: innerHeight }}
               />

               {/* Layer 2: Interaction (SVG overlay for polygon drawing) */}
               <Polygon data={data} xScale={xScale} yScale={yScale} margin={margin} />

               {/* Layer 3: Axes (SVG overlay) */}
               <svg
                  style={{
                     position: 'absolute',
                     zIndex: 3,
                     left: 0,
                     top: 0,
                     pointerEvents: 'none',
                     width: dimensions.width,
                     height: dimensions.height
                  }}
               >
                  <g transform={`translate(${margin.left},${margin.top})`}>
                     {/* X-axis label */}
                     <text
                        x={innerWidth / 2}
                        y={innerHeight + 35}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="14px"
                        fontWeight="bold"
                     >
                        CD45-KrO
                     </text>

                     {/* Y-axis label */}
                     <text
                        x={-innerHeight / 2}
                        y={-35}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="14px"
                        fontWeight="bold"
                        transform={`rotate(-90, ${-innerHeight / 2}, -35)`}
                     >
                        SS INT LIN
                     </text>

                     {/* X-axis tick labels */}
                     {[200, 400, 600, 800, 1000].map(value => (
                        <text
                           key={`x-${value}`}
                           x={xScale(value)}
                           y={innerHeight + 20}
                           textAnchor="middle"
                           fill="#666"
                           fontSize="12px"
                        >
                           {value}
                        </text>
                     ))}

                     {/* Y-axis tick labels */}
                     {[0, 200, 400, 600, 800, 1000].map(value => (
                        <text
                           key={`y-${value}`}
                           x={-10}
                           y={yScale(value)}
                           textAnchor="end"
                           fill="#666"
                           fontSize="12px"
                           dominantBaseline="middle"
                        >
                           {value}
                        </text>
                     ))}
                  </g>
               </svg>
            </>
         )}
      </div>
   );
}
