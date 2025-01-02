import type { Metadata } from 'next';
import '@styles/globals.css';

export const metadata: Metadata = {
   title: 'D3 Brush Example',
   description: 'D3 Brush Example',
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body>{children}</body>
      </html>
   );
}
