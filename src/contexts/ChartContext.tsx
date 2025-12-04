'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CellData, loadCsvData } from '@/utils/data/loadCsvData';
import type { Point, Polygon } from '@/types/components';
import type { AxisConfiguration } from '@/types/state';
import { DEFAULT_AXIS_CONFIG } from '@/utils/constants/axis';
import * as d3 from 'd3';
import type { Viewport, CanvasLayer, CoordinateTransform, SpatialIndex } from '@/types/canvas';

// Types
type ShowPopup = 
   | { id: string; value: true }
   | { id: null; value: false };
interface ChartState {
   data: CellData[];
   polygons: Polygon[];
   currentPoints: Point[];
   selectedPolygonId: string[];
   isDrawing: boolean;
   showPopup: ShowPopup;
   loading: boolean;
   checkedPolygons: string[];
   scales: {
      xScale: d3.ScaleLinear<number, number>;
      yScale: d3.ScaleLinear<number, number>;
   } | null;
   // Canvas-specific state
   viewport: Viewport | null;
   spatialIndex: SpatialIndex | null;
   canvasLayers: {
      dataPoints: CanvasLayer | null;
      polygonOverlay: CanvasLayer | null;
   };
   coordinateTransform: CoordinateTransform | null;
   // Axis configuration state
   axisConfig: AxisConfiguration;
   isRendering: boolean;
   // Responsive layout state (Feature: 001-responsive-layout)
   isDrawerOpen: boolean;
   viewportMode: 'mobile' | 'desktop';
   viewportWidth: number;
   viewportHeight: number;
}


type ChartAction =
   | { type: 'INIT'; data: CellData[] }
   | { type: 'SET_POLYGONS'; polygons: Polygon[] }
   | { type: 'SET_CURRENT_POINTS'; points: Point[] }
   | {
        type: 'UPDATE_POLYGON';
        id: string;
        newLabel?: string;
        newColor?: string;
        isVisible?: boolean;
        line?: string;
        dot?: string;
     }
   | { type: 'SET_SELECTED_POLYGON'; id: string  }
   | { type: 'SET_SHOW_POPUP'; show: ShowPopup }
   | { type: 'SET_LOADING'; loading: boolean }
   | { type: 'SET_DRAWING'; isDrawing: boolean }
   | { type: 'DELETE_POLYGON'; id: string }
   | { type: 'SET_SCALES'; scales: { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> } }
   // Canvas-specific actions
   | { type: 'SET_VIEWPORT'; viewport: Viewport }
   | { type: 'SET_CANVAS_LAYERS'; layers: { dataPoints?: CanvasLayer; polygonOverlay?: CanvasLayer } }
   | { type: 'SET_COORDINATE_TRANSFORM'; transform: CoordinateTransform }
   | { type: 'REBUILD_SPATIAL_INDEX'; index: SpatialIndex }
   | { type: 'INVALIDATE_RECT'; rect: DOMRect; layer: 'dataPoints' | 'polygonOverlay' }
   | { type: 'PAN'; deltaX: number; deltaY: number }
   | { type: 'ZOOM'; scale: number; centerX: number; centerY: number }
   // Axis configuration actions
   | { type: 'SET_AXIS_CONFIG'; config: Partial<AxisConfiguration> }
   | { type: 'SET_RENDERING'; isRendering: boolean }
   | { type: 'RESET_VIEWPORT' }
   // Responsive layout actions (Feature: 001-responsive-layout)
   | { type: 'TOGGLE_DRAWER' }
   | { type: 'SET_DRAWER_OPEN'; payload: boolean }
   | { type: 'SET_VIEWPORT_MODE'; payload: { mode: 'mobile' | 'desktop'; width: number; height?: number } }
   | { type: 'SET_VIEWPORT_DIMENSIONS'; payload: { width: number; height: number } };

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
   selectedPolygonId: [],
   isDrawing: false,
   showPopup: { id: null, value: false },
   loading: true,
   checkedPolygons: [],
   scales: null,
   // Canvas-specific initial state
   viewport: null,
   spatialIndex: null,
   canvasLayers: {
      dataPoints: null,
      polygonOverlay: null,
   },
   coordinateTransform: null,
   // Axis configuration initial state
   axisConfig: DEFAULT_AXIS_CONFIG,
   isRendering: false,
   // Responsive layout initial state (Feature: 001-responsive-layout)
   isDrawerOpen: false,
   viewportMode: 'desktop', // SSR-safe default
   viewportWidth: 0,
   viewportHeight: 0,
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
         // Enforce maximum 50 polygons limit (T139)
         const limitedPolygons = action.polygons.slice(0, 50);
         if (action.polygons.length > 50) {
            console.warn(`Maximum polygon limit (50) reached. Only first 50 polygons will be kept.`);
         }
         return { ...state, polygons: limitedPolygons };
      case 'SET_CURRENT_POINTS':
         return { ...state, currentPoints: action.points };
      case 'UPDATE_POLYGON':
         return {
            ...state,
            polygons: state.polygons.map((p) =>
               p.id === action.id
                  ? {
                       ...p,
                       ...(action.newLabel !== undefined && { label: action.newLabel }),
                       ...(action.newColor !== undefined && { color: action.newColor }),
                       ...(action.isVisible !== undefined && { isVisible: action.isVisible }),
                       ...(action.line !== undefined && { line: action.line }),
                       ...(action.dot !== undefined && { dot: action.dot }),
                    }
                  : p
            ),
         };
      case 'SET_SELECTED_POLYGON':
         const newSelectedIds = state.selectedPolygonId.includes(action.id)
            ? state.selectedPolygonId.filter((id) => id !== action.id)
            : [...state.selectedPolygonId, action.id];
         return {
            ...state,
            selectedPolygonId: newSelectedIds,
            checkedPolygons: newSelectedIds
         };
      case 'SET_DRAWING':
         return { ...state, isDrawing: action.isDrawing };
      case 'SET_SHOW_POPUP':
         return { ...state, showPopup: action.show };
      case 'SET_LOADING':
         return { ...state, loading: action.loading };
      case 'DELETE_POLYGON':
         return {
            ...state,
            polygons: state.polygons.filter((p) => p.id !== action.id),
            selectedPolygonId: state.selectedPolygonId.filter((id) => id !== action.id),
         };
      case 'SET_SCALES':
         return { ...state, scales: action.scales };
      // Canvas-specific action handlers
      case 'SET_VIEWPORT':
         return { ...state, viewport: action.viewport };
      case 'SET_CANVAS_LAYERS':
         return {
            ...state,
            canvasLayers: {
               dataPoints: action.layers.dataPoints ?? state.canvasLayers.dataPoints,
               polygonOverlay: action.layers.polygonOverlay ?? state.canvasLayers.polygonOverlay,
            },
         };
      case 'SET_COORDINATE_TRANSFORM':
         return { ...state, coordinateTransform: action.transform };
      case 'REBUILD_SPATIAL_INDEX':
         return { ...state, spatialIndex: action.index };
      case 'INVALIDATE_RECT':
         // Add dirty rect to the specified layer
         return {
            ...state,
            canvasLayers: {
               ...state.canvasLayers,
               [action.layer]: state.canvasLayers[action.layer]
                  ? {
                       ...state.canvasLayers[action.layer]!,
                       dirtyRects: [...state.canvasLayers[action.layer]!.dirtyRects, action.rect],
                    }
                  : null,
            },
         };
      case 'PAN':
         if (!state.viewport) return state;
         return {
            ...state,
            viewport: {
               ...state.viewport,
               translateX: state.viewport.translateX + action.deltaX,
               translateY: state.viewport.translateY + action.deltaY,
            },
         };
      case 'ZOOM':
         if (!state.viewport) return state;
         return {
            ...state,
            viewport: {
               ...state.viewport,
               scale: action.scale,
               // Note: Zoom centering logic will be implemented in the component
            },
         };
      // Axis configuration action handlers
      case 'SET_AXIS_CONFIG':
         return {
            ...state,
            axisConfig: {
               ...state.axisConfig,
               ...action.config,
            },
            // Invalidate scales to trigger rebuild
            scales: null,
         };
      case 'SET_RENDERING':
         return { ...state, isRendering: action.isRendering };
      case 'RESET_VIEWPORT':
         return {
            ...state,
            viewport: state.viewport ? {
               ...state.viewport,
               translateX: 0,
               translateY: 0,
               scale: 1,
            } : null,
         };
      // Responsive layout action handlers (Feature: 001-responsive-layout)
      case 'TOGGLE_DRAWER':
         return {
            ...state,
            isDrawerOpen: !state.isDrawerOpen,
         };
      case 'SET_DRAWER_OPEN':
         return {
            ...state,
            isDrawerOpen: action.payload,
         };
      case 'SET_VIEWPORT_MODE': {
         const { mode, width, height } = action.payload;
         // Auto-close drawer when transitioning from mobile to desktop
         const shouldCloseDrawer = mode === 'desktop' && state.viewportMode === 'mobile' && state.isDrawerOpen;
         return {
            ...state,
            viewportMode: mode,
            viewportWidth: width,
            viewportHeight: height ?? state.viewportHeight,
            isDrawerOpen: shouldCloseDrawer ? false : state.isDrawerOpen,
         };
      }
      case 'SET_VIEWPORT_DIMENSIONS':
         return {
            ...state,
            viewportWidth: action.payload.width,
            viewportHeight: action.payload.height,
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

// Alias for consistency
export function useChart() {
   return useContext(ChartContext);
}

export function useChartDispatch() {
   const dispatch = useContext(ChartDispatchContext);
   if (!dispatch) {
      throw new Error('useChartDispatch must be used within a ChartProvider');
   }
   return dispatch;
}
