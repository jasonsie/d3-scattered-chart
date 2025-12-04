'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import styles from '@/styles/Chart.module.css';
import Polygon from './Polygon';
import { useChartDispatch, useChartState } from '@/contexts/ChartContext';
import { CellData } from '@/utils/data/loadCsvData';
import { isValidDataPoint } from '@/utils/data/validateData';
import { useCanvasRenderer } from '@/hooks/useCanvasRenderer';
import { useCoordinateTransform } from '@/hooks/useCoordinateTransform';
import { useSpatialIndex } from '@/hooks/useSpatialIndex';
import { useViewportCulling } from '@/hooks/useViewportCulling';
import { usePolygonSelection } from '@/hooks/usePolygonSelection';
import { setupCanvas } from '@/utils/canvas/devicePixelRatio';
import { clearCanvas } from '@/utils/canvas/canvasRenderer';
import { renderPolygonFill, renderPolygonStroke } from '@/utils/canvas/canvasRenderer';
import type { ChartProps } from '@/types/components';
import type { DataX, DataY, ScreenX, ScreenY, Viewport } from '@/types/canvas';
import { CHART_CONSTANTS, LAYER_Z_INDEX } from '@/utils/constants/chart';
import { CHART_DIMENSIONS } from '@/utils/constants/dimensions';
import { COLORS } from '@/utils/constants/colors';
import { CANVAS_CONSTANTS } from '@/utils/constants/canvas';

/**
 * Chart Component
 *
 * High-performance canvas-based scatter plot with interactive polygon selection.
 * 
 * **Purpose**: Render large datasets (10k+ points) with minimal latency using dual-layer
 * canvas architecture and spatial indexing for efficient point queries.
 * 
 * **Data Flow**:
 * 1. CSV data loaded via ChartContext → parsed to DataPoint array
 * 2. Spatial index built from data points → enables O(log n) viewport queries
 * 3. Coordinate transform created → maps data space [200-1000, 0-1000] to screen pixels
 * 4. Viewport culling filters visible points → reduces render workload
 * 5. Canvas layers render in order: data points (z:0) → polygons (z:1) → interaction (z:2) → axes (z:3)
 * 
 * **Canvas Layering**:
 * - **Layer 0 (dataPoints)**: Scatter plot points with color overlay for polygon membership
 * - **Layer 1 (polygonOverlay)**: Filled polygons with configurable stroke styles
 * - **Layer 2 (interaction)**: SVG overlay for polygon drawing (handles mouse events)
 * - **Layer 3 (axes)**: SVG axes with labels and tick marks (pointer-events: none)
 * 
 * **Performance Characteristics**:
 * - Initial render: ~100ms for 10k points (target: <500ms per PERFORMANCE.MAX_RENDER_TIME_MS)
 * - Selection update: ~50ms (target: <100ms per PERFORMANCE.SELECTION_FEEDBACK_MS)
 * - Uses requestAnimationFrame for smooth 60fps updates
 * - Batch rendering by color to minimize WebGL context switches
 * - Spatial index reduces point-in-polygon tests from O(n*m) to O(m*log n)
 * 
 * @param {ChartProps} props - Component props
 * @param {number} [props.width=800] - Chart width in CSS pixels (defaults to CHART_DIMENSIONS.DEFAULT_WIDTH)
 * @param {number} [props.height=600] - Chart height in CSS pixels (defaults to CHART_DIMENSIONS.DEFAULT_HEIGHT)
 * 
 * @returns {JSX.Element} Multi-layer canvas chart with SVG overlays for interaction and axes
 * 
 * @example
 * // Basic usage with default dimensions
 * <Chart />
 * 
 * @example
 * // Custom dimensions
 * <Chart width={1200} height={800} />
 */
export default function Chart({ 
   width = CHART_DIMENSIONS.DEFAULT_WIDTH, 
   height = CHART_DIMENSIONS.DEFAULT_HEIGHT 
}: ChartProps) {
   // Refs for Canvas elements
   const dataLayerRef = useRef<HTMLCanvasElement>(null);
   const polygonLayerRef = useRef<HTMLCanvasElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);

   // Chart state from context
   const { data, loading, polygons, viewport, spatialIndex, coordinateTransform, axisConfig, isRendering } = useChartState();
   const dispatch = useChartDispatch();

   // Mounted state for client-side rendering
   const [isMounted, setIsMounted] = useState(false);
   const [dimensions, setDimensions] = useState({ width, height });

   // Chart dimensions (memoized to prevent recreation)
   const margin = useRef(CHART_DIMENSIONS.MARGINS).current;
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
               zIndex: LAYER_Z_INDEX.DATA_POINTS,
               clearOnRender: true,
               devicePixelRatio: window.devicePixelRatio || CANVAS_CONSTANTS.DEFAULT_DPR,
               dirtyRects: [],
            },
            polygonOverlay: {
               canvas: polygonLayerRef.current,
               context: polygonCtx,
               zIndex: LAYER_Z_INDEX.POLYGON_OVERLAY,
               clearOnRender: true,
               devicePixelRatio: window.devicePixelRatio || CANVAS_CONSTANTS.DEFAULT_DPR,
               dirtyRects: [],
            },
         },
      });
   }, [innerWidth, innerHeight, dispatch]);

   // Build spatial index (T021) - rebuild when axis properties change
   const getBounds = useCallback((point: CellData) => ({
      x: point[axisConfig.xProperty],
      y: point[axisConfig.yProperty]
   }), [axisConfig.xProperty, axisConfig.yProperty]);
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
         minX: CHART_CONSTANTS.DATA_DOMAIN_X[0] as DataX,
         maxX: CHART_CONSTANTS.DATA_DOMAIN_X[1] as DataX,
         minY: CHART_CONSTANTS.DATA_DOMAIN_Y[0] as DataY,
         maxY: CHART_CONSTANTS.DATA_DOMAIN_Y[1] as DataY,
         scale: 1.0,
         translateX: 0,
         translateY: 0,
      };
      dispatch({ type: 'SET_VIEWPORT', viewport: initialViewport });
   }, [viewport, dispatch]);

   // Filter valid data for scale calculations (T014-T015)
   const validData = useMemo(() =>
      data.filter(d => isValidDataPoint(d, axisConfig.xProperty, axisConfig.yProperty)),
      [data, axisConfig.xProperty, axisConfig.yProperty]
   );

   // Create D3 scales with unit scaling applied (T023, T030-T031)
   const xScale = useMemo(() => {
      if (validData.length === 0) return d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);

      const xExtent = d3.extent(validData, d => d[axisConfig.xProperty]) as [number, number];
      // Apply unit scale factor (T031)
      const scaleFactor = axisConfig.unitScale / 1000;
      const scaledDomain: [number, number] = [
         xExtent[0] * scaleFactor,
         xExtent[1] * scaleFactor
      ];
      return d3.scaleLinear()
         .domain(scaledDomain)
         .range([0, innerWidth])
         .nice();
   }, [validData, axisConfig.xProperty, axisConfig.unitScale, innerWidth]);

   const yScale = useMemo(() => {
      if (validData.length === 0) return d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

      const yExtent = d3.extent(validData, d => d[axisConfig.yProperty]) as [number, number];
      // Apply unit scale factor (T031)
      const scaleFactor = axisConfig.unitScale / 1000;
      const scaledDomain: [number, number] = [
         yExtent[0] * scaleFactor,
         yExtent[1] * scaleFactor
      ];
      return d3.scaleLinear()
         .domain(scaledDomain)
         .range([innerHeight, 0])
         .nice();
   }, [validData, axisConfig.yProperty, axisConfig.unitScale, innerHeight]);

   // Create coordinate transform (T071-T072) using scaled domains from xScale/yScale
   const dataDomain = useMemo(() => ({
      x: xScale.domain() as [number, number],
      y: yScale.domain() as [number, number]
   }), [xScale, yScale]);
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

   // Calculate polygon selection (T022 - with dynamic axis properties)
   const selectionMap = usePolygonSelection(
      data,
      polygons.map(p => ({ id: p.id, points: p.points, isVisible: p.isVisible })),
      transform,
      axisConfig.xProperty,
      axisConfig.yProperty
   );

   // Render data points (T078-T082, T111-T115)
   useEffect(() => {
      if (!dataLayerRef.current || !transform) return;

      if (data.length === 0) return;

      const ctx = dataLayerRef.current.getContext('2d');
      if (!ctx) return;

      // Pre-filter visible polygons
      const visiblePolygons = polygons.filter(p => p.isVisible && selectionMap[p.id]);

      // Calculate unit scale factor
      const scaleFactor = axisConfig.unitScale / 1000;

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
         ctx.fillStyle = COLORS.POINT_UNSELECTED;
         ctx.globalAlpha = COLORS.POINT_UNSELECTED_ALPHA;
         ctx.beginPath();
         data.forEach((point, dataIndex) => {
            if (!pointToPolygons.has(dataIndex)) {
               // Use dynamic axis properties with unit scale applied (T023, T031)
               const screenPos = transform.toScreen({
                  x: (point[axisConfig.xProperty] * scaleFactor) as DataX,
                  y: (point[axisConfig.yProperty] * scaleFactor) as DataY
               });
               ctx.moveTo(screenPos.x + CANVAS_CONSTANTS.POINT_RADIUS, screenPos.y);
               ctx.arc(screenPos.x, screenPos.y, CANVAS_CONSTANTS.POINT_RADIUS, 0, Math.PI * 2);
            }
         });
         ctx.fill();

         // 2. Render selected points grouped by their first polygon's dot color
         const colorGroups = new Map<string, number[]>();
         pointToPolygons.forEach((containingPolygons, dataIndex) => {
            const dotColor = containingPolygons[0]?.dot || COLORS.POINT_UNSELECTED;
            if (!colorGroups.has(dotColor)) {
               colorGroups.set(dotColor, []);
            }
            colorGroups.get(dotColor)!.push(dataIndex);
         });

         colorGroups.forEach((indices, dotColor) => {
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = COLORS.POINT_SELECTED_ALPHA;
            ctx.beginPath();
            indices.forEach(dataIndex => {
               const point = data[dataIndex];
               // Use dynamic axis properties with unit scale applied (T023, T031)
               const screenPos = transform.toScreen({
                  x: (point[axisConfig.xProperty] * scaleFactor) as DataX,
                  y: (point[axisConfig.yProperty] * scaleFactor) as DataY
               });
               ctx.moveTo(screenPos.x + CANVAS_CONSTANTS.POINT_RADIUS, screenPos.y);
               ctx.arc(screenPos.x, screenPos.y, CANVAS_CONSTANTS.POINT_RADIUS, 0, Math.PI * 2);
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
            ctx.globalAlpha = COLORS.POLYGON_FILL_ALPHA;
            ctx.beginPath();
            // Use Set to avoid duplicate points
            const uniqueIndices = [...new Set(indices)];
            uniqueIndices.forEach(dataIndex => {
               const point = data[dataIndex];
               // Use dynamic axis properties with unit scale applied (T023, T031)
               const screenPos = transform.toScreen({
                  x: (point[axisConfig.xProperty] * scaleFactor) as DataX,
                  y: (point[axisConfig.yProperty] * scaleFactor) as DataY
               });
               ctx.moveTo(screenPos.x + CANVAS_CONSTANTS.POINT_RADIUS, screenPos.y);
               ctx.arc(screenPos.x, screenPos.y, CANVAS_CONSTANTS.POINT_RADIUS, 0, Math.PI * 2);
            });
            ctx.fill();
         });

         ctx.globalAlpha = 1.0; // Reset
      });

      return () => cancelAnimationFrame(frameId);
   }, [data, polygons, transform, innerWidth, innerHeight, selectionMap, axisConfig.xProperty, axisConfig.yProperty, axisConfig.unitScale]);

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
               renderPolygonFill(ctx, polygon.points, polygon.color, COLORS.POLYGON_FILL_ALPHA);
            }

            // Render stroke
            const strokeColor = polygon.line || polygon.color || COLORS.POLYGON_DEFAULT;
            renderPolygonStroke(ctx, polygon.points, strokeColor, 2);
         });
      });

      return () => cancelAnimationFrame(frameId);
   }, [polygons, innerWidth, innerHeight]);

   // Update context scales and reset viewport when axes change (T017)
   useEffect(() => {
      dispatch({ type: 'SET_SCALES', scales: { xScale, yScale } });
      dispatch({ type: 'RESET_VIEWPORT' });
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
                  style={{ position: 'absolute', zIndex: LAYER_Z_INDEX.DATA_POINTS, left: margin.left, top: margin.top, width: innerWidth, height: innerHeight }}
               />

               {/* Layer 1: Polygon overlays */}
               <canvas
                  ref={polygonLayerRef}
                  className={styles.polygonLayer}
                  width={innerWidth}
                  height={innerHeight}
                  style={{ position: 'absolute', zIndex: LAYER_Z_INDEX.POLYGON_OVERLAY, left: margin.left, top: margin.top, width: innerWidth, height: innerHeight }}
               />

               {/* Layer 2: Interaction (SVG overlay for polygon drawing) */}
               <Polygon data={data} xScale={xScale} yScale={yScale} margin={margin} />

               {/* Layer 3: Axes (SVG overlay) */}
               <svg
                  style={{
                     position: 'absolute',
                     zIndex: LAYER_Z_INDEX.AXES,
                     left: 0,
                     top: 0,
                     pointerEvents: 'none',
                     width: dimensions.width,
                     height: dimensions.height
                  }}
               >
                  <g transform={`translate(${margin.left},${margin.top})`}>
                     {/* X-axis label (T024) - Dynamic from axisConfig */}
                     <text
                        x={innerWidth / 2}
                        y={innerHeight + 35}
                        textAnchor="middle"
                        fill={COLORS.TEXT_PRIMARY}
                        fontSize="14px"
                        fontWeight="bold"
                     >
                        {axisConfig.xUnit ? `${axisConfig.xLabel} (${axisConfig.xUnit})` : axisConfig.xLabel}
                     </text>

                     {/* Y-axis label (T025) - Dynamic from axisConfig */}
                     <text
                        x={-innerHeight / 2}
                        y={-55}
                        textAnchor="middle"
                        fill={COLORS.TEXT_PRIMARY}
                        fontSize="14px"
                        fontWeight="bold"
                        transform={`rotate(-90, 0, 0)`}
                     >
                        {axisConfig.yUnit ? `${axisConfig.yLabel} (${axisConfig.yUnit})` : axisConfig.yLabel}
                     </text>

                     {/* X-axis tick labels */}
                     {xScale.ticks(6).map(value => (
                        <text
                           key={`x-${value}`}
                           x={xScale(value)}
                           y={innerHeight + 20}
                           textAnchor="middle"
                           fill={COLORS.TEXT_PRIMARY}
                           fontSize="12px"
                        >
                           {value.toFixed(0)}
                        </text>
                     ))}

                     {/* Y-axis tick labels */}
                     {yScale.ticks(6).map(value => (
                        <text
                           key={`y-${value}`}
                           x={-15}
                           y={yScale(value)}
                           textAnchor="end"
                           fill={COLORS.TEXT_PRIMARY}
                           fontSize="12px"
                           dominantBaseline="middle"
                        >
                           {value.toFixed(0)}
                        </text>
                     ))}
                  </g>
               </svg>
            </>
         )}
      </div>
   );
}
