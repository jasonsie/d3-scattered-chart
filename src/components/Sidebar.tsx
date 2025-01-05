'use client';

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import { useChartDispatch, useChartState } from '@contexts/ChartContext';

export default function Sidebar() {
   const { polygons, selectedPolygonId } = useChartState();
   const dispatch = useChartDispatch();

   const handleToggle = (id: number) => () => {
      dispatch({ type: 'SET_SELECTED_POLYGON', id });
   };

   return (
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
         {polygons.map((polygon) => {
            const labelId = `checkbox-list-label-${polygon.id}`;

            return (
               <ListItem
                  key={polygon.id}
                  secondaryAction={
                     <IconButton
                        edge="end"
                        aria-label="comments"
                        onClick={() => dispatch({ type: 'DELETE_POLYGON', id: polygon.id })}
                     >
                        <DeleteIcon />
                     </IconButton>
                  }
                  disablePadding
               >
                  <ListItemButton onClick={handleToggle(polygon.id)} >
                     <Checkbox
                        edge="start"
                        checked={selectedPolygonId.includes(polygon.id)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                     />
                  </ListItemButton>
                  <ListItemText id={labelId} primary={`${polygon.label}`} />
                  <ListItemIcon
                     onClick={() =>
                        dispatch({
                           type: 'UPDATE_POLYGON',
                           id: polygon.id,
                           isVisible: !polygon.isVisible,
                        })
                     }
                  >
                     {polygon.isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </ListItemIcon>
               </ListItem>
            );
         })}
      </List>
   );
}
