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
