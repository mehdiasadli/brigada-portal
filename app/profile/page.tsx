import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil',
  description: 'İstifadəçi profili və hesab məlumatları. Profil məlumatlarını redaktə edin və parol dəyişin.',
  keywords: [
    'istifadəçi profili',
    'hesab məlumatları',
    'profil redaktəsi',
    'parol dəyişmək',
    'şəxsi məlumatlar',
    'user profile',
  ],
  openGraph: {
    title: 'Profil - Brigada Portal',
    description: 'İstifadəçi profili və hesab məlumatları.',
    url: '/profile',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Brigada Portal Profil',
      },
    ],
  },
  twitter: {
    title: 'Profil - Brigada Portal',
    description: 'İstifadəçi profili və hesab məlumatları.',
  },
  robots: {
    index: false, // Don't index profile page
    follow: false,
  },
  alternates: {
    canonical: '/profile',
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getRoleBadgeColor(role: string) {
  const colors = {
    ADMIN: 'bg-red-100 text-red-800',
    MODERATOR: 'bg-purple-100 text-purple-800',
    OFFICIAL: 'bg-blue-100 text-blue-800',
    JOURNALIST: 'bg-green-100 text-green-800',
    EDITOR: 'bg-yellow-100 text-yellow-800',
    USER: 'bg-gray-100 text-gray-800',
  };
  return colors[role as keyof typeof colors] || colors.USER;
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user data from database
  const userData = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      member: true,
    },
  });

  if (!userData) {
    redirect('/login');
  }

  const socialLinks = [
    {
      platform: 'instagram',
      url: userData.member?.instagram,
    },
    {
      platform: 'github',
      url: userData.member?.github,
    },
    {
      platform: 'facebook',
      url: userData.member?.facebook,
    },
    {
      platform: 'x',
      url: userData.member?.x,
    },
    {
      platform: 'linkedin',
      url: userData.member?.linkedin,
    },
  ].filter((link) => link.url);

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Breadcrumb */}
        <nav className='mb-8'>
          <div className='flex items-center space-x-2 text-sm font-serif'>
            <Link href='/' className='text-blue-700 hover:underline'>
              Əsas səhifə
            </Link>
            <span className='text-gray-400'>/</span>
            <span className='text-gray-600'>Profil</span>
          </div>
        </nav>

        {/* Header */}
        <div className='bg-gray-50 rounded-lg p-8 mb-8 border'>
          <div className='flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6'>
            <div className='w-32 h-32 bg-blue-700 rounded-full flex items-center justify-center'>
              {userData.member?.avatarUrl ? (
                <img
                  src={userData.member.avatarUrl}
                  alt={userData.name}
                  className='w-32 h-32 rounded-full object-cover'
                />
              ) : (
                <span className='text-white text-4xl font-bold font-serif'>
                  {userData.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </span>
              )}
            </div>
            <div className='flex-1 text-center md:text-left'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2 font-serif'>{userData.name}</h1>
              {userData.member && (
                <>
                  <p className='text-xl text-blue-700 font-medium mb-1 font-serif'>{userData.member.title}</p>
                  <p className='text-gray-600 font-serif mb-4'>{userData.member.organization}</p>
                </>
              )}

              {/* Roles */}
              <div className='flex flex-wrap gap-2 mb-6'>
                {userData.roles.map((role: string) => (
                  <span
                    key={role}
                    className={`px-3 py-1 rounded-full text-sm font-medium font-serif ${getRoleBadgeColor(role)}`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 mb-8'>
          <Link
            href='/profile/edit'
            className='bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors font-serif text-center'
          >
            Profili yenilə
          </Link>
          <Link
            href='/profile/change-password'
            className='border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors font-serif text-center'
          >
            Şifrəni dəyiş
          </Link>
        </div>

        {/* Profile Content */}
        <div className='space-y-8'>
          {/* Personal Information */}
          <div className='bg-gray-50 rounded-lg p-6 border'>
            <h2 className='text-xl font-bold text-gray-900 mb-6 font-serif'>Şəxsi Məlumatlar</h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Tam Ad</label>
                <p className='text-gray-900 font-serif'>{userData.name}</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>E-poçt</label>
                <p className='text-gray-900 font-serif'>{userData.email}</p>
              </div>

              {userData.member && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Doğum Tarixi</label>
                    <p className='text-gray-900 font-serif'>
                      {userData.member.dateOfBirth
                        ? formatDate(userData.member.dateOfBirth.toISOString())
                        : 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Doğum Yeri</label>
                    <p className='text-gray-900 font-serif'>{userData.member.placeOfBirth || 'Not provided'}</p>
                  </div>
                </>
              )}

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Bio</label>
                <p className='text-gray-900 font-serif'>{userData.member?.bio || 'No bio provided'}</p>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          {userData.member && (
            <div className='space-y-6'>
              <div className='bg-gray-50 rounded-lg p-6 border'>
                <h2 className='text-xl font-bold text-gray-900 mb-6 font-serif'>Karyera Məlumatları</h2>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Vəzifə</label>
                    <p className='text-gray-900 font-serif'>{userData.member.title || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Təşkilat</label>
                    <p className='text-gray-900 font-serif'>{userData.member.organization || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 font-serif mb-2'>Status</label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium font-serif ${
                        userData.member.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : userData.member.status === 'INACTIVE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {userData.member.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className='bg-gray-50 rounded-lg p-6 border'>
                <h3 className='text-lg font-bold text-gray-900 mb-4 font-serif'>Sosial Şəbəkələr</h3>
                <div className='grid md:grid-cols-2 gap-4'>
                  {socialLinks.length > 0 &&
                    socialLinks.map(({ platform, url }) => (
                      <div key={platform}>
                        <label className='block text-sm font-medium text-gray-700 font-serif mb-2 capitalize'>
                          {platform === 'x' ? 'Twitter/X' : platform}
                        </label>
                        <p className='text-gray-900 font-serif'>
                          {url ? (
                            <a
                              href={url as string}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              {url as string}
                            </a>
                          ) : (
                            <span className='text-gray-400'>Mövcud deyil</span>
                          )}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Information */}
          <div className='bg-gray-50 rounded-lg p-6 border'>
            <h2 className='text-xl font-bold text-gray-900 mb-6 font-serif'>Təhlükəsizlik Məlumatları</h2>
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-3 font-serif'>Hesab Məlumatları</h3>
                <div className='grid md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='font-medium text-gray-700 font-serif'>Hesab Yaradılma Tarixi:</span>
                    <p className='text-gray-900 font-serif'>{formatDate(userData.createdAt.toISOString())}</p>
                  </div>
                  <div>
                    <span className='font-medium text-gray-700 font-serif'>Son Yenilənmə Tarixi:</span>
                    <p className='text-gray-900 font-serif'>{formatDate(userData.updatedAt.toISOString())}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-3 font-serif'>Hesab Rolları</h3>
                <p className='text-sm text-gray-600 font-serif mb-3'>
                  Hesabınıza admin tərəfindən aşağıdakı rollar təyin edilmişdir:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {userData.roles.map((role: string) => (
                    <span
                      key={role}
                      className={`px-3 py-1 rounded-full text-sm font-medium font-serif ${getRoleBadgeColor(role)}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
