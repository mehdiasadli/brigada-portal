import RegisterForm from '@/components/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qeydiyyat',
  description:
    'Brigada Portal-da qeydiyyatdan keçin. İcma üzvü olmaq və portal xidmətlərindən yararlanmaq üçün yeni hesab yaradın.',
  keywords: [
    'Brigada Portal qeydiyyat',
    'yeni hesab',
    'qeydiyyatdan keç',
    'register',
    'icma üzvlüyü',
    'hesab yaratmaq',
    'portal qeydiyyatı',
  ],
  openGraph: {
    title: 'Qeydiyyat - Brigada Portal',
    description: 'Brigada Portal-da qeydiyyatdan keçin və icma üzvü olun.',
    url: '/register',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Brigada Portal Qeydiyyat',
      },
    ],
  },
  twitter: {
    title: 'Qeydiyyat - Brigada Portal',
    description: 'Brigada Portal-da qeydiyyatdan keçin.',
  },
  robots: {
    index: false, // Don't index registration page
    follow: true,
  },
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
