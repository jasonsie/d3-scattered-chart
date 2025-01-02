import Chart from '@/components/Chart';
import styles from '@styles/page.module.css';

export default function Home() {
   return (
      <div className={styles.page}>
         <main className={styles.main}>
            <div>Brush Example</div>
            <Chart />
         </main>
      </div>
   );
}
