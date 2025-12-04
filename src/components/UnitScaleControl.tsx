'use client';

/**
 * UnitScaleControl Component - Slider for Measurement Unit Scaling
 *
 * Provides Material-UI slider for adjusting measurement unit scaling factor
 * from 100 to 2000, with default 1000. Updates axis scales without changing
 * data values.
 */

import { memo } from 'react';
import { Slider, Typography, Box } from '@mui/material';
import { useChartState, useChartDispatch } from '@/contexts/ChartContext';
import type { UnitScaleControlProps } from '@/types/components';
import styles from '@/styles/UnitScaleControl.module.css';

/**
 * UnitScaleControl - Slider component for measurement unit scaling
 *
 * @param className - Optional CSS class name
 */
function UnitScaleControl({ className }: UnitScaleControlProps) {
   const { axisConfig, isRendering } = useChartState();
   const dispatch = useChartDispatch();

   /**
    * Handle slider change during drag (optional preview)
    */
   const handleChange = (_: Event, value: number | number[]) => {
      // Could add preview logic here if needed
   };

   /**
    * Handle slider change committed (on release)
    *
    * Dispatches SET_AXIS_CONFIG with new unitScale value
    */
   const handleChangeCommitted = (_: Event | React.SyntheticEvent, value: number | number[]) => {
      dispatch({
         type: 'SET_AXIS_CONFIG',
         config: { unitScale: value as number }
      });
   };

   return (
      <Box className={className} sx={{ width: '100%', px: 2 }}>
         <Typography gutterBottom sx={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>
            Measurement Unit Scale
         </Typography>
         <Slider
            value={axisConfig.unitScale}
            onChange={handleChange}
            onChangeCommitted={handleChangeCommitted}
            min={100}
            max={2000}
            step={100}
            valueLabelDisplay="auto"
            marks={[
               { value: 100, label: '100' },
               { value: 200, label: '200' },
               { value: 400, label: '400' },
               { value: 800, label: '800' },
               { value: 1000, label: '1000' },
               { value: 2000, label: '2000' },
            ]}
            disabled={isRendering}
            sx={{
               color: '#4caf50',
               '& .MuiSlider-markLabel': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
               },
               '& .MuiSlider-valueLabel': {
                  backgroundColor: '#4caf50',
               },
            }}
         />
      </Box>
   );
}

// Export memoized component for performance optimization (T040)
export default memo(UnitScaleControl);
