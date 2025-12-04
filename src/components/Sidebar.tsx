'use client';

import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useChartDispatch, useChartState } from '@/contexts/ChartContext';
import { COLORS } from '@/utils/constants/colors';
import styles from '@/styles/Sidebar.module.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AxisSelector from './AxisSelector';
import UnitScaleControl from './UnitScaleControl';

/**
 * Sidebar component for displaying polygon list and statistics.
 * 
 * Displays a list of all polygons with controls for selection, visibility toggle,
 * editing, and deletion. Shows statistics for selected polygons including OR (union)
 * and AND (intersection) calculations of data points contained within polygons.
 * 
 * State Management:
 * - Uses ChartContext for polygon data and selection state
 * - Calculates statistics dynamically based on selected polygons
 * - Uses D3.js polygonContains for point-in-polygon testing
 * 
 * Interaction Patterns:
 * - Checkbox: Toggle polygon selection for statistics
 * - Eye icon: Toggle polygon visibility on chart
 * - Edit icon: Open PopupEditor for polygon properties
 * - Delete icon: Remove polygon from chart
 * 
 * @returns {JSX.Element} Sidebar with polygon list and statistics
 * 
 * @example
 * // Typically used inside Chart component
 * <Sidebar />
 */
export default function Sidebar() {
   const { polygons, selectedPolygonId, data, scales } = useChartState();
   const dispatch = useChartDispatch();
   const [sum, setSum] = useState<{
      or: { count: number; percentage: number };
      and: { count: number; percentage: number } | null;
   } | null>(null);

   const handleToggle = (id: string) => () => {
      dispatch({ type: 'SET_SELECTED_POLYGON', id });
   };

   const themeIconContainer = {
      minWidth: '10px',
   };

   const themeIcon = {
      width: '100%',
      height: '100%',
      color: 'white',
      fontSize: '12px',
      cursor: 'pointer',
   };

   const calculateSelectedStats = () => {
      if (selectedPolygonId.length === 0 || !scales) return null;

      const selectedPolygons = polygons.filter((p) => selectedPolygonId.includes(p.id));

      // Calculate OR (union)
      const totalPoints = new Set();
      selectedPolygons.forEach((polygon) => {
         const pointsArray = polygon.points.map((p: { x: number; y: number }) => [p.x, p.y] as [number, number]);
         data.forEach((d, index) => {
            const testPoint: [number, number] = [scales.xScale(d.x), scales.yScale(d.y)];
            if (d3.polygonContains(pointsArray, testPoint)) {
               totalPoints.add(index);
            }
         });
      });

      // Calculate AND (intersection)
      const commonPoints = new Set();
      if (selectedPolygons.length > 1) {
         data.forEach((d, index) => {
            const testPoint: [number, number] = [scales.xScale(d.x), scales.yScale(d.y)];
            const isInAll = selectedPolygons.every((polygon) => {
               const pointsArray = polygon.points.map((p: { x: number; y: number }) => [p.x, p.y] as [number, number]);
               return d3.polygonContains(pointsArray, testPoint);
            });
            if (isInAll) commonPoints.add(index);
         });
      }

      return {
         or: {
            count: totalPoints.size,
            percentage: Number(((totalPoints.size / data.length) * 100).toFixed(1)),
         },
         and:
            selectedPolygons.length > 1
               ? {
                    count: commonPoints.size,
                    percentage: Number(((commonPoints.size / data.length) * 100).toFixed(1)),
                 }
               : null,
      };
   };

   useEffect(() => {
      const newStats = calculateSelectedStats();
      setSum(newStats);
   }, [selectedPolygonId, polygons, data, scales]);

   return (
      <List
         sx={{
            width: '100%',
            minWidth: 360,
            height: 600,
            backgroundColor: 'rgba(29, 33, 38, 0.4)',
            borderRadius: '10px',
            border: '1px solid rgba(61, 71, 81, 0.3)',
            borderLeft: 'none',
            padding: '10px',
            color: 'white',
            overflowY: 'auto',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
         }}
      >
         {/* Axis Selection Controls */}
         <ListItem sx={{ paddingBottom: '8px' }}>
            <AxisSelector axis="x" />
         </ListItem>
         <ListItem sx={{ paddingBottom: '8px' }}>
            <AxisSelector axis="y" />
         </ListItem>

         {/* Unit Scale Control */}
         <ListItem sx={{ paddingBottom: '16px' }}>
            <UnitScaleControl />
         </ListItem>

         {/* Polygon List */}
         <div style={{ maxHeight: '300px', overflowY: 'auto', flex: '0 1 auto' }}>
         {polygons.map((polygon) => {
            const labelId = `checkbox-list-label-${polygon.id}`;

            return (
               <ListItem key={polygon.id} disablePadding>
                  <ListItemIcon sx={themeIconContainer} onClick={handleToggle(polygon.id)}>
                     <Checkbox
                        sx={{ color: 'white' }}
                        edge="start"
                        checked={selectedPolygonId.includes(polygon.id)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                     />
                  </ListItemIcon>

                  <ListItemText
                     sx={{ color: 'white', marginLeft: '1rem' }}
                     id={labelId}
                     primary={`${polygon.label}`}
                     secondary={`${polygon.data.count} | ${polygon.data.percentage}%`}
                  />

                  <ListItemIcon
                     sx={themeIconContainer}
                     onClick={() =>
                        dispatch({ type: 'SET_SHOW_POPUP', show: { id: polygon.id, value: true } })
                     }
                  >
                     <IconButton sx={themeIcon}>
                        <EditIcon />
                     </IconButton>
                  </ListItemIcon>

                  <ListItemIcon
                     sx={themeIconContainer}
                     onClick={() =>
                        dispatch({
                           type: 'UPDATE_POLYGON',
                           id: polygon.id,
                           isVisible: !polygon.isVisible,
                        })
                     }
                  >
                     <IconButton sx={themeIcon}>
                        {polygon.isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                     </IconButton>
                  </ListItemIcon>

                  <ListItemIcon
                     sx={themeIconContainer}
                     onClick={() => dispatch({ type: 'DELETE_POLYGON', id: polygon.id })}
                  >
                     <IconButton sx={themeIcon}>
                        <DeleteIcon />
                     </IconButton>
                  </ListItemIcon>
               </ListItem>
            );
         })}
         </div>

         {/* /Selection Summary/ */}
         {selectedPolygonId.length > 0 && (
            <ListItem
               sx={{
                  marginTop: '20px',
                  padding: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '5px',
               }}
            >
               <ListItemText
                  primary="Selection Summary"
                  secondary={
                     <>
                        <span style={{ display: 'block' }}>
                           OR: {sum?.or.count} | ({sum?.or.percentage}%)
                        </span>
                        {sum?.and && (
                           <span style={{ display: 'block' }}>
                              AND: {sum.and.count} | ({sum.and.percentage}%)
                           </span>
                        )}
                     </>
                  }
                  sx={{
                     '& .MuiListItemText-primary': { color: 'white' },
                     '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
               />
            </ListItem>
         )}
      </List>
   );
}
