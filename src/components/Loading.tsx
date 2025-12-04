'use client';

/**
 * Loading Component - Sphere Border Animation with Framer Motion
 *
 * Displays a full-screen loading overlay with animated sphere borders
 * using Framer Motion for smooth opacity transitions.
 */

import { motion } from 'framer-motion';
import styles from '@/styles/Loading.module.css';
import type { LoadingProps } from '@/types/components';

/**
 * Loading component with sphere border animation and opacity effects
 *
 * @param message - Optional message to display below animation
 */
export default function Loading({ message }: LoadingProps) {
   return (
      <motion.div
         className={styles.loadingOverlay}
         initial={{ opacity: 1 }}
         animate={{ opacity: 0.675 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
         <div className={styles.sphereborder}>
            <motion.b
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 0] }}
               transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0
               }}
            />
            <motion.b
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 0] }}
               transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4
               }}
            />
            <motion.b
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 0] }}
               transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.8
               }}
            />
            <motion.b
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 1, 0] }}
               transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.2
               }}
            />
         </div>
         {message && (
            <motion.p
               className={styles.message}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.2 }}
            >
               {message}
            </motion.p>
         )}
      </motion.div>
   );
}
