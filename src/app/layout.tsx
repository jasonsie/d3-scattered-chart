'use client';

import '../styles/globals.css';
import { GlobalProvider, useGlobalState } from '@/contexts/GlobalContext';
import { ChartProvider } from '@/contexts/ChartContext';
import Loading from '@/components/Loading';
import { ReactNode } from 'react';

/**
 * AppContent - Conditionally renders Loading component
 *
 * Must be separate from RootLayout to use useGlobalState hook
 */
function AppContent({ children }: { children: ReactNode }) {
   const { isLoading, loadingMessage } = useGlobalState();

   return (
      <>
         {isLoading && <Loading message={loadingMessage} />}
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
