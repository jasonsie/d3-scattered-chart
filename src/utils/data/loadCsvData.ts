import * as d3 from 'd3';
import type { DataPropertyName } from '@/types/state';

/**
 * CellData interface - Represents a single data point with all CSV columns
 *
 * Includes:
 * - x, y: Backward compatibility properties (CD45-KrO, SS INT LIN)
 * - [key: string]: number - Dynamic indexed access for all 15 data properties
 */
export interface CellData {
   x: number;  // CD45-KrO (backward compatibility)
   y: number;  // SS INT LIN (backward compatibility)
   // All CSV columns as indexed properties for dynamic axis access
   [key: string]: number;
}

/**
 * Load CSV data and parse all numeric columns
 *
 * Returns all 14 data properties as accessible fields:
 * - FS INT LIN, SS INT LIN, Kappa-FITC, Lambda-PE, CD10-ECD, CD5-PC5.5,
 * - CD200-PC7, CD34-APC, CD38-APC-A700, CD20-APC-A750, CD19-PB,
 * - CD45-KrO,  FS PEAK LIN, SS PEAK LIN
 */
export const loadCsvData = async (): Promise<CellData[]> => {
   try {
      const data = await d3.csv('/data/CD45_pos.csv');

      // Parse all numeric columns from CSV (T037)
      return data.map(d => {
         const point: CellData = {
            // Backward compatibility
            x: +d['CD45-KrO'],
            y: +d['SS INT LIN'],

            // All 14 data properties
            'FS INT LIN': +d['FS INT LIN'],
            'SS INT LIN': +d['SS INT LIN'],
            'Kappa-FITC': +d['Kappa-FITC'],
            'Lambda-PE': +d['Lambda-PE'],
            'CD10-ECD': +d['CD10-ECD'],
            'CD5-PC5.5': +d['CD5-PC5.5'],
            'CD200-PC7': +d['CD200-PC7'],
            'CD34-APC': +d['CD34-APC'],
            'CD38-APC-A700': +d['CD38-APC-A700'],
            'CD20-APC-A750': +d['CD20-APC-A750'],
            'CD19-PB': +d['CD19-PB'],
            'CD45-KrO': +d['CD45-KrO'],
            'FS PEAK LIN': +d['FS PEAK LIN'],
            'SS PEAK LIN': +d['SS PEAK LIN'],
         };

         return point;
      });
   } catch (error) {
      console.error('Error loading CSV data:', error);
      return [];
   }
}; 