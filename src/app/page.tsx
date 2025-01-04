import { ChartProvider } from '@/contexts/ChartContext';
import Chart from '@/components/Chart';
import styles from '@styles/page.module.css';

export default function Home() {
   return (
      <ChartProvider>
         <div className={styles.page}>
            <main className={styles.main}>
               <div className={styles.title}>Cell Distribution (CD45+)</div>
               <Chart />
            </main>
         </div>
      </ChartProvider>
   );
}
