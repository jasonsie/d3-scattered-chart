'use client';

import { useEffect, useState } from 'react';
import * as d3 from 'd3';

interface PolygonProps {
   g: d3.Selection<SVGGElement, unknown, null, undefined>;
   onSelectionChange?: (selectedPoints: Array<{ x: number; y: number }>) => void;
   data: Array<{ x: number; y: number }>;
   xScale: d3.ScaleLinear<number, number>;
   yScale: d3.ScaleLinear<number, number>;
   margin: { top: number; right: number; bottom: number; left: number };
}

type Point = { x: number; y: number };
type Polygon = { label: string; points: Point[] };
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
export default function Polygon({
   g,
   onSelectionChange,
   data,
   xScale,
   yScale,
   margin,
}: PolygonProps) {
   // State for managing current and completed polygons
   const [isDrawing, setIsDrawing] = useState(false);
   const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
   const [polygons, setPolygons] = useState<Polygon[]>([]);

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
   }, [g, currentPoints, polygons, isDrawing, onSelectionChange, data, xScale, yScale, margin]);

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
         .attr('fill', 'rgba(128, 128, 128, 0.2)') // grey with 0.1 opacity
         .attr('stroke', 'rgba(128, 128, 128, 0.5)') // grey with 0.2 opacity
         .attr('stroke-width', 2);

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
   const startNewPolygon = (point: { x: number; y: number }) => {
      setIsDrawing(true);
      setCurrentPoints([point]);
   };

   const continueOrFinishPolygon = (point: { x: number; y: number }) => {
      const startPoint = currentPoints[0];
      const distance = Math.hypot(startPoint.x - point.x, startPoint.y - point.y);

      if (distance < 10 && currentPoints.length > 2) {
         finishPolygon();
      } else {
         setCurrentPoints([...currentPoints, point]);
      }
   };

   const finishPolygon = () => {
      setIsDrawing(false);
      const newPolygon: Polygon = {
         label: `G${polygons.length + 1}`,
         points: currentPoints
      };
      const newPolygons = [...polygons, newPolygon];
      setPolygons(newPolygons);
      updateSelectedPoints(newPolygons.map(p => p.points));
      setCurrentPoints([]);
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
         .x(d => d.x)
         .y(d => d.y);

      // Create polygon groups
      const polygonGroups = group
         .selectAll('g.polygon-group')
         .data(polygons)
         .join('g')
         .attr('class', 'polygon-group');

      // Render polygon paths
      polygonGroups
         .selectAll('path.finished-polygon')
         .data(d => [d])
         .join('path')
         .attr('class', 'finished-polygon')
         .attr('fill', 'rgba(128, 128, 128, 0.1)')
         .attr('stroke', 'rgba(128, 128, 128, 0.2)')
         .attr('stroke-width', 2)
         .attr('d', d => lineGenerator(d.points) + 'Z');

      // Update labels to use new Polygon type
      polygonGroups
         .selectAll('text.polygon-label')
         .data(d => [d])
         .join('text')
         .attr('class', 'polygon-label')
         .attr('x', d => {
            const points = d.points.map(p => [p.x, p.y]);
            const centroid = d3.polygonCentroid(points as [number, number][]);
            return centroid[0];
         })
         .attr('y', d => {
            const points = d.points.map(p => [p.x, p.y]);
            const centroid = d3.polygonCentroid(points as [number, number][]);
            return centroid[1];
         })
         .attr('text-anchor', 'middle')
         .attr('dominant-baseline', 'middle')
         .attr('fill', 'black')
         .attr('font-size', '14px')
         .attr('font-weight', 'bold')
         .text(d => d.label);

      // Update vertices to use points from new Polygon type
      renderPolygonVertices(polygonGroups);
   };

   const renderPolygonVertices = (
      groups: d3.Selection<SVGGElement | d3.BaseType, Polygon, SVGGElement, unknown>
   ) => {
      groups
         .selectAll('circle.vertex')
         .data(d => d.points)
         .join('circle')
         .attr('class', 'vertex')
         .attr('cx', d => d.x)
         .attr('cy', d => d.y)
         .attr('r', 4)
         .attr('fill', 'black')
         .attr('fill-opacity', '0.1')
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
         .x(d => d.x)
         .y(d => d.y);

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
         .merge(
            circles as d3.Selection<
               SVGCircleElement,
               Point,
               SVGGElement,
               unknown
            >
         )
         .attr('cx', d => d.x)
         .attr('cy', d => d.y)
         .attr('r', 4)
         .attr('fill', 'black') // Changed to black
         .attr('fill-opacity', '0.8') // Set opacity to 0.8
         .attr('stroke', 'none') // Removed stroke
         .attr('is-handle', 'true')
         .style('cursor', 'pointer');
   };

   const updateSelectedPoints = (polygonPoints: Point[][]) => {
      const selectedPoints = data.filter(d => {
         const testPoint: [number, number] = [xScale(d.x), yScale(d.y)];
         return polygonPoints.some(points => {
            const pointsArray = points.map(p => [p.x, p.y] as [number, number]);
            return d3.polygonContains(pointsArray, testPoint);
         });
      });
      onSelectionChange?.(selectedPoints);
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

   return null;
}
