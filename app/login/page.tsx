import LoginForm from '@/components/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daxil ol',
  description: 'Brigada Portal-a daxil olun. Rəsmi icma portalına giriş üçün öz hesab məlumatlarınızı daxil edin.',
  keywords: [
    'Brigada Portal giriş',
    'daxil ol',
    'login',
    'icma girişi',
    'hesab girişi',
    'portal girişi',
    'authenticate',
  ],
  openGraph: {
    title: 'Daxil ol - Brigada Portal',
    description: 'Brigada Portal-a daxil olun və icma məlumatlarına çatın.',
    url: '/login',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Brigada Portal Daxil ol',
      },
    ],
  },
  twitter: {
    title: 'Daxil ol - Brigada Portal',
    description: 'Brigada Portal-a daxil olun.',
  },
  robots: {
    index: false, // Don't index login page
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
