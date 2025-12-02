'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as d3 from 'd3';
import { loadCsvData } from '@/utils/data/loadCsvData';
import type { ChartData, DataPoint } from '@/types/state';

interface ChartDataContextValue {
  data: ChartData | null;
  loading: boolean;
  error: Error | null;
}

const ChartDataContext = createContext<ChartDataContextValue | null>(null);

/**
 * Hook to access chart data (CSV points, D3 scales, dimensions).
 * Provides read-only access to immutable data loaded once on mount.
 * 
 * @returns Chart data context value with loading and error states
 * @throws Error if used outside ChartDataProvider
 * 
 * @example
 * const { data, loading, error } = useChartData();
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * // Use data.points, data.xScale, data.yScale
 */
export function useChartData() {
  const context = useContext(ChartDataContext);
  if (!context) {
    throw new Error('useChartData must be used within ChartDataProvider');
  }
  return context;
}

interface ChartDataProviderProps {
  children: ReactNode;
}

/**
 * Provider for chart data context.
 * Loads CSV data once on mount and creates D3 scales.
 * Data never mutates after initial load - components subscribing only re-render on load completion.
 */
export function ChartDataProvider({ children }: ChartDataProviderProps) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCsvData()
      .then((cellData) => {
        // Convert CellData to DataPoint with placeholder cluster
        const points: DataPoint[] = cellData.map(d => ({
          x: d.x,
          y: d.y,
          cluster: 'default',
        }));
        
        // Create scales
        const xScale = d3.scaleLinear()
          .domain(d3.extent(points, d => d.x) as [number, number])
          .range([0, 800]);
        
        const yScale = d3.scaleLinear()
          .domain(d3.extent(points, d => d.y) as [number, number])
          .range([600, 0]);
        
        setData({
          points,
          xScale,
          yScale,
          width: 800,
          height: 600,
          margins: { top: 20, right: 20, bottom: 40, left: 40 },
          loading: false,
          error: null,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return (
    <ChartDataContext.Provider value={{ data, loading, error }}>
      {children}
    </ChartDataContext.Provider>
  );
}
