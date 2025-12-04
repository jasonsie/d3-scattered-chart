'use client';

/**
 * AxisSelector Component - Dropdown for X/Y Axis Selection
 *
 * Provides Material-UI dropdown for selecting data properties to display
 * on x-axis or y-axis. Includes:
 * - Mutual exclusion (can't select same property for both axes)
 * - Polygon retention confirmation dialog
 * - Disabled state during rendering
 */

import { useState, memo } from 'react';
import {
   Select,
   MenuItem,
   FormControl,
   InputLabel,
   FormHelperText,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Button,
} from '@mui/material';
import { useChartState, useChartDispatch } from '@/contexts/ChartContext';
import { DATA_PROPERTY_NAMES, parsePropertyLabel } from '@/utils/constants/axis';
import type { DataPropertyName } from '@/types/state';
import type { AxisSelectorProps } from '@/types/components';

/**
 * AxisSelector - Dropdown component for axis property selection
 *
 * @param axis - Which axis to control ('x' or 'y')
 * @param label - Optional custom label (defaults to "X-Axis" or "Y-Axis")
 * @param className - Optional CSS class name
 */
function AxisSelector({ axis, label, className }: AxisSelectorProps) {
   const { axisConfig, isRendering, polygons } = useChartState();
   const dispatch = useChartDispatch();
   const [dialogOpen, setDialogOpen] = useState(false);
   const [pendingProperty, setPendingProperty] = useState<DataPropertyName | null>(null);

   // Determine current and opposite properties
   const currentProperty = axis === 'x' ? axisConfig.xProperty : axisConfig.yProperty;
   const oppositeProperty = axis === 'x' ? axisConfig.yProperty : axisConfig.xProperty;

   // Labels
   const helperText = label || (axis === 'x' ? 'X-Axis' : 'Y-Axis');
   const fieldLabel = axis === 'x' ? 'x-axis' : 'y-axis';

   // Filter options: exclude opposite axis selection
   const availableOptions = DATA_PROPERTY_NAMES.filter(prop => prop !== oppositeProperty);

   /**
    * Handle dropdown value change
    *
    * If polygons exist, show confirmation dialog.
    * Otherwise, apply change immediately.
    */
   const handleChange = (event: any) => {
      const newProperty = event.target.value as DataPropertyName;

      // If polygons exist, show confirmation dialog
      if (polygons.length > 0) {
         setPendingProperty(newProperty);
         setDialogOpen(true);
      } else {
         applyAxisChange(newProperty);
      }
   };

   /**
    * Apply axis change to context state
    *
    * Parses property label to extract unit,
    * then dispatches SET_AXIS_CONFIG action.
    */
   const applyAxisChange = (newProperty: DataPropertyName) => {
      const { unit } = parsePropertyLabel(newProperty);

      dispatch({
         type: 'SET_AXIS_CONFIG',
         config: axis === 'x'
            ? { xProperty: newProperty, xLabel: newProperty, xUnit: unit }
            : { yProperty: newProperty, yLabel: newProperty, yUnit: unit }
      });
   };

   /**
    * Handle "Keep" button in confirmation dialog
    *
    * Applies axis change and keeps existing polygons.
    */
   const handleKeepPolygons = () => {
      if (pendingProperty) {
         applyAxisChange(pendingProperty);
      }
      setDialogOpen(false);
      setPendingProperty(null);
   };

   /**
    * Handle "Remove" button in confirmation dialog
    *
    * Removes all polygons and applies axis change.
    */
   const handleRemovePolygons = () => {
      dispatch({ type: 'SET_POLYGONS', polygons: [] });
      if (pendingProperty) {
         applyAxisChange(pendingProperty);
      }
      setDialogOpen(false);
      setPendingProperty(null);
   };

   /**
    * Handle dialog close (cancel axis change)
    */
   const handleDialogClose = () => {
      setDialogOpen(false);
      setPendingProperty(null);
   };

   return (
      <>
         <FormControl
            fullWidth
            disabled={isRendering}
            className={className}
            sx={{
               '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
               },
               '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
               },
               '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                     borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                     borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                     borderColor: '#4caf50',
                  },
               },
               '& .MuiSelect-icon': {
                  color: 'rgba(255, 255, 255, 0.7)',
               },
               '& .MuiFormHelperText-root': {
                  color: 'rgba(255, 255, 255, 0.6)',
               },
            }}
         >
            <InputLabel>{helperText}</InputLabel>
            <Select
               value={currentProperty}
               onChange={handleChange}
               label={helperText}
               MenuProps={{
                  PaperProps: {
                     sx: {
                        bgcolor: '#2d2d2d',
                        '& .MuiMenuItem-root': {
                           color: 'white',
                           '&:hover': {
                              bgcolor: 'rgba(76, 175, 80, 0.1)',
                           },
                           '&.Mui-selected': {
                              bgcolor: 'rgba(76, 175, 80, 0.2)',
                              '&:hover': {
                                 bgcolor: 'rgba(76, 175, 80, 0.3)',
                              },
                           },
                        },
                     },
                  },
               }}
            >
               {availableOptions.map(prop => (
                  <MenuItem key={prop} value={prop}>
                     {prop}
                  </MenuItem>
               ))}
            </Select>
            <FormHelperText>{fieldLabel}</FormHelperText>
         </FormControl>

         {/* Polygon retention confirmation dialog */}
         <Dialog open={dialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Keep existing polygons?</DialogTitle>
            <DialogContent>
               Changing axes will reposition data points. Keep polygons in current screen positions?
            </DialogContent>
            <DialogActions>
               <Button onClick={handleRemovePolygons}>Remove</Button>
               <Button onClick={handleKeepPolygons} variant="contained">Keep</Button>
            </DialogActions>
         </Dialog>
      </>
   );
}

// Export memoized component for performance optimization (T039)
export default memo(AxisSelector);
