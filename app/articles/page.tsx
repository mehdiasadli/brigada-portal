import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function ArticlesPage() {
  return redirect('/');

  const featuredPost = {
    id: 'digital-transformation-journey',
    title: 'Our Digital Transformation Journey: Lessons Learned and Future Goals',
    excerpt:
      "A comprehensive look at how we've modernized our government systems over the past two years, challenges faced, and our roadmap for continued innovation.",
    date: 'December 15, 2024',
    author: 'Sarah Johnson',
    authorTitle: 'Chief Information Officer',
    category: 'Technology',
    readTime: '8 min read',
    tags: ['Digital Transformation', 'Technology', 'Innovation'],
  };

  const articles = [
    {
      id: 'improving-citizen-experience',
      title: 'Improving Citizen Experience Through User-Centered Design',
      excerpt:
        'How we implemented user research and design thinking principles to make government services more accessible and intuitive for all citizens.',
      date: 'December 12, 2024',
      author: 'Emily Rodriguez',
      authorTitle: 'Communications Director',
      category: 'User Experience',
      readTime: '5 min read',
      tags: ['UX Design', 'Citizen Services', 'Accessibility'],
    },
    {
      id: 'cybersecurity-best-practices',
      title: 'Cybersecurity Best Practices for Government Organizations',
      excerpt:
        'Essential security measures and protocols that every government agency should implement to protect sensitive data and maintain public trust.',
      date: 'December 10, 2024',
      author: 'Michael Davis',
      authorTitle: 'Legal Counsel',
      category: 'Security',
      readTime: '6 min read',
      tags: ['Cybersecurity', 'Data Protection', 'Compliance'],
    },
    {
      id: 'transparency-in-government',
      title: 'Building Trust Through Transparency and Open Communication',
      excerpt:
        'Strategies for maintaining open dialogue with citizens and ensuring transparent government operations in the digital age.',
      date: 'December 8, 2024',
      author: 'John Smith',
      authorTitle: 'Director of Operations',
      category: 'Governance',
      readTime: '4 min read',
      tags: ['Transparency', 'Communication', 'Public Trust'],
    },
    {
      id: 'budget-planning-insights',
      title: 'Strategic Budget Planning for Government Technology Initiatives',
      excerpt:
        'Best practices for allocating resources and planning technology investments that deliver maximum value to citizens.',
      date: 'December 5, 2024',
      author: 'David Wilson',
      authorTitle: 'Finance Manager',
      category: 'Finance',
      readTime: '7 min read',
      tags: ['Budget Planning', 'Resource Management', 'ROI'],
    },
    {
      id: 'employee-development',
      title: 'Investing in Employee Development for Better Public Service',
      excerpt:
        'How continuous learning and professional development programs improve both employee satisfaction and service delivery quality.',
      date: 'December 3, 2024',
      author: 'Lisa Chen',
      authorTitle: 'Human Resources Director',
      category: 'Human Resources',
      readTime: '5 min read',
      tags: ['Professional Development', 'Training', 'Employee Engagement'],
    },
  ];

  const categories = ['All', 'Technology', 'User Experience', 'Security', 'Governance', 'Finance', 'Human Resources'];

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4 font-serif'>Government Insights & Articles</h1>
          <p className='text-xl text-gray-700 font-serif leading-relaxed'>
            Expert insights, best practices, and thought leadership from our government professionals.
          </p>
        </div>

        {/* Featured Post */}
        <div className='mb-12'>
          <div className='bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-8 border'>
            <div className='flex items-center mb-4'>
              <span className='bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold font-serif mr-3'>
                FEATURED
              </span>
              <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded font-serif'>
                {featuredPost.category}
              </span>
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-4 font-serif'>
              <Link href={`/articles/${featuredPost.id}`} className='hover:text-blue-700 transition-colors'>
                {featuredPost.title}
              </Link>
            </h2>
            <p className='text-gray-700 mb-6 font-serif leading-relaxed text-lg'>{featuredPost.excerpt}</p>
            <div className='flex flex-wrap items-center gap-4 mb-4'>
              <div className='flex items-center'>
                <div className='w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center mr-3'>
                  <span className='text-white font-bold font-serif text-sm'>
                    {featuredPost.author
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <p className='font-medium text-gray-900 font-serif'>{featuredPost.author}</p>
                  <p className='text-gray-600 text-sm font-serif'>{featuredPost.authorTitle}</p>
                </div>
              </div>
              <div className='text-gray-600 text-sm font-serif'>
                {featuredPost.date} • {featuredPost.readTime}
              </div>
            </div>
            <div className='flex flex-wrap gap-2 mb-4'>
              {featuredPost.tags.map((tag) => (
                <span key={tag} className='bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-serif'>
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/articles/${featuredPost.id}`}
              className='inline-flex items-center text-blue-700 font-medium hover:underline font-serif'
            >
              Read Full Article
              <svg className='w-4 h-4 ml-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </Link>
          </div>
        </div>

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

        {/* Articles Posts Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
          {articles.map((article) => (
            <div
              key={article.id}
              className='bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition-shadow'
            >
              <div className='p-6'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded font-serif'>
                    {article.category}
                  </span>
                  <span className='text-gray-500 text-sm font-serif'>{article.readTime}</span>
                </div>
                <h3 className='text-lg font-bold text-gray-900 mb-3 font-serif line-clamp-2'>
                  <Link href={`/articles/${article.id}`} className='hover:text-blue-700 transition-colors'>
                    {article.title}
                  </Link>
                </h3>
                <p className='text-gray-700 mb-4 font-serif text-sm leading-relaxed line-clamp-3'>{article.excerpt}</p>
                <div className='flex flex-wrap gap-1 mb-4'>
                  {article.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className='bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-serif'>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className='flex items-center mb-4'>
                  <div className='w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mr-2'>
                    <span className='text-white font-bold font-serif text-xs'>
                      {article.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className='font-medium text-gray-900 font-serif text-sm'>{article.author}</p>
                    <p className='text-gray-600 text-xs font-serif'>{article.date}</p>
                  </div>
                </div>
                <Link
                  href={`/articles/${article.id}`}
                  className='text-blue-700 font-medium hover:underline font-serif text-sm'
                >
                  Read Article →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className='bg-blue-50 p-8 rounded-lg'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4 font-serif'>Subscribe to Our Articles</h2>
          <p className='text-gray-700 mb-6 font-serif'>
            Get the latest insights and best practices delivered directly to your inbox. Join our community of
            government professionals.
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
