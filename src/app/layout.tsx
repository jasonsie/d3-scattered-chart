import '@styles/globals.css';
import { ChartProvider } from '@/contexts/ChartContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
   title: 'Ahead Medicine Test',
   description: '2025 Data Visualization Challenge',
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body suppressHydrationWarning>
            <ChartProvider>{children}</ChartProvider>
         </body>
      </html>
   );
}
