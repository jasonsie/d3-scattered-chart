import * as d3 from 'd3';

export interface CellData {
   x: number;  // CD45-KrO
   y: number;  // SS INT LIN
}

export const loadCsvData = async (): Promise<CellData[]> => {
   try {
      const data = await d3.csv('/data/CD45_pos.csv');
      return data.map(d => ({
         x: +d['CD45-KrO'],    // Convert string to number with +
         y: +d['SS INT LIN']
      }));
   } catch (error) {
      console.error('Error loading CSV data:', error);
      return [];
   }
}; 