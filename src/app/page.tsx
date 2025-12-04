'use client';

import { ChartProvider } from '@/contexts/ChartContext';
import { ChartDataProvider } from '@/contexts/ChartDataContext';
import { ChartSelectionProvider } from '@/contexts/ChartSelectionContext';
import { ChartUIProvider } from '@/contexts/ChartUIContext';
import Chart from '@/components/Chart';
import styles from '@/styles/page.module.css';
import Sidebar from '@/components/Sidebar';

export default function Home() {
   return (
      <ChartProvider>
         <ChartDataProvider>
            <ChartSelectionProvider>
               <ChartUIProvider>
                  <div className={styles.page}>
                     <main className={styles.main}>
                        <div className={styles.title}>Cell Distribution (CD45+)</div>
                        <div className={styles.chartContainer}>
                           <div className={styles.chartBackground} >
                              <Chart />
                           </div>
                           <Sidebar />
                        </div>
                     </main>
                  </div>
               </ChartUIProvider>
            </ChartSelectionProvider>
         </ChartDataProvider>
      </ChartProvider>
   );
}
