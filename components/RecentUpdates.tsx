import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface RecentUpdatesProps {
  showNews?: boolean;
  showArticles?: boolean;
  showDocuments?: boolean;
}

export default async function RecentUpdates({
  showNews = false,
  showArticles = false,
  showDocuments = true,
}: RecentUpdatesProps) {
  // Calculate the date 2 weeks ago
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Fetch recent documents
  const recentDocuments = showDocuments
    ? await prisma.document.findMany({
        where: {
          status: 'PUBLISHED',
          createdAt: {
            gte: twoWeeksAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 2,
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          createdAt: true,
          category: true,
        },
      })
    : [];

  // Fetch recent news (when implemented)
  const recentNews = showNews
    ? await prisma.news
        .findMany({
          where: {
            status: 'PUBLISHED',
            createdAt: {
              gte: twoWeeksAgo,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 2,
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            createdAt: true,
          },
        })
        .catch(() => [])
    : [];

  // Fetch recent articles (when implemented)
  const recentArticles = showArticles
    ? await prisma.article
        .findMany({
          where: {
            status: 'PUBLISHED',
            createdAt: {
              gte: twoWeeksAgo,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 2,
          select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            createdAt: true,
          },
        })
        .catch(() => [])
    : [];

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Biraz əvvəl';
    } else if (diffInHours < 24) {
      return `${diffInHours} saat əvvəl`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün əvvəl`;
    }
  };

  // Get border color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'POLICY':
        return 'border-blue-500';
      case 'REGULATION':
        return 'border-red-500';
      case 'GUIDELINE':
        return 'border-green-500';
      case 'REPORT':
        return 'border-purple-500';
      case 'ANNOUNCEMENT':
        return 'border-orange-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className='bg-gray-50 py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 font-serif'>Son Yenilənmələr</h2>
          <p className='text-gray-600 mt-4 font-serif'>Son yenilənmələr üzrə xəbərdar olun.</p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {/* Latest News */}
          {showNews && (
            <div className='bg-white rounded-lg shadow-lg p-6 border'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-gray-900 font-serif'>Son Xəbərlər</h3>
                <Link href='/news' className='text-blue-600 hover:text-blue-800 font-serif text-sm'>
                  Hamısına bax →
                </Link>
              </div>
              <div className='space-y-4'>
                {recentNews.length > 0 ? (
                  recentNews.map((news) => (
                    <div key={news.id} className='border-l-4 border-blue-500 pl-4'>
                      <Link href={`/news/${news.slug}`}>
                        <h4 className='font-medium text-gray-900 font-serif hover:text-blue-600'>{news.title}</h4>
                      </Link>
                      <p className='text-sm text-gray-600 font-serif line-clamp-2'>{news.description}</p>
                      <span className='text-xs text-gray-500 font-serif'>{formatRelativeTime(news.createdAt)}</span>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-gray-500 font-serif'>Son 2 həftədə yeni xəbər yoxdur</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Articles */}
          {showArticles && (
            <div className='bg-white rounded-lg shadow-lg p-6 border'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-gray-900 font-serif'>Son Məqalələr</h3>
                <Link href='/articles' className='text-blue-600 hover:text-blue-800 font-serif text-sm'>
                  Hamısına bax →
                </Link>
              </div>
              <div className='space-y-4'>
                {recentArticles.length > 0 ? (
                  recentArticles.map((article) => (
                    <div key={article.id} className='border-l-4 border-purple-500 pl-4'>
                      <Link href={`/articles/${article.slug}`}>
                        <h4 className='font-medium text-gray-900 font-serif hover:text-blue-600'>{article.title}</h4>
                      </Link>
                      <p className='text-sm text-gray-600 font-serif line-clamp-2'>{article.description}</p>
                      <span className='text-xs text-gray-500 font-serif'>{formatRelativeTime(article.createdAt)}</span>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-gray-500 font-serif'>Son 2 həftədə yeni məqalə yoxdur</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Documents */}
          {showDocuments && (
            <div className='bg-white rounded-lg shadow-lg p-6 border'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-gray-900 font-serif'>Yeni Sənədlər</h3>
                <Link href='/docs' className='text-blue-600 hover:text-blue-800 font-serif text-sm'>
                  Hamısına bax →
                </Link>
              </div>
              <div className='space-y-4'>
                {recentDocuments.length > 0 ? (
                  recentDocuments.map((document) => (
                    <div key={document.id} className={`border-l-4 ${getCategoryColor(document.category)} pl-4`}>
                      <Link href={`/docs/${document.slug}`}>
                        <h4 className='font-medium text-gray-900 font-serif hover:text-blue-600'>{document.title}</h4>
                      </Link>
                      <p className='text-sm text-gray-600 font-serif line-clamp-2'>{document.description}</p>
                      <span className='text-xs text-gray-500 font-serif'>{formatRelativeTime(document.createdAt)}</span>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-gray-500 font-serif'>Son 2 həftədə yeni sənəd yoxdur</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
