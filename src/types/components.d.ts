import type { CSSProperties } from 'react';

export interface ChartProps {
  width?: number;
  height?: number;
  className?: string;
}

export interface PolygonProps {
  polygon: Polygon;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export interface PopupEditorProps {
  label: string;
  color: string;
  line: string;
  dot: string;
  onSave: (data: PolygonStyle) => void;
  onClose: () => void;
}

export interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export interface PolygonStyle {
  label: string;
  color: string;
  line: string;
  dot: string;
}

export interface Polygon {
  id: string;
  label: string;
  color?: string;
  line?: string;
  dot?: string;
  points: Point[];
  isVisible: boolean;
  data: {
    count: number;
    percentage: number;
  };
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Props for AxisSelector component (dropdown for x/y axis selection)
 */
export interface AxisSelectorProps {
  /** Which axis this selector controls ('x' or 'y') */
  axis: 'x' | 'y';
  /** Optional custom label (defaults to "X-Axis" or "Y-Axis") */
  label?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for UnitScaleControl component (slider for measurement unit scaling)
 */
export interface UnitScaleControlProps {
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for Loading component (plant circles animation)
 */
export interface LoadingProps {
  /** Optional message to display during loading */
  message?: string;
}
