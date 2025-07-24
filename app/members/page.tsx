import { auth } from '@/auth';
import { UserRole, MemberStatus } from '@prisma/client';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getMemberStatusDisplayName } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Üzvlər',
  description:
    'Brigada İcmasının üzvlərinin siyahısı və profil məlumatları. İcma üzvləri ilə əlaqə saxlayın və onların fəaliyyətləri barədə məlumat əldə edin.',
  keywords: [
    'Brigada üzvləri',
    'icma üzvləri',
    'üzv profili',
    'əlaqə məlumatları',
    'icma liderlər',
    'komanda üzvləri',
    'sosial şəbəkələr',
    'bio məlumatları',
    'icma şəbəkəsi',
  ],
  openGraph: {
    title: 'Üzvlər - Brigada Portal',
    description: 'Brigada İcmasının üzvlərinin profil məlumatları və əlaqə vasitələri.',
    url: '/members',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Brigada Portal Üzvlər',
      },
    ],
  },
  twitter: {
    title: 'Üzvlər - Brigada Portal',
    description: 'Brigada İcmasının üzvlərinin profil məlumatları.',
  },
  alternates: {
    canonical: '/members',
  },
};

interface SearchParams {
  search?: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusColor = (status: MemberStatus) => {
  switch (status) {
    case MemberStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case MemberStatus.INACTIVE:
      return 'bg-gray-100 text-gray-800';
    case MemberStatus.BANNED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default async function MembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const isAdmin = session.user.roles.includes(UserRole.ADMIN);

  // Build query conditions for server-side filtering
  const whereConditions: {
    OR?: Array<{ [key: string]: { contains: string; mode: 'insensitive' } }>;
    status?: MemberStatus;
  } = {};

  if (resolvedSearchParams.search) {
    whereConditions.OR = [
      { name: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { email: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { title: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { organization: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
    ];
  }

  // Fetch members from database
  const members = await prisma.member.findMany({
    where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    orderBy: { name: 'asc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          roles: true,
        },
      },
    },
  });

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 font-serif'>Üzvlərin siyahısı</h1>
              <p className='text-xl text-gray-700 font-serif leading-relaxed mt-2'>
                İcma üzvlərinin əlaqə məlumatlarını və profillərini gözdən keçirin.
              </p>
            </div>
            {isAdmin && (
              <Link
                href='/members/create'
                className='bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors font-serif inline-flex items-center'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                </svg>
                Üzv əlavə et
              </Link>
            )}
          </div>
        </div>

        {/* Search Form */}
        <div className='mb-8'>
          <form key={`${resolvedSearchParams.search || ''}`} className='space-y-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='relative flex-1'>
                <input
                  type='text'
                  name='search'
                  defaultValue={resolvedSearchParams.search || ''}
                  placeholder='Üzvləri axtar...'
                  className='w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <svg
                  className='absolute left-4 top-3.5 w-5 h-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>

              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='px-6 py-3 bg-blue-600 text-white rounded-lg font-serif hover:bg-blue-700 transition-colors'
                >
                  Axtar
                </button>

                {resolvedSearchParams.search && (
                  <Link
                    href='/members'
                    className='px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-serif hover:bg-gray-200 transition-colors inline-flex items-center'
                  >
                    Təmizlə
                  </Link>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Results Count */}
        <div className='mb-6'>
          <p className='text-gray-600 font-serif'>
            {members.length} üzv tapıldı
            {resolvedSearchParams.search && (
              <span className='ml-2 text-sm'>
                {resolvedSearchParams.search && `• Axtarılan: "${resolvedSearchParams.search}"`}
              </span>
            )}
          </p>
        </div>

        {/* Members Grid */}
        {members.length === 0 ? (
          <div className='text-center py-16'>
            <div className='bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6'>
              <svg className='w-10 h-10 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 font-serif mb-3'>Üzv tapılmadı</h3>
            <p className='text-gray-500 font-serif text-lg mb-4'>
              {resolvedSearchParams.search
                ? 'Axtarış kriteriyalarınızı dəyişdirməyə cəhd edin.'
                : 'Hal-hazırda heç bir üzv mövcud deyil.'}
            </p>
            {resolvedSearchParams.search && (
              <Link href='/members' className='text-blue-600 hover:text-blue-800 font-serif font-medium'>
                Bütün üzvləri gör
              </Link>
            )}
          </div>
        ) : (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {members.map((member) => (
              <div
                key={member.id}
                className='bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden group'
              >
                {/* Card Header with Avatar */}
                <div className='p-6 pb-4'>
                  <div className='flex items-center space-x-4 mb-4'>
                    <div className='flex-shrink-0'>
                      {member.avatarUrl ? (
                        <img
                          className='w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors'
                          src={member.avatarUrl}
                          alt={member.name}
                        />
                      ) : (
                        <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-300 transition-colors shadow-sm'>
                          <span className='text-white font-serif font-bold text-xl'>
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 mb-2'>
                        <h3 className='text-lg font-semibold text-gray-900 font-serif leading-tight'>{member.name}</h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium font-serif whitespace-nowrap ${getStatusColor(member.status)}`}
                        >
                          {getMemberStatusDisplayName(member.status)}
                        </span>
                      </div>

                      {member.title && (
                        <p className='text-sm font-medium text-blue-600 font-serif mb-1'>{member.title}</p>
                      )}

                      {member.organization && <p className='text-sm text-gray-500 font-serif'>{member.organization}</p>}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className='px-6 pb-4'>
                  {/* Contact Info */}
                  <div className='flex items-center text-sm text-gray-600 font-serif mb-3'>
                    <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    <span className='truncate'>{member.email}</span>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className='text-sm text-gray-700 font-serif line-clamp-3 mb-4 leading-relaxed'>{member.bio}</p>
                  )}

                  {/* Social Links */}
                  {(member.instagram || member.linkedin || member.github || member.facebook || member.x) && (
                    <div className='flex items-center space-x-3 mb-4'>
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-pink-500 transition-colors'
                        >
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.292C4.151 14.81 3.621 13.531 3.621 12c0-1.297.49-2.448 1.292-3.323C5.8 7.802 7.078 7.272 8.449 7.272s2.648.53 3.523 1.405c.875.875 1.405 2.226 1.405 3.523s-.53 2.648-1.405 3.523c-.875.875-2.152 1.405-3.523 1.405zm7.138 0c-1.297 0-2.448-.49-3.323-1.292-.875-.886-1.405-2.165-1.405-3.696 0-1.297.49-2.448 1.292-3.323.885-.875 2.164-1.405 3.695-1.405s2.648.53 3.523 1.405c.875.875 1.405 2.226 1.405 3.523s-.53 2.648-1.405 3.523c-.875.875-2.152 1.405-3.523 1.405z' />
                          </svg>
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-blue-600 transition-colors'
                        >
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                          </svg>
                        </a>
                      )}
                      {member.github && (
                        <a
                          href={member.github}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-gray-900 transition-colors'
                        >
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                          </svg>
                        </a>
                      )}
                      {member.facebook && (
                        <a
                          href={member.facebook}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-blue-500 transition-colors'
                        >
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                          </svg>
                        </a>
                      )}
                      {member.x && (
                        <a
                          href={member.x}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-gray-900 transition-colors'
                        >
                          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Join Date */}
                  <div className='flex items-center text-xs text-gray-500 font-serif mb-4'>
                    <svg className='w-4 h-4 mr-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z'
                      />
                    </svg>
                    Qoşuldu: {formatDate(member.createdAt)}
                  </div>
                </div>

                {/* Card Footer */}
                <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
                  <div className='flex justify-between items-center'>
                    <Link
                      href={`/members/${encodeURIComponent(member.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium font-serif rounded-lg transition-colors'
                    >
                      <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                      Profil
                    </Link>
                    <a
                      href={`mailto:${member.email}`}
                      className='inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium font-serif rounded-lg border border-gray-300 transition-colors'
                    >
                      <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                      Əlaqə
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Information */}
        <div className='bg-blue-50 p-6 rounded-lg mt-12'>
          <h2 className='text-xl font-bold text-gray-900 mb-4 font-serif'>Əlaqə Məlumatları</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h3 className='font-medium text-gray-900 font-serif mb-2'>Ümumi Sorğular</h3>
              <p className='text-gray-700 font-serif'>
                E-poçt:{' '}
                <a href='mailto:asadlimehdi25@gmail.com' className='text-blue-700 hover:underline'>
                  asadlimehdi25@gmail.com
                </a>
              </p>
              <p className='text-gray-700 font-serif'>
                Telefon:{' '}
                <a href='tel:+994557908445' className='text-blue-700 hover:underline'>
                  + 994 (55) 790-84-45
                </a>
              </p>
            </div>
            <div>
              <h3 className='font-medium text-gray-900 font-serif mb-2'>Saatlar</h3>
              <p className='text-gray-700 font-serif'>B.E. - C.: 09:00 - 23:00</p>
              <p className='text-gray-700 font-serif'>Həftə sonu: 11:00 - 00:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
