'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from '@styles/page.module.css';
import Polygon from './Polygon';

export interface ChartProps {
   width?: number;
   height?: number;
}

/**
 * Chart Component
 *
 * A D3-based scatter plot component that allows polygon-based point selection.
 * Features:
 * - Responsive SVG sizing (80% of viewport)
 * - Scatter plot with random data points
 * - Interactive polygon drawing for point selection
 * - Grid lines and axes for better visualization
 *
 * @param {number} width
 * @param {number} height
 */
export default function Chart({ width = 1000, height = 800 }: ChartProps) {
   // Refs and State
   const svgRef = useRef<SVGSVGElement>(null);
   const [data, setData] = useState<Array<{ x: number; y: number }>>([]);
   const [selectedPoints, setSelectedPoints] = useState<Array<{ x: number; y: number }>>([]);
   const [groupSelection, setGroupSelection] = useState<d3.Selection<
      SVGGElement,
      unknown,
      null,
      undefined
   > | null>(null);

   // Chart dimensions
   const margin = { top: 1, right: 1, bottom: 1, left: 1 };
   const innerWidth = width - margin.left - margin.right;
   const innerHeight = height - margin.top - margin.bottom;

   // Initialize random data
   useEffect(() => {
      setData(
         Array.from({ length: 12000 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
         }))
      );
   }, []);

   // Setup D3 chart
   useEffect(() => {
      if (!svgRef.current || !data.length) return;

      // Create scales
      const x = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

      // Setup SVG container
      const svg = setupSVG();
      const g = createChartGroup(svg);

      // Add chart elements
      addAxes(g, x, y);
      addGridLines(g, x, y);
      addBackgroundRect(g);
      addDataPoints(g, x, y);

      setGroupSelection(g);

      // Cleanup
      return () => {
         svg.selectAll('*').remove();
         setGroupSelection(null);
      };
   }, [data, height, innerHeight, innerWidth, margin.left, margin.top, selectedPoints, width]);

   // Helper functions
   const setupSVG = () => {
      if (!svgRef.current) throw new Error('SVG ref is not initialized');

      const svg = d3
         .select(svgRef.current as SVGSVGElement)
         .attr('width', width)
         .attr('height', height)
         .attr('viewBox', `0 0 ${width} ${height}`)
         .style('overflow', 'visible');

      svg.selectAll('*').remove();
      return svg;
   };

   const createChartGroup = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
      return svg
         .append('g')
         .attr('transform', `translate(${margin.left},${margin.top})`)
         .attr('width', innerWidth)
         .attr('height', innerHeight);
   };

   const addAxes = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      x: d3.ScaleLinear<number, number>,
      y: d3.ScaleLinear<number, number>
   ) => {
      // Add X axis
      g.append('g')
         .attr('transform', `translate(0,${innerHeight})`)
         .call(d3.axisBottom(x))
         .attr('class', 'x-axis');

      // Add Y axis
      g.append('g').call(d3.axisLeft(y)).attr('class', 'y-axis');
   };

   const addGridLines = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      x: d3.ScaleLinear<number, number>,
      y: d3.ScaleLinear<number, number>
   ) => {
      // Add X grid lines
      g.append('g')
         .attr('class', 'grid')
         .selectAll('line')
         .data(x.ticks())
         .join('line')
         .attr('x1', (d) => x(d))
         .attr('x2', (d) => x(d))
         .attr('y1', 0)
         .attr('y2', innerHeight)
         .attr('stroke', '#e0e0e0')
         .attr('stroke-width', 0.5);

      // Add Y grid lines
      g.append('g')
         .attr('class', 'grid')
         .selectAll('line')
         .data(y.ticks())
         .join('line')
         .attr('x1', 0)
         .attr('x2', innerWidth)
         .attr('y1', (d) => y(d))
         .attr('y2', (d) => y(d))
         .attr('stroke', '#e0e0e0')
         .attr('stroke-width', 0.5);
   };

   const addBackgroundRect = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
      g.append('rect')
         .attr('width', innerWidth)
         .attr('height', innerHeight)
         .attr('fill', 'none')
         .attr('pointer-events', 'all');
   };

   const addDataPoints = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      x: d3.ScaleLinear<number, number>,
      y: d3.ScaleLinear<number, number>
   ) => {
      g.selectAll<SVGCircleElement, { x: number; y: number }>('circle.data-point')
         .data(data)
         .join('circle')
         .attr('class', 'data-point')
         .attr('cx', (d) => x(d.x))
         .attr('cy', (d) => y(d.y))
         .attr('r', 3.5)
         .attr('fill', (d) => (selectedPoints.includes(d) ? 'orange' : 'grey'))
         .attr('fill-opacity', 0.2);
   };

   return (
      <div className={styles.container}>
         {data.length > 0 ? (
            <>
               <svg ref={svgRef} />
               {groupSelection && (
                  <Polygon
                     g={groupSelection}
                     onSelectionChange={setSelectedPoints}
                     data={data}
                     xScale={d3.scaleLinear().domain([0, 100]).range([0, innerWidth])}
                     yScale={d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])}
                     margin={margin}
                  />
               )}
            </>
         ) : (
            <div>Loading...</div>
         )}
      </div>
   );
}
