'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CellData, loadCsvData } from '@/utils/data/loadCsvData';
import { Point, Polygon } from '@/components/Polygon';

// Types
interface ChartState {
   data: CellData[];
   polygons: Polygon[];
   currentPoints: Point[];
   selectedPolygonId: number | null;
   isDrawing: boolean;
   showPopup: boolean;
   loading: boolean;
}

type ChartAction =
   | { type: 'INIT'; data: CellData[] }
   | { type: 'SET_POLYGONS'; polygons: Polygon[] }
   | { type: 'SET_CURRENT_POINTS'; points: Point[] }
   | { type: 'UPDATE_POLYGON'; id: number; newLabel: string; newColor: string }
   | { type: 'SET_SELECTED_POLYGON'; id: number | null }
   | { type: 'SET_SHOW_POPUP'; show: boolean }
   | { type: 'SET_LOADING'; loading: boolean }
   | { type: 'SET_DRAWING'; isDrawing: boolean }
   | { type: 'DELETE_POLYGON'; id: number };

/**
 * Initial state
 * 1. data: Array of cell data
 * 2. polygons: Array of polygons
 * 3. currentPoints: Array of selected points
 * 4. selectedPolygonId: Label of the currently selected polygon
 * 5. showPopup: Boolean indicating if the popup editor is shown
 * 6. loading: Boolean indicating if the data is loading
 **/
const initialState: ChartState = {
   data: [],
   currentPoints: [],
   polygons: [],
   selectedPolygonId: null,
   isDrawing: false,
   showPopup: false,
   loading: true,
};

// Context creation
const ChartContext = createContext<ChartState>(initialState);
const ChartDispatchContext = createContext<React.Dispatch<ChartAction> | null>(null);

// Reducer
function chartReducer(state: ChartState, action: ChartAction): ChartState {
   switch (action.type) {
      case 'INIT':
         return { ...state, data: action.data };
      case 'SET_POLYGONS':
         return { ...state, polygons: action.polygons };
      case 'SET_CURRENT_POINTS':
         return { ...state, currentPoints: action.points };
      case 'UPDATE_POLYGON':
         return {
            ...state,
            polygons: state.polygons.map((p) =>
               p.id === action.id
                  ? { ...p, label: action.newLabel, color: action.newColor }
                  : p
            ),
         };
      case 'SET_SELECTED_POLYGON':
         return { ...state, selectedPolygonId: action.id };
      case 'SET_DRAWING':
         return { ...state, isDrawing: action.isDrawing };
      case 'SET_SHOW_POPUP':
         return { ...state, showPopup: action.show };
      case 'SET_LOADING':
         return { ...state, loading: action.loading };
      case 'DELETE_POLYGON':
         return {
            ...state,
            polygons: state.polygons.filter(p => p.id !== action.id),
            selectedPolygonId: null
         };
      default:
         return state;
   }
}

// Provider component
export function ChartProvider({ children }: { children: ReactNode }) {
   const [state, dispatch] = useReducer(chartReducer, initialState);

   // Move data fetching here
   useEffect(() => {
      const fetchData = async () => {
         dispatch({ type: 'SET_LOADING', loading: true });
         try {
            const csvData = await loadCsvData();
            dispatch({ type: 'INIT', data: csvData });
         } catch (error) {
            console.error('Error loading data:', error);
         } finally {
            dispatch({ type: 'SET_LOADING', loading: false });
         }
      };

      fetchData();
   }, []);

   return (
      <ChartContext.Provider value={state}>
         <ChartDispatchContext.Provider value={dispatch}>{children}</ChartDispatchContext.Provider>
      </ChartContext.Provider>
   );
}

// Custom hooks
export function useChartState() {
   return useContext(ChartContext);
}

export function useChartDispatch() {
   const dispatch = useContext(ChartDispatchContext);
   if (!dispatch) {
      throw new Error('useChartDispatch must be used within a ChartProvider');
   }
   return dispatch;
}
