'use client';

import { useEffect } from 'react';
import * as d3 from 'd3';
import PopupEditor from './PopupEditor';
import { useChartState, useChartDispatch } from '@/contexts/ChartContext';

export interface PolygonProps {
   g: d3.Selection<SVGGElement, unknown, null, undefined>;
   onSelectionChange?: (selectedPoints: Array<Point>) => void;
   data: Array<Point>;
   xScale: d3.ScaleLinear<number, number>;
   yScale: d3.ScaleLinear<number, number>;
   margin: { top: number; right: number; bottom: number; left: number };
}

export type Point = { x: number; y: number };
export type Polygon = {
   id: number;
   label: string;
   points: Point[];
   isVisible: boolean;
   data: {
      count: number;
      percentage: number;
   };
   color?: string;
   line?: string;
   dot?: string;
};
/**
 * Polygon Component
 *
 * A D3-based polygon drawing component that allows users to create multiple polygons
 * for selecting points within their boundaries.
 *
 * Features:
 * - Interactive polygon drawing
 * - Multiple polygon support
 * - Visual feedback during drawing
 * - Point selection within polygons
 */
export default function Polygon({ g, data, xScale, yScale, margin }: PolygonProps) {
   // Replace local state with context
   const { polygons, currentPoints, selectedPolygonId, isDrawing, showPopup } = useChartState();
   const dispatch = useChartDispatch();

   useEffect(() => {
      const drawingGroup = setupDrawingGroup();
      const finishedPolygonsGroup = setupFinishedPolygonsGroup(drawingGroup);
      const { polygon } = setupDrawingElements(drawingGroup);

      // Get SVG container for event handling
      const svg = g.node()?.ownerSVGElement;
      if (!svg) return;

      // Attach event listeners
      attachEventListeners(svg, drawingGroup);

      // Initial render
      updatePolygons(false, polygon, finishedPolygonsGroup);

      // Cleanup
      return () => cleanupDrawing(svg, drawingGroup);
   }, [g, currentPoints, isDrawing, polygons, selectedPolygonId]);

   // Setup Functions
   const setupDrawingGroup = () => {
      return g.append('g').attr('class', 'drawing-group');
   };

   const setupFinishedPolygonsGroup = (
      drawingGroup: d3.Selection<SVGGElement, unknown, null, undefined>
   ) => {
      return drawingGroup.append('g').attr('class', 'finished-polygons');
   };

   const setupDrawingElements = (
      drawingGroup: d3.Selection<SVGGElement, unknown, null, undefined>
   ) => {
      // Polygon path for brush area
      const polygon = drawingGroup
         .append('path')
         .attr('class', 'polygon')
         .attr('fill', 'rgba(128, 128, 128, 0.4)') // grey with 0.1 opacity
         .attr('stroke', 'rgba(128, 128, 128, 0.8)') // grey with 0.2 opacity
         .attr('stroke-width', 1);

      // Preview line while drawing
      drawingGroup
         .append('line')
         .attr('class', 'preview')
         .attr('stroke', 'rgba(128, 128, 128, 0.5)') // grey with 0.2 opacity
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', '4,4')
         .style('display', 'none');

      return { polygon };
   };

   // Event Handlers
   const handleMouseMove = (
      event: MouseEvent,
      previewLine: d3.Selection<SVGLineElement, unknown, null, undefined>
   ) => {
      if (!isDrawing || !currentPoints.length) return;

      const [mouseX, mouseY] = d3.pointer(event, g.node());
      const current = {
         x: mouseX - margin.left,
         y: mouseY - margin.top,
      };

      previewLine
         .style('display', 'block')
         .attr('x1', currentPoints[currentPoints.length - 1].x)
         .attr('y1', currentPoints[currentPoints.length - 1].y)
         .attr('x2', current.x)
         .attr('y2', current.y);
   };

   const handleMouseDown = (event: MouseEvent) => {
      const [mouseX, mouseY] = d3.pointer(event, g.node());
      const newPoint = {
         x: mouseX - margin.left,
         y: mouseY - margin.top,
      };

      if (!isDrawing) {
         startNewPolygon(newPoint);
      } else {
         continueOrFinishPolygon(newPoint);
      }
   };

   // Polygon Drawing Logic
   const startNewPolygon = (point: Point) => {
      if (dispatch) {
         dispatch({ type: 'SET_DRAWING', isDrawing: true });
         dispatch({ type: 'SET_CURRENT_POINTS', points: [point] });
         // dispatch({ type: 'SET_SELECTED_POLYGON', id: [] });
      }
   };

   const calculatePolygonStats = (points: Point[]) => {
      const pointsArray = points.map((p) => [p.x, p.y] as [number, number]);
      const pointsInPolygon = data.filter((d) => {
         const testPoint: [number, number] = [xScale(d.x), yScale(d.y)];
         return d3.polygonContains(pointsArray, testPoint);
      });

      return {
         count: pointsInPolygon.length,
         percentage: Number(((pointsInPolygon.length / data.length) * 100).toFixed(1))
      };
   };

   const continueOrFinishPolygon = (point: Point) => {
      const startPoint = currentPoints[0];
      const distance = Math.hypot(startPoint.x - point.x, startPoint.y - point.y);

      if (distance < 10 && currentPoints.length > 2) {
         const stats = calculatePolygonStats(currentPoints);
         const newPolygon: Polygon = {
            id: Date.now(),
            label: `Group-${polygons.length + 1}`,
            points: currentPoints,
            isVisible: true,
            data: {
               count: stats.count,
               percentage: stats.percentage
            }
         };
         dispatch({ type: 'SET_DRAWING', isDrawing: false });
         dispatch({ type: 'SET_POLYGONS', polygons: [...polygons, newPolygon] });
         dispatch({ type: 'SET_CURRENT_POINTS', points: [] });
      } else {
         dispatch({ type: 'SET_CURRENT_POINTS', points: [...currentPoints, point] });
      }
   };

   // Update Functions
   const updatePolygons = (
      close: boolean,
      polygon: d3.Selection<SVGPathElement, unknown, null, undefined>,
      finishedPolygonsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
   ) => {
      renderFinishedPolygons(finishedPolygonsGroup);
      renderCurrentPolygon(close, polygon);
   };

   const renderFinishedPolygons = (group: d3.Selection<SVGGElement, unknown, null, undefined>) => {
      const lineGenerator = d3
         .line<Point>()
         .x((d) => d.x)
         .y((d) => d.y);

      // Create polygon groups with pointer-events
      const polygonGroups = group
         .selectAll('g.polygon-group')
         .data(polygons)
         .join('g')
         .attr('class', 'polygon-group')
         .style('pointer-events', 'all')
         .style('cursor', 'pointer')
         .style('display', (d) => (d.isVisible ? 'block' : 'none'));

      // Helper function to convert hex to rgba with opacity
      const hexToRgba = (hex: string, opacity: number) => {
         const r = parseInt(hex.slice(1, 3), 16);
         const g = parseInt(hex.slice(3, 5), 16);
         const b = parseInt(hex.slice(5, 7), 16);
         return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };

      // Modify polygon paths color handling
      polygonGroups
         .selectAll('path.finished-polygon')
         .data((d) => [d])
         .join('path')
         .attr('class', 'finished-polygon')
         .style('pointer-events', () => (isDrawing ? 'none' : 'all'))
         .attr('fill', (d) => {
            if (d.color) {
               return hexToRgba(d.color, 0.2);
            }
            return 'rgba(128, 128, 128, 0.2)';
         })
         .attr('stroke', (d) => {
            if (selectedPolygonId.includes(d.id)) {
               return 'rgba(255, 0, 0, 0.2)';
            }
            if (d.color) {
               return hexToRgba(d.color, 0.4);
            }
            return 'rgba(128, 128, 128, 0.4)';
         })
         .attr('stroke-width', (d) => {
            if (selectedPolygonId.includes(d.id)) {
               return 10;
            }
            return 3;
         })
         .style('stroke-dasharray', (d) => {
            switch (d.line) {
               case 'dashed':
                  return '5,5';
               case 'dotted':
                  return '2,2';
               default:
                  return 'none';
            }
         })
         .attr('d', (d) => lineGenerator(d.points) + 'Z')
         .on('mousedown', (event: MouseEvent, d) => {
            event.stopPropagation();
            handlePolygonClick(d.id);
         });

      // Update labels with editing functionality
      polygonGroups
         .selectAll('g.label-container')
         .data((d) => [d])
         .join('g')
         .attr('class', 'label-container')
         .each(function (d) {
            const container = d3.select(this);
            const points = d.points.map((p) => [p.x, p.y]);
            const centroid = d3.polygonCentroid(points as [number, number][]);

            const labelGroup = container
               .selectAll('g.label-group')
               .data([d])
               .join('g')
               .attr('class', 'label-group');

            // Add the label text
            labelGroup
               .selectAll('text.polygon-label')
               .data([d])
               .join('text')
               .attr('class', 'polygon-label')
               .attr('x', centroid[0])
               .attr('y', centroid[1] - 10)
               .attr('text-anchor', 'middle')
               .attr('dominant-baseline', 'middle')
               .attr('fill', 'white')
               .attr('font-size', '14px')
               .attr('font-weight', 'bold')
               .style('user-select', 'none')
               .style('-webkit-user-select', 'none')
               .style('-moz-user-select', 'none')
               .text(d.label);

            // Add count text
            labelGroup
               .selectAll('text.count-label')
               .data([d])
               .join('text')
               .attr('class', 'count-label')
               .attr('x', centroid[0])
               .attr('y', centroid[1] + 10)
               .attr('text-anchor', 'middle')
               .attr('dominant-baseline', 'middle')
               .attr('fill', 'black')
               .attr('font-size', '12px')
               .style('user-select', 'none')
               .style('-webkit-user-select', 'none')
               .style('-moz-user-select', 'none')
               // .text((d) => `n = ${d.data.count} (${d.data.percentage}%)`);

            // Add edit button if polygon is selected
            // if (selectedPolygonId.includes(d.id)) {
            //    labelGroup
            //       .selectAll('text.edit-button')
            //       .data([d])
            //       .join('text')
            //       .attr('class', 'edit-button')
            //       .attr('x', centroid[0] + 35)
            //       .attr('y', centroid[1] - 6)
            //       .attr('fill', 'black')
            //       .attr('font-size', '14px')
            //       .style('cursor', 'pointer')
            //       .style('pointer-events', 'all')
            //       .style('user-select', 'none')
            //       .text('✎')
            //       .on('mousedown', (event: MouseEvent, d) => {
            //          event.preventDefault();
            //          event.stopPropagation();
            //          dispatch({
            //             type: 'SET_SHOW_POPUP',
            //             show: { id: d.id, value: true },
            //          });
            //       });
            // }

            // Add delete button if polygon is selected
            // if (selectedPolygonId.includes(d.id)) {
            //    labelGroup
            //       .selectAll('text.delete-button')
            //       .data([d])
            //       .join('text')
            //       .attr('class', 'delete-button')
            //       .attr('x', centroid[0] + 60)
            //       .attr('y', centroid[1] - 6)
            //       .attr('text-anchor', 'middle')
            //       .attr('fill', 'black')
            //       .attr('font-size', '16px')
            //       .style('cursor', 'pointer')
            //       .style('pointer-events', 'all')
            //       .style('user-select', 'none')
            //       .text('×')
            //       .on('mousedown', (event: MouseEvent) => {
            //          event.preventDefault();
            //          event.stopPropagation();
            //          dispatch({ type: 'DELETE_POLYGON', id: d.id });
            //       });
            // }
         });

      // Update vertices to use points from new Polygon type
      renderPolygonVertices(polygonGroups);
   };

   const renderPolygonVertices = (
      groups: d3.Selection<SVGGElement | d3.BaseType, Polygon, SVGGElement, unknown>
   ) => {
      groups
         .selectAll('circle.vertex')
         .data((d) => d.points.map((point) => ({ ...point, polygon: d })))
         .join('circle')
         .attr('class', 'vertex')
         .attr('cx', (d) => d.x)
         .attr('cy', (d) => d.y)
         .attr('r', 3)
         .attr('fill', (d) => d.polygon.color || 'white')
         .attr('fill-opacity', '0.2')
         .attr('stroke', 'none')
         .attr('is-handle', 'true')
         .style('cursor', 'pointer');
   };

   const renderCurrentPolygon = (
      close: boolean,
      polygon: d3.Selection<SVGPathElement, unknown, null, undefined>
   ) => {
      if (currentPoints.length === 0) return;

      const lineGenerator = d3
         .line<Point>()
         .x((d) => d.x)
         .y((d) => d.y);

      polygon.attr('d', lineGenerator(currentPoints) + (close ? 'Z' : ''));
      renderCurrentVertices();
   };

   const renderCurrentVertices = () => {
      const circles = g
         .select('.drawing-group')
         .selectAll<SVGCircleElement, Point>('circle.vertex')
         .data(currentPoints);

      circles.exit().remove();

      circles
         .enter()
         .append('circle')
         .attr('class', 'vertex')
         .merge(circles as d3.Selection<SVGCircleElement, Point, SVGGElement, unknown>)
         .attr('cx', (d) => d.x)
         .attr('cy', (d) => d.y)
         .attr('r', 4)
         .attr('fill', 'white') // Changed to black
         .attr('fill-opacity', '0.8') // Set opacity to 0.8
         .attr('stroke', 'none') // Removed stroke
         .attr('is-handle', 'true')
         .style('cursor', 'pointer');
   };

   // Event Setup and Cleanup
   const attachEventListeners = (
      svg: SVGSVGElement,
      drawingGroup: d3.Selection<SVGGElement, unknown, null, undefined>
   ) => {
      const previewLine = drawingGroup.select<SVGLineElement>('line.preview');
      d3.select(svg)
         .on('mousemove', (event) => handleMouseMove(event, previewLine))
         .on('mousedown', handleMouseDown);
   };

   const cleanupDrawing = (
      svg: SVGSVGElement,
      drawingGroup: d3.Selection<SVGGElement, unknown, null, undefined>
   ) => {
      d3.select(svg).on('mousemove', null).on('mousedown', null);
      drawingGroup.remove();
   };

   // Add new function to handle polygon selection
   const handlePolygonClick = (id: number) => {
      if (isDrawing) return;
      // const isSelected = selectedPolygonId.includes(id);

      dispatch({
         type: 'SET_SELECTED_POLYGON',
         id: id, // Keep the null for removing selection
      });
   };

   // Add new function to handle polygon updates
   const handlePolygonUpdate = (
      id: number,
      newLabel: string,
      newColor: string,
      newLine: string,
      newDot: string
   ) => {
      dispatch({
         type: 'UPDATE_POLYGON',
         id,
         newLabel,
         newColor,
         line: newLine,
         dot: newDot,
      });
      dispatch({
         type: 'SET_SHOW_POPUP',
         show: { id: null, value: false },
      });
   };

   return (
      <>
         {showPopup.value && (
            <PopupEditor
               label={polygons.find((p) => p.id === showPopup.id)?.label || ''}
               color={polygons.find((p) => p.id === showPopup.id)?.color || '#808080'}
               line={polygons.find((p) => p.id === showPopup.id)?.line || 'solid'}
               dot={polygons.find((p) => p.id === showPopup.id)?.dot || '#ffffff'}
               onSave={(newLabel, newColor, newLine, newDot) =>
                  handlePolygonUpdate(showPopup.id, newLabel, newColor, newLine, newDot)
               }
               onClose={() =>
                  dispatch({
                     type: 'SET_SHOW_POPUP',
                     show: { id: null, value: false },
                  })
               }
            />
         )}
      </>
   );
}
