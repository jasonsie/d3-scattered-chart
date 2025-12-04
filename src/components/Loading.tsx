'use client';

/**
 * Loading Component - Plant Circles Animation
 *
 * Displays a full-screen loading overlay with animated plant circles.
 * Based on: https://codepen.io/esdesignstudio/pen/RwQdEZb
 */

import styles from '@/styles/Loading.module.css';
import type { LoadingProps } from '@/types/components';

/**
 * Loading component with plant circles animation
 *
 * @param message - Optional message to display below animation
 */
export default function Loading({ message }: LoadingProps) {
   return (
      <div className={styles.loadingOverlay}>
         <div className={styles.plantCircles}>
            <div className={styles.circle}></div>
            <div className={styles.circle}></div>
            <div className={styles.circle}></div>
         </div>
         {message && <p className={styles.message}>{message}</p>}
      </div>
   );
}
