'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Yeni şifrələr uyğun gəlmir');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Şifrə ən az 8 simvol olmalıdır');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (response.ok) {
        // Show success message
        alert('Şifrə uğurla dəyişdirildi. Təhlükəsizlik üçün çıxış ediləcək.');

        // Sign out user for security
        await signOut({
          callbackUrl: '/login',
          redirect: true,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Şifrə dəyişmədə xəta baş verdi');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Şifrə dəyişmədə xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Breadcrumb */}
        <nav className='mb-8'>
          <div className='flex items-center space-x-2 text-sm font-serif'>
            <Link href='/' className='text-blue-700 hover:underline'>
              Əsas səhifə
            </Link>
            <span className='text-gray-400'>/</span>
            <Link href='/profile' className='text-blue-700 hover:underline'>
              Profil
            </Link>
            <span className='text-gray-400'>/</span>
            <span className='text-gray-600'>Şifrəni dəyiş</span>
          </div>
        </nav>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 font-serif'>Şifrəni dəyiş</h1>
          <p className='text-gray-600 mt-2 font-serif'>
            Şifrənizi dəyişmək üçün aşağıdakı formu doldurun. Güclü şifrədən istifadə etdiyinizdən əmin olun.
          </p>
        </div>

        {/* Password Change Form */}
        <div className='bg-gray-50 rounded-lg p-8 border'>
          <form onSubmit={handleSubmit} className='space-y-6'>
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
              <label htmlFor='currentPassword' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Cari Şifrə *
              </label>
              <input
                type='password'
                id='currentPassword'
                name='currentPassword'
                value={formData.currentPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                placeholder='Cari şifrəni daxil edin'
              />
            </div>

            <div>
              <label htmlFor='newPassword' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Yeni Şifrə *
              </label>
              <input
                type='password'
                id='newPassword'
                name='newPassword'
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                disabled={isLoading}
                className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                placeholder='Yeni şifrəni daxil edin'
              />
              <p className='text-sm text-gray-500 mt-1 font-serif'>Şifrə ən az 8 simvol olmalıdır.</p>
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
                Yeni Şifrəni Təsdiq et *
              </label>
              <input
                type='password'
                id='confirmPassword'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className='w-full px-3 py-2 bg-white border border-gray-300 rounded-md font-serif focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                placeholder='Yeni şifrəni təsdiq edin'
              />

              {/* Real-time password match indicator */}
              {formData.confirmPassword && formData.newPassword && (
                <div className='mt-2'>
                  {formData.newPassword === formData.confirmPassword ? (
                    <div className='flex items-center text-green-600 text-sm font-serif'>
                      <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                      </svg>
                      Şifrələr uyğundur
                    </div>
                  ) : (
                    <div className='flex items-center text-red-600 text-sm font-serif'>
                      <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                      Şifrələr uyğun deyil
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className='flex flex-col sm:flex-row gap-3 pt-4'>
              <button
                type='submit'
                disabled={
                  isLoading ||
                  formData.newPassword !== formData.confirmPassword ||
                  !formData.currentPassword ||
                  !formData.newPassword
                }
                className='bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <span className='flex items-center'>
                    <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Şifrə dəyişir...
                  </span>
                ) : (
                  'Şifrəni dəyiş'
                )}
              </button>
              <Link
                href='/profile'
                className='border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors font-serif text-center'
              >
                Ləğv et
              </Link>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className='mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200'>
          <h3 className='text-lg font-medium text-blue-900 mb-3 font-serif'>Şifrə Təhlükəsizliyi Məsləhətləri</h3>
          <ul className='text-sm text-blue-800 space-y-2 font-serif'>
            <li>• Böyük və kiçik hərflər, rəqəmlər və simvolların kombinasiyasından istifadə edin</li>
            <li>• Ad, doğum tarixi və ya ümumi sözlərdən istifadə etməyin</li>
            <li>• Digər hesablardan şifrələri təkrar istifadə etməyin</li>
            <li>• Güclü şifrələri yaradıb saxlayan şifrə menecerindən istifadə edin</li>
            <li>• Şifrənizi daimi olaraq dəyişməyə çalışın</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
