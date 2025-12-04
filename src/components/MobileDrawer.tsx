/**
 * MobileDrawer Component
 * Feature: 001-responsive-layout
 *
 * Bottom sheet drawer for mobile devices using MUI Drawer.
 * Displays sidebar content in a drawer that slides up from the bottom.
 */

'use client';

import { Drawer } from '@mui/material';
import { useChart, useChartDispatch } from '@/contexts/ChartContext';
import { LAYOUT_CONFIG } from '@/constants/layout';
import styles from '@/styles/MobileDrawer.module.css';

interface MobileDrawerProps {
  children: React.ReactNode;
}

export function MobileDrawer({ children }: MobileDrawerProps) {
  const { isDrawerOpen, viewportMode } = useChart();
  const dispatch = useChartDispatch();

  // Only render on mobile
  if (viewportMode !== 'mobile') return null;

  const handleClose = () => {
    dispatch({ type: 'SET_DRAWER_OPEN', payload: false });
  };

  return (
    <Drawer
      anchor="bottom"
      open={isDrawerOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          height: `${LAYOUT_CONFIG.DRAWER_HEIGHT_VH}vh`,
          borderTopLeftRadius: LAYOUT_CONFIG.DRAWER_BORDER_RADIUS,
          borderTopRightRadius: LAYOUT_CONFIG.DRAWER_BORDER_RADIUS,
          overflow: 'hidden',
        },
      }}
      ModalProps={{
        keepMounted: false,
      }}
    >
      <div className={styles.drawerContent}>{children}</div>
    </Drawer>
  );
}
