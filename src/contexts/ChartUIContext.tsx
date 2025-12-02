'use client';

import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { UIState, DrawMode, ShowPopup } from '@/types/state';

type UIAction =
  | { type: 'OPEN_EDITOR'; payload: number }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_DRAW_MODE'; payload: DrawMode }
  | { type: 'TOGGLE_LABELS' };

type UIDispatch = Dispatch<UIAction>;

const UIStateContext = createContext<UIState | null>(null);
const UIDispatchContext = createContext<UIDispatch | null>(null);

/**
 * Hook to access UI state (editor, sidebar, draw mode, labels).
 * 
 * @returns UI state object
 * @throws Error if used outside ChartUIProvider
 * 
 * @example
 * const { showPopup, drawMode, sidebarExpanded, showLabels } = useChartUI();
 */
export function useChartUI() {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useChartUI must be used within ChartUIProvider');
  }
  return context;
}

/**
 * Hook to access UI dispatch function.
 * 
 * @returns Dispatch function for UI actions
 * @throws Error if used outside ChartUIProvider
 * 
 * @example
 * const dispatch = useChartUIDispatch();
 * dispatch({ type: 'OPEN_EDITOR', payload: 1 });
 * dispatch({ type: 'SET_DRAW_MODE', payload: 'draw' });
 */
export function useChartUIDispatch() {
  const context = useContext(UIDispatchContext);
  if (!context) {
    throw new Error('useChartUIDispatch must be used within ChartUIProvider');
  }
  return context;
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_EDITOR':
      return {
        ...state,
        showPopup: { id: action.payload, value: true },
      };

    case 'CLOSE_EDITOR':
      return {
        ...state,
        showPopup: { id: null, value: false },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarExpanded: !state.sidebarExpanded,
      };

    case 'SET_DRAW_MODE':
      return {
        ...state,
        drawMode: action.payload,
      };

    case 'TOGGLE_LABELS':
      return {
        ...state,
        showLabels: !state.showLabels,
      };

    default:
      return state;
  }
}

const initialState: UIState = {
  showPopup: { id: null, value: false },
  drawMode: 'select',
  sidebarExpanded: true,
  showLabels: true,
};

interface ChartUIProviderProps {
  children: ReactNode;
}

/**
 * Provider for chart UI context.
 * Manages UI control state with reducer pattern for predictable updates.
 */
export function ChartUIProvider({ children }: ChartUIProviderProps) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <UIStateContext.Provider value={state}>
      <UIDispatchContext.Provider value={dispatch}>
        {children}
      </UIDispatchContext.Provider>
    </UIStateContext.Provider>
  );
}
