import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ConditionalNavbar } from '@/components/ConditionalNavbar';
import { ViewTransitions } from 'next-view-transitions';
import { SessionProvider } from 'next-auth/react';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Government Portal',
  description: 'Official Government Documentation Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang='en'>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SessionProvider>
            <ConditionalNavbar />
            {children}
            <Analytics />
          </SessionProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
