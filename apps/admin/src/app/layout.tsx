import type { Metadata } from 'next';
import { Rubik, Nunito_Sans } from 'next/font/google';

import './globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MSPI Admin',
  description: 'MSPI Fire Safety - Administration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${rubik.variable} ${nunitoSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
