import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function NewsPage() {
  return redirect('/');

  const breakingNews = [
    {
      id: 'new-policy-announcement',
      title: 'New Documentation Standards Policy Announced',
      excerpt:
        'The administration has announced comprehensive updates to government documentation standards, effective January 2025.',
      date: 'December 16, 2024',
      category: 'Policy',
      isBreaking: true,
      readTime: '3 min read',
    },
    {
      id: 'budget-allocation-2025',
      title: '2025 Budget Allocation for Digital Infrastructure',
      excerpt: 'Significant investment approved for modernizing government digital systems and cybersecurity measures.',
      date: 'December 15, 2024',
      category: 'Budget',
      isBreaking: true,
      readTime: '5 min read',
    },
  ];

  const recentNews = [
    {
      id: 'staff-directory-update',
      title: 'Staff Directory System Enhancement',
      excerpt:
        'New features added to the staff directory system including advanced search and department filtering capabilities.',
      date: 'December 14, 2024',
      category: 'Technology',
      readTime: '2 min read',
    },
    {
      id: 'accessibility-improvements',
      title: 'Portal Accessibility Improvements Completed',
      excerpt:
        'Comprehensive accessibility audit completed with all recommendations implemented for better user experience.',
      date: 'December 12, 2024',
      category: 'Accessibility',
      readTime: '4 min read',
    },
    {
      id: 'quarterly-performance-report',
      title: 'Q4 2024 Performance Report Published',
      excerpt:
        'Detailed performance metrics and achievements for the fourth quarter of 2024 now available for public review.',
      date: 'December 10, 2024',
      category: 'Reports',
      readTime: '6 min read',
    },
    {
      id: 'cybersecurity-training',
      title: 'Mandatory Cybersecurity Training Initiative',
      excerpt:
        'All government personnel required to complete updated cybersecurity awareness training by end of January 2025.',
      date: 'December 8, 2024',
      category: 'Security',
      readTime: '3 min read',
    },
  ];

  const categories = ['All', 'Policy', 'Budget', 'Technology', 'Accessibility', 'Reports', 'Security'];

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4 font-serif'>Government News</h1>
          <p className='text-xl text-gray-700 font-serif leading-relaxed'>
            Stay informed with the latest government announcements, policy updates, and official news.
          </p>
        </div>

        {/* Breaking News */}
        {breakingNews.length > 0 && (
          <div className='mb-12'>
            <div className='flex items-center mb-6'>
              <div className='bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold font-serif mr-3'>
                BREAKING
              </div>
              <h2 className='text-2xl font-bold text-gray-900 font-serif'>Latest Updates</h2>
            </div>
            <div className='grid md:grid-cols-2 gap-6'>
              {breakingNews.map((news) => (
                <div key={news.id} className='bg-red-50 border-l-4 border-red-600 p-6 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded font-serif'>
                      {news.category}
                    </span>
                    <span className='text-gray-500 text-sm font-serif'>{news.readTime}</span>
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2 font-serif'>
                    <Link href={`/news/${news.id}`} className='hover:text-red-700 transition-colors'>
                      {news.title}
                    </Link>
                  </h3>
                  <p className='text-gray-700 mb-3 font-serif leading-relaxed'>{news.excerpt}</p>
                  <div className='flex items-center justify-between text-sm text-gray-600'>
                    <span className='font-serif'>{news.date}</span>
                    <Link href={`/news/${news.id}`} className='text-red-700 font-medium hover:underline font-serif'>
                      Read Full Article →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className='mb-8'>
          <div className='flex flex-wrap gap-2'>
            {categories.map((category) => (
              <button
                key={category}
                className='px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-serif transition-colors'
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Recent News */}
        <div className='mb-12'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 font-serif'>Recent News</h2>
          <div className='space-y-6'>
            {recentNews.map((news) => (
              <div key={news.id} className='bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-shadow'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center mb-2'>
                      <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded font-serif mr-3'>
                        {news.category}
                      </span>
                      <span className='text-gray-500 text-sm font-serif'>{news.readTime}</span>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2 font-serif'>
                      <Link href={`/news/${news.id}`} className='hover:text-blue-700 transition-colors'>
                        {news.title}
                      </Link>
                    </h3>
                    <p className='text-gray-700 mb-3 font-serif leading-relaxed'>{news.excerpt}</p>
                    <div className='flex items-center justify-between text-sm text-gray-600'>
                      <span className='font-serif'>{news.date}</span>
                      <Link href={`/news/${news.id}`} className='text-blue-700 font-medium hover:underline font-serif'>
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className='bg-blue-50 p-8 rounded-lg'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4 font-serif'>Stay Updated</h2>
          <p className='text-gray-700 mb-6 font-serif'>
            Subscribe to receive the latest government news and important announcements directly in your inbox.
          </p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <input
              type='email'
              placeholder='Enter your email address'
              className='flex-1 px-4 py-3 border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <button className='bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors font-serif'>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
