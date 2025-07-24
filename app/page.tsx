import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RecentUpdates from '@/components/RecentUpdates';

const quickAccessLinks = [
  {
    href: '/docs',
    label: 'Sənədlər',
    active: true,
    description: 'Rəsmi icma sənədlərinə, qanunlara, məcəllələrə və s. keçid edin.',
    Svg: (
      <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
        <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      </div>
    ),
  },
  {
    href: '/members',
    label: 'Üzvlər',
    active: true,
    description: 'İcmanın üzvlər siyahısın gözdən keçirin və rəsmilərlə əlaqə saxlayın.',
    Svg: (
      <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
        <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
          />
        </svg>
      </div>
    ),
  },
  {
    href: '/news',
    label: 'Xəbərlər',
    active: false,
    description: 'İcmanın son xəbərlərini və elanlarını izləyin.',
    Svg: (
      <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4'>
        <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
          />
        </svg>
      </div>
    ),
  },
  {
    href: '/articles',
    label: 'Məqalələr',
    active: false,
    description: 'İcma məsələləri və digər mövzular üzrə dərin məqalələri və ekspert təhlillərini oxuyun.',
    Svg: (
      <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
        <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
          />
        </svg>
      </div>
    ),
  },
];

export default async function HomePage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold font-serif mb-4'>Brigada Portala xoş gəldiniz</h1>
            <p className='text-xl font-serif mb-8 max-w-3xl mx-auto'>
              Sizin rəsmi icma məlumatları, sənədlər, xəbərlər və üzvlərin siyahısı üçün mərkəzi portalınız.
              Təsdiqlənmiş məzmuna daxil olun və son təşəbbüslərimiz və elanlarımızdan xəbərdar olun.
            </p>
            <p className='text-lg font-serif opacity-90'>{session.user.name} xoş gəldiniz!</p>
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <h2 className='text-3xl font-bold text-gray-900 text-center mb-12 font-serif'>Sürətli Keçidlər</h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {quickAccessLinks
            .filter((link) => link.active)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='bg-white p-6 rounded-lg shadow-lg border hover:shadow-xl transition-shadow'
              >
                {link.Svg}
                <h3 className='text-xl font-semibold text-gray-900 mb-2 font-serif'>{link.label}</h3>
                <p className='text-gray-600 font-serif'>{link.description}</p>
              </Link>
            ))}
        </div>
      </div>

      {/* Recent Updates Preview */}
      <RecentUpdates showDocuments={true} showNews={false} showArticles={false} />

      {/* Call to Action */}
      <div className='bg-blue-600 text-white py-16'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold font-serif mb-4'>Kömək lazımdır və suallarınız var?</h2>
          <p className='text-xl font-serif mb-8'>
            Komandamız sizə icma servisləri və portal istifadəsi haqqında suallarınızla bağlı kömək etmək üçün hazırdır.
          </p>
          <Link
            href='/profile'
            className='bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors font-serif'
          >
            Profilinizə keçid edin
          </Link>
        </div>
      </div>
    </div>
  );
}
