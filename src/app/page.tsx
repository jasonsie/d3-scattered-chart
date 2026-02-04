'use client';

import { ChartSelectionProvider } from '@/contexts/ChartSelectionContext';
import { ChartUIProvider } from '@/contexts/ChartUIContext';
import Chart from '@/components/Chart';
import styles from '@/styles/page.module.css';
import Sidebar from '@/components/Sidebar';
import { ViewportHandler } from '@/components/ViewportHandler';

export default function Home() {
  return (
    <ChartSelectionProvider>
      <ChartUIProvider>
        <ViewportHandler>
          <div className={styles.page}>
            <main className={styles.main}>
              <div className={styles.title}>Cell Distribution (CD45+)</div>
              <div className={styles.chartContainer}>
                <div className={styles.chartBackground}>
                  <Chart />
                </div>
                <Sidebar />
              </div>
            </main>
          </div>
        </ViewportHandler>
      </ChartUIProvider>
    </ChartSelectionProvider>
  );
}
