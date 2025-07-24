import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hesab İcmalı Gözlənilir',
  description: 'Hesabınız icmal olunur. Administrasiya tərəfindən təsdiq gözlənilir.',
  openGraph: {
    title: 'Hesab İcmalı - Brigada Portal',
    description: 'Hesabınız icmal olunur və admin təsdiqi gözlənilir.',
    url: '/pending-approval',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Brigada Portal Hesab İcmalı',
      },
    ],
  },
  robots: {
    index: false, // Don't index pending approval page
    follow: false,
  },
};

export default async function PendingApprovalPage() {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect if user has roles (shouldn't be on this page)
  if (session.user.roles && session.user.roles.length > 0) {
    redirect('/');
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
          {/* Icon */}
          <div className='mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6'>
            <svg className='h-10 w-10 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>

          {/* Content */}
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 font-serif mb-4'>Hesabınız İcmal Olunur</h1>

            <div className='space-y-4 text-gray-700 font-serif'>
              <p className='text-lg'>
                Salam, <span className='font-semibold'>{session.user.name}</span>!
              </p>

              <p>
                Hesabınız uğurla yaradıldı, lakin hal-hazırda administrasiya tərəfindən icmal edilir. Hesabınıza tam
                giriş üçün adminlərin təsdiqini gözləyin.
              </p>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-blue-400' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-blue-800'>Gözləmə Prosesi</h3>
                    <div className='mt-2 text-sm text-blue-700'>
                      <ul className='list-disc pl-5 space-y-1'>
                        <li>Administrasiya sizin məlumatlarınızı yoxlayacaq</li>
                        <li>Təsdiq prosesi adətən 1-2 iş günü çəkir</li>
                        <li>Təsdiqdən sonra e-poçt bildirişi alacaqsınız</li>
                        <li>Sonra portala tam giriş əldə edəcəksiniz</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6'>
                <h3 className='text-sm font-medium text-gray-800 mb-2'>Əlaqə Məlumatları</h3>
                <p className='text-sm text-gray-600'>Suallarınız varsa, bizimlə əlaqə saxlayın:</p>
                <div className='mt-2 text-sm text-gray-700'>
                  <p>
                    E-poçt:{' '}
                    <a href='mailto:asadlimehdi25@gmail.com' className='text-blue-600 hover:underline'>
                      asadlimehdi25@gmail.com
                    </a>
                  </p>
                  <p>
                    Telefon:{' '}
                    <a href='tel:+994557908445' className='text-blue-600 hover:underline'>
                      +994 (55) 790-84-45
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-8'>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
