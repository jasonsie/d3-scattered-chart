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
