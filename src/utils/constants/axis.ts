/**
 * Axis Configuration Constants
 *
 * Provides type-safe constants for dynamic axis selection feature.
 * Includes all available data properties from CD45_pos.csv.
 */

import type { AxisConfiguration, DataPropertyName, DataPropertyMetadata } from '@/types/state';

/**
 * All available data properties from CSV (in CSV column order)
 *
 * These correspond to the 15 numeric columns in CD45_pos.csv
 */
export const DATA_PROPERTY_NAMES: readonly DataPropertyName[] = [
  'FS INT LIN',
  'SS INT LIN',
  'Kappa-FITC',
  'Lambda-PE',
  'CD10-ECD',
  'CD5-PC5.5',
  'CD200-PC7',
  'CD34-APC',
  'CD38-APC-A700',
  'CD20-APC-A750',
  'CD19-PB',
  'CD45-KrO',
  'FS PEAK LIN',
  'SS PEAK LIN',
] as const;

/**
 * Default axis configuration matching current hardcoded behavior
 *
 * X-Axis: CD45-KrO (Krome Orange fluorescence)
 * Y-Axis: SS INT LIN (Side Scatter Intensity Linear)
 * Unit Scale: 1000 (default scaling factor)
 */
export const DEFAULT_AXIS_CONFIG: AxisConfiguration = {
  xProperty: 'CD45-KrO',
  yProperty: 'SS INT LIN',
  xLabel: 'CD45-KrO',
  yLabel: 'SS INT LIN',
  xUnit: 'KrO',
  yUnit: 'INT LIN',
  unitScale: 1000,
};

/**
 * Parse property name to extract marker and unit components
 *
 * Pattern: "[Marker]-[Unit]" or "[Marker] [Unit]" or "[Marker]_[Unit]"
 * Examples:
 *   - "CD45-KrO" → { marker: "CD45", unit: "KrO" }
 *   - "SS INT LIN" → { marker: "SS", unit: "INT LIN" }
 *
 * @param propertyName - The property name from CSV column header
 * @returns Object with marker and unit strings
 */
export const parsePropertyLabel = (propertyName: string): { marker: string; unit: string } => {
  // Match pattern: text before separator + text after separator
  const match = propertyName.match(/^(.+?)[-_\s](.+)$/);

  if (match) {
    return {
      marker: match[1].trim(),
      unit: match[2].trim(),
    };
  }

  // No separator found - property has no unit
  return {
    marker: propertyName,
    unit: '',
  };
};

/**
 * Generate metadata for a data property
 *
 * @param propertyName - The data property name
 * @returns Metadata object with display information
 */
const generatePropertyMetadata = (propertyName: DataPropertyName): DataPropertyMetadata => {
  const { marker, unit } = parsePropertyLabel(propertyName);

  return {
    propertyName,
    displayLabel: marker,
    unit,
    dataType: 'numeric',
  };
};

/**
 * Precomputed metadata for all data properties
 *
 * Used for consistent UI display across components (dropdowns, labels, etc.)
 */
export const PROPERTY_METADATA: Record<DataPropertyName, DataPropertyMetadata> =
  Object.fromEntries(
    DATA_PROPERTY_NAMES.map(name => [name, generatePropertyMetadata(name)])
  ) as Record<DataPropertyName, DataPropertyMetadata>;
