import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ConditionalNavbar } from '@/components/ConditionalNavbar';
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
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://brigada-portal.vercel.app'),
  title: {
    default: 'Brigada Portal - Rəsmi İcma Portalı',
    template: '%s | Brigada Portal',
  },
  description:
    'Azərbaycan Respublikası Brigada İcmasının rəsmi portalı. Sənədlər, üzvlər, xəbərlər və icma məlumatları. Rəsmi hökumət sənədlərinə çatın və icma fəaliyyətləri barədə məlumat əldə edin.',
  keywords: [
    'Brigada Portal',
    'Azərbaycan',
    'Rəsmi Portal',
    'İcma',
    'Sənədlər',
    'Üzvlər',
    'Hökumət',
    'Qanunlar',
    'Məqalələr',
    'Xəbərlər',
    'Administrasiya',
    'Azerbaijan',
    'Government',
    'Community',
    'Documents',
    'Members',
    'Official Portal',
  ],
  authors: [{ name: 'Brigada Portal Komandası' }],
  creator: 'Brigada Portal',
  publisher: 'Brigada İcması',
  applicationName: 'Brigada Portal',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',

  // Language and locale
  alternates: {
    canonical: '/',
    languages: {
      az: '/',
    },
  },

  // Favicon and Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon1.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'icon', url: '/icon0.svg', type: 'image/svg+xml' }],
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'az_AZ',
    url: '/',
    title: 'Brigada Portal - Rəsmi İcma Portalı',
    description: 'Azərbaycan Respublikası Brigada İcmasının rəsmi portalı. Sənədlər, üzvlər və icma məlumatları.',
    siteName: 'Brigada Portal',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Brigada Portal - Rəsmi İcma Portalı',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Brigada Portal - Rəsmi İcma Portalı',
    description: 'Azərbaycan Respublikası Brigada İcmasının rəsmi portalı.',
    images: ['/og.png'],
    creator: '@brigada_portal',
    site: '@brigada_portal',
  },

  // PWA
  manifest: '/site.webmanifest',

  // Additional Meta
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add your verification codes when available)
  verification: {
    // google: 'your-google-site-verification-code',
    // yandex: 'your-yandex-verification-code',
  },

  // Other
  category: 'government',
  classification: 'government portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <meta name='apple-mobile-web-app-title' content='Portal' />

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <ConditionalNavbar />
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
