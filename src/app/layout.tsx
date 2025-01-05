'use client';

import '@styles/globals.css';
import { ChartProvider } from '@/contexts/ChartContext';
import Head from 'next/head';

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <Head>
            <title>D3 Brush Example</title>
            <meta name="description" content="D3 Brush Example" />
         </Head>
         <body suppressHydrationWarning>
            <ChartProvider>{children}</ChartProvider>
         </body>
      </html>
   );
}
