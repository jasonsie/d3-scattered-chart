'use client';

/**
 * Loading Component - Sphere Border Animation
 *
 * Displays a full-screen loading overlay with animated sphere borders.
 */

import styles from '@/styles/Loading.module.css';
import type { LoadingProps } from '@/types/components';

/**
 * Loading component with sphere border animation
 *
 * @param message - Optional message to display below animation
 */
export default function Loading({ message }: LoadingProps) {
   return (
      <div className={styles.loadingOverlay}>
         <div className={styles.sphereborder}>
            <b></b><b></b><b></b><b></b>
         </div>
         {message && <p className={styles.message}>{message}</p>}
      </div>
   );
}
