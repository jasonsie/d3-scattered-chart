/**
 * Data Validation Utilities
 *
 * Validates data points for selected axis properties.
 * Filters out null, NaN, and Infinity values.
 */

import type { DataPropertyName } from '@/types/state';

/**
 * CellData interface (from loadCsvData.ts)
 * Represents a single data point with all CSV columns as indexed properties
 */
export interface CellData {
  x: number;
  y: number;
  [key: string]: number;
}

/**
 * Check if a data point has valid values for the selected axis properties
 *
 * Filters out:
 * - null or undefined values
 * - NaN (Not a Number)
 * - Infinity or -Infinity
 *
 * @param d - Data point to validate
 * @param xProp - X-axis property name
 * @param yProp - Y-axis property name
 * @returns true if both axis values are valid numbers
 */
export const isValidDataPoint = (
  d: CellData,
  xProp: DataPropertyName,
  yProp: DataPropertyName
): boolean => {
  const xValue = d[xProp];
  const yValue = d[yProp];

  return (
    xValue != null &&
    yValue != null &&
    !isNaN(xValue) &&
    !isNaN(yValue) &&
    isFinite(xValue) &&
    isFinite(yValue)
  );
};

/**
 * Filter dataset to only valid data points for selected axes
 *
 * @param data - Full dataset
 * @param xProp - X-axis property name
 * @param yProp - Y-axis property name
 * @returns Filtered array of valid data points
 */
export const getValidDataPoints = (
  data: CellData[],
  xProp: DataPropertyName,
  yProp: DataPropertyName
): CellData[] => {
  return data.filter(d => isValidDataPoint(d, xProp, yProp));
};
