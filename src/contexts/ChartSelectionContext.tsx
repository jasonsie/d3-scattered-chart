'use client';

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { SelectionState } from '@/types/state';
import type { Polygon, Point } from '@/types/components';

type SelectionAction =
  | { type: 'START_DRAWING' }
  | { type: 'ADD_POINT'; payload: Point }
  | { type: 'COMPLETE_POLYGON'; payload: Partial<Polygon> }
  | { type: 'CANCEL_DRAWING' }
  | { type: 'SELECT_POLYGON'; payload: string }
  | { type: 'DESELECT_POLYGON'; payload: string }
  | { type: 'UPDATE_POLYGON'; payload: Polygon }
  | { type: 'DELETE_POLYGON'; payload: string }
  | { type: 'SET_HOVERED'; payload: string | null }
  | { type: 'CLEAR_SELECTION' };

type SelectionDispatch = Dispatch<SelectionAction>;

const SelectionStateContext = createContext<SelectionState | null>(null);
const SelectionDispatchContext = createContext<SelectionDispatch | null>(null);

/**
 * Hook to access selection state (polygons, drawing state, hovered polygon).
 * 
 * @returns Selection state object
 * @throws Error if used outside ChartSelectionProvider
 * 
 * @example
 * const { polygons, isDrawing, selectedPolygonId } = useChartSelection();
 */
export function useChartSelection() {
  const context = useContext(SelectionStateContext);
  if (!context) {
    throw new Error('useChartSelection must be used within ChartSelectionProvider');
  }
  return context;
}

/**
 * Hook to access selection dispatch function.
 * 
 * @returns Dispatch function for selection actions
 * @throws Error if used outside ChartSelectionProvider
 * 
 * @example
 * const dispatch = useChartSelectionDispatch();
 * dispatch({ type: 'START_DRAWING' });
 * dispatch({ type: 'ADD_POINT', payload: { x: 100, y: 200 } });
 */
export function useChartSelectionDispatch() {
  const context = useContext(SelectionDispatchContext);
  if (!context) {
    throw new Error('useChartSelectionDispatch must be used within ChartSelectionProvider');
  }
  return context;
}

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'START_DRAWING':
      return {
        ...state,
        isDrawing: true,
        currentPoints: [],
      };

    case 'ADD_POINT':
      return {
        ...state,
        currentPoints: [...state.currentPoints, action.payload],
      };

    case 'COMPLETE_POLYGON':
      const maxId = state.polygons.length > 0 
        ? Math.max(...state.polygons.map(p => parseInt(p.id, 10))) 
        : -1;
      const newPolygon: Polygon = {
        id: String(maxId + 1),
        label: action.payload.label || `Polygon ${state.polygons.length + 1}`,
        points: state.currentPoints,
        color: action.payload.color || '#3b82f6',
        line: action.payload.line || 'solid',
        dot: action.payload.dot || 'circle',
        isVisible: action.payload.isVisible !== undefined ? action.payload.isVisible : true,
        data: {
          count: 0,
          percentage: 0,
        },
      };
      return {
        ...state,
        isDrawing: false,
        polygons: [...state.polygons, newPolygon],
        currentPoints: [],
      };

    case 'CANCEL_DRAWING':
      return {
        ...state,
        isDrawing: false,
        currentPoints: [],
      };

    case 'SELECT_POLYGON':
      return {
        ...state,
        selectedPolygonId: [...state.selectedPolygonId, action.payload],
      };

    case 'DESELECT_POLYGON':
      return {
        ...state,
        selectedPolygonId: state.selectedPolygonId.filter(id => id !== action.payload),
      };

    case 'UPDATE_POLYGON':
      return {
        ...state,
        polygons: state.polygons.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'DELETE_POLYGON':
      return {
        ...state,
        polygons: state.polygons.filter(p => p.id !== action.payload),
        selectedPolygonId: state.selectedPolygonId.filter(id => id !== action.payload),
      };

    case 'SET_HOVERED':
      // Note: hoveredPolygon not in SelectionState type, using selectedPolygonId as proxy
      // Will need to update state.d.ts if hover tracking is needed
      return state;

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedPolygonId: [],
      };

    default:
      return state;
  }
}

const initialState: SelectionState = {
  polygons: [],
  currentPoints: [],
  selectedPolygonId: [],
  isDrawing: false,
  checkedPolygons: [],
};

interface ChartSelectionProviderProps {
  children: ReactNode;
}

/**
 * Provider for chart selection context.
 * Manages polygon selection state with reducer pattern for predictable updates.
 */
export function ChartSelectionProvider({ children }: ChartSelectionProviderProps) {
  const [state, dispatch] = useReducer(selectionReducer, initialState);

  return (
    <SelectionStateContext.Provider value={state}>
      <SelectionDispatchContext.Provider value={dispatch}>
        {children}
      </SelectionDispatchContext.Provider>
    </SelectionStateContext.Provider>
  );
}
