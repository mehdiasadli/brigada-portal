import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserRoleManager from '@/components/UserRoleManager';
import UserDeleteManager from '@/components/UserDeleteManager';
import Link from 'next/link';
import { getMemberProfileUrl } from '@/lib/member-utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İstifadəçi İdarəsi',
  description: 'Brigada Portal istifadəçilərinin idarə edilməsi. İstifadəçi rolları və icazələrinin tənzimlənməsi.',
  keywords: ['istifadəçi idarəsi', 'admin panel', 'user management', 'rol təyini', 'icazələr', 'administrasiya'],
  openGraph: {
    title: 'İstifadəçi İdarəsi - Brigada Portal',
    description: 'Admin paneli - istifadəçi idarəsi və rol təyini.',
    url: '/admin/users',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Brigada Portal Admin Panel',
      },
    ],
  },
  twitter: {
    title: 'İstifadəçi İdarəsi - Brigada Portal',
    description: 'Admin paneli - istifadəçi idarəsi.',
  },
  robots: {
    index: false, // Don't index admin pages
    follow: false,
  },
};

interface SearchParams {
  search?: string;
  role?: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case UserRole.USER:
      return 'İstifadəçi';
    case UserRole.EDITOR:
      return 'Redaktor';
    case UserRole.JOURNALIST:
      return 'Jurnalist';
    case UserRole.OFFICIAL:
      return 'Rəsmi';
    case UserRole.MODERATOR:
      return 'Moderator';
    case UserRole.ADMIN:
      return 'Administrator';
    default:
      return role;
  }
};

const getRoleColor = (roles: UserRole[]) => {
  if (roles.includes(UserRole.ADMIN)) return 'bg-red-100 text-red-800';
  if (roles.includes(UserRole.MODERATOR)) return 'bg-purple-100 text-purple-800';
  if (roles.includes(UserRole.OFFICIAL)) return 'bg-blue-100 text-blue-800';
  if (roles.includes(UserRole.JOURNALIST)) return 'bg-green-100 text-green-800';
  if (roles.includes(UserRole.EDITOR)) return 'bg-yellow-100 text-yellow-800';
  if (roles.includes(UserRole.USER)) return 'bg-gray-100 text-gray-800';
  return 'bg-orange-100 text-orange-800'; // No roles
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.roles.includes(UserRole.ADMIN)) {
    redirect('/');
  }

  // Build query conditions for server-side filtering
  const whereConditions: {
    OR?: Array<{ [key: string]: { contains: string; mode: 'insensitive' } }>;
    roles?: { has?: UserRole; isEmpty?: boolean };
  } = {};

  if (resolvedSearchParams.search) {
    whereConditions.OR = [
      { name: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { email: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
    ];
  }

  if (resolvedSearchParams.role) {
    if (resolvedSearchParams.role === 'none') {
      whereConditions.roles = { isEmpty: true };
    } else {
      whereConditions.roles = { has: resolvedSearchParams.role as UserRole };
    }
  }

  // Fetch users from database
  const users = await prisma.user.findMany({
    where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 font-serif'>İstifadəçi İdarəetməsi</h1>
          <p className='text-xl text-gray-700 font-serif leading-relaxed mt-2'>
            İstifadəçi rollarını idarə edin və hesab statuslarını izləyin.
          </p>
        </div>

        {/* Search and Filter Form */}
        <div className='mb-8'>
          <form key={`${resolvedSearchParams.search || ''}-${resolvedSearchParams.role || ''}`} className='space-y-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='relative flex-1'>
                <input
                  type='text'
                  name='search'
                  defaultValue={resolvedSearchParams.search || ''}
                  placeholder='İstifadəçiləri axtar...'
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

              <select
                name='role'
                defaultValue={resolvedSearchParams.role || ''}
                className='px-4 py-3 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Bütün rollar</option>
                <option value='none'>Rol yoxdur</option>
                <option value={UserRole.USER}>İstifadəçi</option>
                <option value={UserRole.EDITOR}>Redaktor</option>
                <option value={UserRole.JOURNALIST}>Jurnalist</option>
                <option value={UserRole.OFFICIAL}>Rəsmi</option>
                <option value={UserRole.MODERATOR}>Moderator</option>
                <option value={UserRole.ADMIN}>Administrator</option>
              </select>

              <div className='flex gap-2'>
                <button
                  type='submit'
                  className='px-6 py-3 bg-blue-600 text-white rounded-lg font-serif hover:bg-blue-700 transition-colors'
                >
                  Axtar
                </button>

                {(resolvedSearchParams.search || resolvedSearchParams.role) && (
                  <a
                    href='/admin/users'
                    className='px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-serif hover:bg-gray-200 transition-colors inline-flex items-center'
                  >
                    Təmizlə
                  </a>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Results Count */}
        <div className='mb-6'>
          <p className='text-gray-600 font-serif'>
            {users.length} istifadəçi tapıldı
            {resolvedSearchParams.search && (
              <span className='ml-2 text-sm'>• Axtarılan: &quot;{resolvedSearchParams.search}&quot;</span>
            )}
            {resolvedSearchParams.role && (
              <span className='ml-2 text-sm'>
                • Rol:{' '}
                {resolvedSearchParams.role === 'none'
                  ? 'Rol yoxdur'
                  : getRoleDisplayName(resolvedSearchParams.role as UserRole)}
              </span>
            )}
          </p>
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
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
            <h3 className='text-xl font-medium text-gray-900 font-serif mb-3'>İstifadəçi tapılmadı</h3>
            <p className='text-gray-500 font-serif text-lg mb-4'>
              {resolvedSearchParams.search || resolvedSearchParams.role
                ? 'Axtarış kriteriyalarınızı dəyişdirməyə cəhd edin.'
                : 'Hal-hazırda heç bir istifadəçi mövcud deyil.'}
            </p>
          </div>
        ) : (
          <div className='bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif'>
                      İstifadəçi
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif'>
                      Rollar
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif'>
                      Üzv Profili
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif'>
                      Qoşulma Tarixi
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-serif'>
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {users.map((user) => (
                    <tr key={user.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900 font-serif'>{user.name}</div>
                          <div className='text-sm text-gray-500 font-serif'>{user.email}</div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex flex-wrap gap-1'>
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role}
                                className={`px-2 py-1 text-xs font-medium rounded-full font-serif ${getRoleColor([role])}`}
                              >
                                {getRoleDisplayName(role)}
                              </span>
                            ))
                          ) : (
                            <span className='px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 font-serif'>
                              Rol yoxdur
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-serif'>
                        {user.member ? (
                          <div className='flex flex-col space-y-1'>
                            <span className='text-green-600'>✓ Üzv profili var</span>
                            <Link
                              href={getMemberProfileUrl(user.member.name)}
                              className='text-blue-600 hover:text-blue-800 text-xs underline'
                            >
                              Profili gör
                            </Link>
                          </div>
                        ) : (
                          <div className='flex flex-col space-y-1'>
                            <span className='text-gray-400'>Üzv profili yoxdur</span>
                            <Link
                              href={`/members/create?userId=${user.id}&name=${user.name}&email=${user.email}`}
                              className='text-blue-600 hover:text-blue-800 text-xs underline'
                            >
                              Profili yarat
                            </Link>
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-serif'>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex flex-col space-y-3'>
                          <UserRoleManager
                            userId={user.id}
                            currentRoles={user.roles}
                            userName={user.name}
                            currentUserIsTargetUser={user.id === session.user.id}
                          />
                          <UserDeleteManager
                            userId={user.id}
                            userEmail={user.email}
                            userName={user.name}
                            currentUserIsTargetUser={user.id === session.user.id}
                            isAdmin={user.roles.includes(UserRole.ADMIN)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
