'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CellData, loadCsvData } from '@/utils/data/loadCsvData';
import { Point, Polygon } from '@/components/Polygon';

// Types
interface ChartState {
   data: CellData[];
   selectedPoints: CellData[];
   polygons: Polygon[];
   isDrawing: boolean;
   currentPoints: Point[];
   selectedPolygon: string | null;
   showPopup: boolean;
   loading: boolean;
}

type ChartAction = 
   | { type: 'SET_DATA'; data: CellData[] }
   | { type: 'SET_SELECTED_POINTS'; points: CellData[] }
   | { type: 'SET_POLYGONS'; polygons: Polygon[] }
   | { type: 'UPDATE_POLYGON'; label: string; newLabel: string; newColor: string }
   | { type: 'SET_DRAWING'; isDrawing: boolean }
   | { type: 'SET_CURRENT_POINTS'; points: Point[] }
   | { type: 'SET_SELECTED_POLYGON'; label: string | null }
   | { type: 'SET_SHOW_POPUP'; show: boolean }
   | { type: 'SET_LOADING'; loading: boolean };

// Initial state
const initialState: ChartState = {
   data: [],
   selectedPoints: [],
   polygons: [],
   isDrawing: false,
   currentPoints: [],
   selectedPolygon: null,
   showPopup: false,
   loading: true
};

// Context creation
const ChartContext = createContext<ChartState>(initialState);
const ChartDispatchContext = createContext<React.Dispatch<ChartAction> | null>(null);

// Reducer
function chartReducer(state: ChartState, action: ChartAction): ChartState {
   switch (action.type) {
      case 'SET_DATA':
         return { ...state, data: action.data };
      case 'SET_SELECTED_POINTS':
         return { ...state, selectedPoints: action.points };
      case 'SET_POLYGONS':
         return { ...state, polygons: action.polygons };
      case 'UPDATE_POLYGON':
         return {
            ...state,
            polygons: state.polygons.map(p => 
               p.label === action.label 
                  ? { ...p, label: action.newLabel, color: action.newColor }
                  : p
            )
         };
      case 'SET_DRAWING':
         return { ...state, isDrawing: action.isDrawing };
      case 'SET_CURRENT_POINTS':
         return { ...state, currentPoints: action.points };
      case 'SET_SELECTED_POLYGON':
         return { ...state, selectedPolygon: action.label };
      case 'SET_SHOW_POPUP':
         return { ...state, showPopup: action.show };
      case 'SET_LOADING':
         return { ...state, loading: action.loading };
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
            dispatch({ type: 'SET_DATA', data: csvData });
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
         <ChartDispatchContext.Provider value={dispatch}>
            {children}
         </ChartDispatchContext.Provider>
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