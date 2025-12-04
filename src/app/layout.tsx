'use client';

import '../styles/globals.css';
import { GlobalProvider, useGlobalState } from '@/contexts/GlobalContext';
import { ChartProvider } from '@/contexts/ChartContext';
import Loading from '@/components/Loading';
import { ReactNode, useEffect, useState } from 'react';

/**
 * AppContent - Conditionally renders Loading component
 *
 * Must be separate from RootLayout to use useGlobalState hook
 */
function AppContent({ children }: { children: ReactNode }) {
   const { isLoading, loadingMessage } = useGlobalState();
   const [showLoading, setShowLoading] = useState(isLoading);

   useEffect(() => {
      if (isLoading) {
         // Show loading immediately when true
         setShowLoading(true);
      } else {
         // Delay hiding loading by 500ms when false
         const timer = setTimeout(() => {
            setShowLoading(false);
         }, 1500);

         return () => clearTimeout(timer);
      }
   }, [isLoading]);

   return (
      <>
         {showLoading && <Loading message={loadingMessage} />}
         {children}
      </>
   );
}

/**
 * RootLayout - Wraps entire app with context providers
 *
 * Provider hierarchy:
 * 1. GlobalProvider (outermost) - Global loading state
 * 2. ChartProvider - Feature-specific chart state
 * 3. AppContent - Conditionally renders Loading component
 */
export default function RootLayout({
   children,
}: Readonly<{
   children: ReactNode;
}>) {
   return (
      <html lang="en">
         <body suppressHydrationWarning>
            <GlobalProvider>
               <ChartProvider>
                  <AppContent>{children}</AppContent>
               </ChartProvider>
            </GlobalProvider>
         </body>
      </html>
   );
}
