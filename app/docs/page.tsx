import { auth } from '@/auth';
import { UserRole, ContentStatus, DocumentCategory } from '@prisma/client';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getDocumentCategoryDescription, getDocumentCategoryDisplayName } from '@/lib/utils';
// import SearchForm from '@/components/SearchForm';

// Define interface based on actual Prisma query result
type DocumentWithAuthor = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: ContentStatus;
  category: DocumentCategory;
  tags: string[];
  version: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  effectiveDate: Date | null;
  author: {
    id: string;
    name: string;
    roles: UserRole[];
  };
};

interface DocumentCategoryGroup {
  title: string;
  description: string;
  documents: DocumentWithAuthor[];
  count: number;
}

interface SearchParams {
  search?: string;
}

const groupDocumentsByCategory = (docs: DocumentWithAuthor[]): DocumentCategoryGroup[] => {
  const categories: { [key in DocumentCategory]?: DocumentWithAuthor[] } = {};

  docs.forEach((doc) => {
    const category = doc.category;
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category]!.push(doc);
  });

  return Object.entries(categories).map(([categoryKey, documents]) => ({
    title: getDocumentCategoryDisplayName(categoryKey as DocumentCategory),
    description: getDocumentCategoryDescription(categoryKey as DocumentCategory),
    documents: documents || [],
    count: documents?.length || 0,
  }));
};

const formatDate = (date?: Date | null) => {
  if (!date) return 'Not set';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const isOfficial = session.user.roles.includes(UserRole.OFFICIAL);

  // Build query conditions for server-side filtering
  const whereConditions: {
    status: ContentStatus;
    OR?: Array<{ [key: string]: { contains: string; mode: 'insensitive' } }>;
    category?: DocumentCategory;
  } = {
    status: ContentStatus.PUBLISHED, // Only show published documents
  };

  if (resolvedSearchParams.search) {
    whereConditions.OR = [
      { title: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
      { description: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
    ];
  }

  // Fetch documents from database
  const documents = await prisma.document.findMany({
    where: whereConditions,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          roles: true,
        },
      },
    },
  });

  const documentCategories = groupDocumentsByCategory(documents);

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 font-serif'>Rəsmi Sənədlər</h1>
              <p className='text-xl text-gray-700 font-serif leading-relaxed mt-2'>
                Rəsmi sənədlərə, qanunlara, məcəllələrə və s. keçid edin.
              </p>
            </div>
            {isOfficial && (
              <Link
                href='/docs/create'
                className='bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors font-serif inline-flex items-center'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                </svg>
                Sənəd əlavə et
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
                  placeholder='Sənədləri axtar...'
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
                    href='/docs'
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
            {documents.length} yayımlanmış sənəd tapıldı
            {resolvedSearchParams.search && (
              <span className='ml-2 text-sm'>
                {resolvedSearchParams.search && `• Axtarılır: "${resolvedSearchParams.search}"`}
              </span>
            )}
          </p>
        </div>

        {/* Document Categories */}
        {documentCategories.length === 0 ? (
          <div className='text-center py-12'>
            <svg className='w-12 h-12 text-gray-300 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <h3 className='text-lg font-medium text-gray-900 font-serif mb-2'>Sənəd tapılmadı</h3>
            <p className='text-gray-500 font-serif'>
              {resolvedSearchParams.search ? 'Axtarış nöqtələrini dəyiş.' : 'Hal-hazırda yayımlanmış sənədlər yoxdur.'}
            </p>
            {resolvedSearchParams.search && (
              <Link href='/docs' className='mt-2 text-blue-600 hover:text-blue-800 font-serif inline-block'>
                Sənədləri görüntülə Bütün sənədləri görüntülə
              </Link>
            )}
          </div>
        ) : (
          <div className='space-y-8'>
            {documentCategories.map((category, index) => (
              <div key={index} className='bg-gray-50 rounded-lg p-6 border'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2 font-serif'>{category.title}</h2>
                    <p className='text-gray-600 font-serif'>{category.description}</p>
                  </div>
                  <span className='bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full font-serif'>
                    {category.count} sənəd
                  </span>
                </div>

                {/* Document List */}
                <div className='space-y-3'>
                  {category.documents.map((doc) => (
                    <div key={doc.id} className='bg-white p-4 rounded border hover:shadow-md transition-shadow'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-medium text-gray-900 font-serif'>{doc.title}</h3>
                            <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium font-serif'>
                              Yayımlanmış
                            </span>
                            {doc.version && (
                              <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-serif'>
                                v{doc.version}
                              </span>
                            )}
                          </div>

                          {doc.description && (
                            <p className='text-gray-600 text-sm font-serif mb-2 line-clamp-2'>{doc.description}</p>
                          )}

                          <div className='flex items-center space-x-4 text-sm text-gray-600'>
                            <span className='font-serif'>Yayımlanma tarixi: {formatDate(doc.publishedAt)}</span>
                            <span className='font-serif'>Yazar: {doc.author.name}</span>
                            <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-serif'>
                              {getDocumentCategoryDisplayName(doc.category)}
                            </span>
                          </div>

                          {doc.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-2'>
                              {doc.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className='bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-serif'
                                >
                                  {tag}
                                </span>
                              ))}
                              {doc.tags.length > 3 && (
                                <span className='text-gray-500 text-xs font-serif'>+{doc.tags.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className='flex space-x-2 ml-4'>
                          <Link
                            href={`/docs/${doc.slug}`}
                            className='text-blue-700 hover:text-blue-900 text-sm font-medium font-serif'
                          >
                            Keçid et
                          </Link>
                          <Link
                            href={`/docs/${doc.slug}/download`}
                            className='text-gray-500 hover:text-gray-700 text-sm font-medium font-serif'
                          >
                            Yüklə
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
