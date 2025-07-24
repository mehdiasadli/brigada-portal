'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Elektron poçt və ya şifrə yanlışdır');
      } else {
        router.push('/profile');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('Giriş zamanı xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        {/* Logo/Header */}
        <div className='flex justify-center'>
          <div className='w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-2xl font-serif'>B</span>
          </div>
        </div>
        <h2 className='mt-6 text-center text-3xl font-bold text-gray-900 font-serif'>Brigada Portal</h2>
        <p className='mt-2 text-center text-sm text-gray-600 font-serif'>Hesabınıza daxil olun</p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-md p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-red-700 font-serif'>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 font-serif'>
                Elektron poçt ünvanı
              </label>
              <div className='mt-1'>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-serif'
                  placeholder='Elektron poçt ünvanınızı daxil edin'
                />
              </div>
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 font-serif'>
                Şifrə
              </label>
              <div className='mt-1'>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-serif'
                  placeholder='Şifrənizi daxil edin'
                />
              </div>
            </div>

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-serif transition-colors'
              >
                {isLoading ? (
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                ) : null}
                {isLoading ? 'Giriş...' : 'Giriş'}
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500 font-serif'>Hesabınız yoxdur?</span>
              </div>
            </div>

            <div className='mt-6 text-center'>
              <Link href='/register' className='text-blue-600 hover:text-blue-500 font-medium font-serif'>
                Yeni hesab yarat
              </Link>
            </div>
          </div>

          {/* Help Information */}
          <div className='mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500 font-serif'>Kömək lazımdır?</span>
              </div>
            </div>

            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600 font-serif'>
                Texniki kömək və ya hesab məsələləri üçün, Baş Adminlə əlaqə saxlayın{' '}
                <a href='mailto:asadlimehdi25@gmail.com' className='text-blue-600 hover:text-blue-500 font-medium'>
                  asadlimehdi25@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center'>
          <p className='text-xs text-gray-500 font-serif'>Bu təhlükəsiz icma sistemidir. İcazəsiz giriş qadağandır.</p>
        </div>
      </div>
    </div>
  );
}
