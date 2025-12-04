import type * as d3 from 'd3';
import type { Polygon, Point } from './components';

export interface ChartData {
  points: DataPoint[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  margins: Margins;
  loading: boolean;
  error: Error | null;
}

export interface DataPoint {
  x: number;
  y: number;
  cluster: string;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SelectionState {
  polygons: Polygon[];
  currentPoints: Point[];
  selectedPolygonId: string[];
  isDrawing: boolean;
  checkedPolygons: string[];
}

export interface UIState {
  showPopup: ShowPopup;
  drawMode: DrawMode;
  sidebarExpanded: boolean;
  showLabels: boolean;
}

export type ShowPopup = 
  | { id: number; value: true }
  | { id: null; value: false };

export type DrawMode = 'select' | 'draw' | 'pan';

/**
 * Available data property names from CSV
 *
 * String literal union type for type-safe axis property selection
 */
export type DataPropertyName =
  | 'FS INT LIN'
  | 'SS INT LIN'
  | 'Kappa-FITC'
  | 'Lambda-PE'
  | 'CD10-ECD'
  | 'CD5-PC5.5'
  | 'CD200-PC7'
  | 'CD34-APC'
  | 'CD38-APC-A700'
  | 'CD20-APC-A750'
  | 'CD19-PB'
  | 'CD45-KrO'
  | 'FS PEAK LIN'
  | 'SS PEAK LIN';

/**
 * Axis configuration for dynamic axis selection
 *
 * Stores current x/y axis properties, labels, units, and scaling factor
 */
export interface AxisConfiguration {
  /** Selected x-axis property name (must match CSV column) */
  xProperty: DataPropertyName;
  /** Selected y-axis property name (must match CSV column) */
  yProperty: DataPropertyName;
  /** Display label for x-axis (derived from property name) */
  xLabel: string;
  /** Display label for y-axis (derived from property name) */
  yLabel: string;
  /** Measurement unit for x-axis (empty string if dimensionless) */
  xUnit: string;
  /** Measurement unit for y-axis (empty string if dimensionless) */
  yUnit: string;
  /** Measurement unit scaling factor (100-2000, default 1000) */
  unitScale: number;
}

/**
 * Metadata about a data property for UI display
 */
export interface DataPropertyMetadata {
  /** Property name (matches CSV column) */
  propertyName: DataPropertyName;
  /** Human-readable label for dropdowns/labels */
  displayLabel: string;
  /** Measurement unit (e.g., "KrO", "INT LIN", empty for dimensionless) */
  unit: string;
  /** Data type (always numeric for this dataset) */
  dataType: 'numeric';
}

/**
 * Global application state (outermost context)
 */
export interface GlobalState {
  /** Global loading state for data operations */
  isLoading: boolean;
  /** Optional message to display during loading */
  loadingMessage?: string;
}
