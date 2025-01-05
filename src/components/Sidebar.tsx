'use client';

import React from 'react';
import {
   List,
   ListItem,
   IconButton,
   Avatar,
   ListItemAvatar,
   ListItemText,
   styled,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';

function generate(element: React.ReactElement<unknown>) {
   return [0, 1, 2].map((value) =>
      React.cloneElement(element, {
         key: value,
      })
   );
}

const Demo = styled('div')(({ theme }) => ({
   backgroundColor: theme.palette.background.paper,
}));

const Sidebar = () => {
   const [dense, setDense] = React.useState(false);
   const [secondary, setSecondary] = React.useState(false);

   return (
      <>
         <Demo>
            <List>
               {generate(
                  <ListItem
                     secondaryAction={
                        <IconButton edge="end" aria-label="delete">
                           <DeleteIcon />
                        </IconButton>
                     }
                  >
                     <ListItemText
                        primary="Single-line item"
                        secondary={secondary ? 'Secondary text' : null}
                     />
                  </ListItem>
               )}
            </List>
         </Demo>
      </>
   );
};

export default Sidebar;
