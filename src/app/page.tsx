'use client';

import { ChartProvider } from '@/contexts/ChartContext';
import Chart from '@/components/Chart';
import styles from '@styles/page.module.css';
import Sidebar from '@components/Sidebar';

export default function Home() {
   return (
      <ChartProvider>
         <div className={styles.page}>
            <main className={styles.main}>
               <div className={styles.title}>Cell Distribution (CD45+)</div>
               <div className={styles.chartContainer}>
                  <Chart />
                  <Sidebar />
               </div>
            </main>
         </div>
      </ChartProvider>
   );
}
