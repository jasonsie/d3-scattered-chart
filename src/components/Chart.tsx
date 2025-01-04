'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from '@styles/page.module.css';
import Polygon from './Polygon';
import { loadCsvData, CellData } from '@/utils/data/loadCsvData';

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
export default function Chart({ width = 600, height = 600 }: ChartProps) {
   // Refs and State
   const svgRef = useRef<SVGSVGElement>(null);
   const [data, setData] = useState<CellData[]>([]);
   const [selectedPoints, setSelectedPoints] = useState<CellData[]>([]);
   const [groupSelection, setGroupSelection] = useState<d3.Selection<
      SVGGElement,
      unknown,
      null,
      undefined
   > | null>(null);

   // Chart dimensions
   const margin = { top: 2, right: 2, bottom: 2, left: 2 };
   const innerWidth = width - margin.left - margin.right;
   const innerHeight = height - margin.top - margin.bottom;

   // New state for scales
   // Create scales with actual data ranges
   const x = d3.scaleLinear().domain([200, 1000]).range([0, innerWidth]);
   const y = d3.scaleLinear().domain([0, 1000]).range([innerHeight, 0]);

   // Replace random data initialization with CSV loading
   useEffect(() => {
      const fetchData = async () => {
         const csvData = await loadCsvData();
         setData(csvData);
      };
      fetchData();
   }, []);

   // Setup D3 chart
   useEffect(() => {
      if (!svgRef.current || !data.length) return;

      // Setup SVG container
      const svg = setupSVG();
      const g = createChartGroup(svg);

      // Add chart elements
      addAxes(g, x, y);
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
      // Add X axis with class name
      const xAxis = g
         .append('g')
         .attr('class', styles['x-axis'])
         .attr('transform', `translate(0,${innerHeight})`)
         .call(d3.axisBottom(x));

      // Add X axis label
      xAxis
         .append('text')
         .attr('class', 'x-label')
         .attr('x', innerWidth / 2)
         .attr('y', margin.bottom + 40) // Adjust this value to position the label
         .attr('text-anchor', 'middle')
         .attr('fill', 'black')
         .attr('font-size', '14px')
         .text('CD45-KrO');

      // Add Y axis with class name
      const yAxis = g.append('g').attr('class', styles['y-axis']).call(d3.axisLeft(y));

      // Add Y axis label
      yAxis
         .append('text')
         .attr('class', 'y-label')
         .attr('transform', 'rotate(-90)')
         .attr('x', -innerHeight / 2)
         .attr('y', -margin.left - 40) // Adjust this value to position the label
         .attr('text-anchor', 'middle')
         .attr('fill', 'black')
         .attr('font-size', '14px')
         .text('SS INT LIN');
   };

   const addDataPoints = (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      x: d3.ScaleLinear<number, number>,
      y: d3.ScaleLinear<number, number>
   ) => {
      g.selectAll<SVGCircleElement, CellData>('circle.data-point')
         .data(data)
         .join('circle')
         .attr('class', 'data-point')
         .attr('cx', (d) => x(d.x))
         .attr('cy', (d) => y(d.y))
         .attr('r', 2)
         .attr('fill', (d) => (selectedPoints.includes(d) ? 'orange' : 'grey'))
         .attr('fill-opacity', 0.1);
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
                     xScale={x}
                     yScale={y}
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
