import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ContentStatus, DocumentClassification, UserRole } from '@prisma/client';
import DocumentActions from '@/components/DocumentActions';
import { getDocumentCategoryDisplayName, getDocumentStatusDisplayName } from '@/lib/utils';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const document = await prisma.document.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!document) {
    return {
      title: 'Sənəd tapılmadı',
      description: 'Axtardığınız sənəd mövcud deyil.',
    };
  }

  const categoryDisplay = getDocumentCategoryDisplayName(document.category);
  const description = document.description
    ? `${document.description.substring(0, 150)}...`
    : `${categoryDisplay} kateqoriyasında ${document.author.name} tərəfindən yaradılan rəsmi sənəd.`;

  return {
    title: document.title,
    description,
    keywords: [
      document.title,
      categoryDisplay,
      'rəsmi sənəd',
      'Brigada Portal',
      'hüquqi sənəd',
      document.author.name,
      ...document.tags,
    ],
    authors: [{ name: document.author.name }],
    creator: document.author.name,
    publisher: 'Brigada Portal',

    openGraph: {
      title: `${document.title} - Brigada Portal`,
      description,
      url: `/docs/${document.slug}`,
      type: 'article',
      publishedTime: document.publishedAt?.toISOString(),
      modifiedTime: document.updatedAt.toISOString(),
      authors: [document.author.name],
      section: categoryDisplay,
      tags: document.tags,
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: `${document.title} - Brigada Portal`,
        },
      ],
    },

    twitter: {
      title: `${document.title} - Brigada Portal`,
      description,
      creator: '@brigada_portal',
    },

    alternates: {
      canonical: `/docs/${document.slug}`,
    },

    other: {
      'article:author': document.author.name,
      'article:section': categoryDisplay,
      'article:published_time': document.publishedAt?.toISOString() || '',
      'article:modified_time': document.updatedAt.toISOString(),
    },
  };
}

const formatDate = (date: Date | null) => {
  if (!date) return 'Not set';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getClassificationDisplayName = (classification: DocumentClassification): string => {
  const names: { [key in DocumentClassification]: string } = {
    PUBLIC: 'İctimai',
    INTERNAL: 'Daxili',
    RESTRICTED: 'Məhdudlaşdırılmış',
  };
  return names[classification];
};

const getClassificationColor = (classification: DocumentClassification): string => {
  switch (classification) {
    case DocumentClassification.PUBLIC:
      return 'bg-green-100 text-green-800';
    case DocumentClassification.INTERNAL:
      return 'bg-yellow-100 text-yellow-800';
    case DocumentClassification.RESTRICTED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: ContentStatus): string => {
  switch (status) {
    case ContentStatus.PUBLISHED:
      return 'bg-green-100 text-green-800';
    case ContentStatus.DRAFT:
      return 'bg-yellow-100 text-yellow-800';
    case ContentStatus.ARCHIVED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Check if user has access to the document based on classification
const hasDocumentAccess = (classification: DocumentClassification, userRoles: UserRole[]): boolean => {
  switch (classification) {
    case DocumentClassification.PUBLIC:
      return true; // Everyone can access public documents
    case DocumentClassification.INTERNAL:
      return userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.MODERATOR);
    case DocumentClassification.RESTRICTED:
      return userRoles.includes(UserRole.ADMIN);
    default:
      return false;
  }
};

// Extract content from MDX wrapper
const extractMDXContent = (mdxContent: string): string => {
  // Remove the import and metadata lines
  const lines = mdxContent.split('\n');
  const contentStart = lines.findIndex((line) => line.trim() === '>');
  const contentEnd = lines.lastIndexOf('</MDXLayout>');

  if (contentStart !== -1 && contentEnd !== -1) {
    return lines
      .slice(contentStart + 1, contentEnd)
      .join('\n')
      .trim();
  }

  // If no MDXLayout wrapper found, return the content as-is
  return mdxContent;
};

// Convert markdown to HTML for display
const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Convert headers
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold text-gray-900 font-serif mb-2 mt-3">$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-gray-900 font-serif mb-2 mt-4">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 font-serif mb-3 mt-6">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 font-serif mb-4 mt-8">$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // Convert underline and strikethrough
  html = html.replace(/<u>(.*?)<\/u>/g, '<span class="underline">$1</span>');
  html = html.replace(/~~(.*?)~~/g, '<span class="line-through">$1</span>');

  // Convert code
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');

  // Convert lists
  html = html.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal">$1. $2</li>');

  // Convert quotes
  html = html.replace(
    /^> (.*$)/gm,
    '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4">$1</blockquote>'
  );

  // Convert horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-gray-300 my-6">');

  // Convert line breaks
  html = html.replace(/\n/g, '<br>');

  // Wrap consecutive list items
  html = html.replace(/(<li[^>]*>.*?<\/li>)(<br>)*(<li[^>]*>.*?<\/li>)/g, '<ul class="list-disc ml-6 my-4">$1$3</ul>');

  return html;
};

export default async function DocumentPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.user) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 font-serif mb-4'>Avtorizasiya tələb olunur</h1>
          <p className='text-gray-600 font-serif mb-6'>Sənədləri görüntüləmək üçün giriş etməlisiniz.</p>
          <Link
            href='/login'
            className='bg-blue-600 text-white px-6 py-3 rounded-lg font-serif hover:bg-blue-700 transition-colors'
          >
            Giriş et
          </Link>
        </div>
      </div>
    );
  }

  // Find document by slug
  const document = await prisma.document.findUnique({
    where: { slug: resolvedParams.slug },
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

  if (!document) {
    notFound();
  }

  // Check if user has access to this document
  if (!hasDocumentAccess(document.classification, session.user.roles as UserRole[])) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <svg className='w-16 h-16 text-red-400 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
          <h1 className='text-2xl font-bold text-gray-900 font-serif mb-4'>Giriş məhdudlaşdırılmışdır</h1>
          <p className='text-gray-600 font-serif mb-6'>
            Bu {getClassificationDisplayName(document.classification).toLowerCase()} sənədini görüntüləmək üçün icazəniz
            yoxdur.
          </p>
          <Link
            href='/docs'
            className='bg-blue-600 text-white px-6 py-3 rounded-lg font-serif hover:bg-blue-700 transition-colors'
          >
            Sənədlərə qayıt
          </Link>
        </div>
      </div>
    );
  }

  // Only show published documents to non-officials
  const isOfficial = session.user.roles.includes(UserRole.OFFICIAL);
  if (document.status !== ContentStatus.PUBLISHED && !isOfficial) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <svg className='w-16 h-16 text-yellow-400 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
          <h1 className='text-2xl font-bold text-gray-900 font-serif mb-4'>Sənəd mövcud deyil</h1>
          <p className='text-gray-600 font-serif mb-6'>
            Bu sənəd hələlik {document.status.toLowerCase()} statusundadır və yayımlanmamışdır.
          </p>
          <Link
            href='/docs'
            className='bg-blue-600 text-white px-6 py-3 rounded-lg font-serif hover:bg-blue-700 transition-colors'
          >
            Sənədlərə qayıt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Back to Documents */}
        <div className='mb-8'>
          <Link href='/docs' className='inline-flex items-center text-blue-700 hover:text-blue-900 font-serif'>
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Sənədlərə qayıt
          </Link>
        </div>

        {/* Document Header */}
        <div className='bg-gray-50 rounded-lg p-8 mb-8 border'>
          <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
            <div className='flex-1'>
              <div className='flex flex-wrap items-center gap-2 mb-4'>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium font-serif ${getStatusColor(document.status)}`}
                >
                  {getDocumentStatusDisplayName(document.status)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium font-serif ${getClassificationColor(document.classification)}`}
                >
                  {getClassificationDisplayName(document.classification)}
                </span>
                <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium font-serif'>
                  {getDocumentCategoryDisplayName(document.category)}
                </span>
                {document.version && (
                  <span className='bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium font-serif'>
                    v{document.version}
                  </span>
                )}
              </div>

              <h1 className='text-4xl font-bold text-gray-900 font-serif mb-4'>{document.title}</h1>

              {document.description && (
                <p className='text-xl text-gray-700 font-serif leading-relaxed mb-6'>{document.description}</p>
              )}

              <div className='grid md:grid-cols-2 gap-6 text-sm text-gray-600'>
                <div>
                  <h3 className='font-medium text-gray-900 font-serif mb-2'>Yayımlanma məlumatları</h3>
                  <div className='space-y-1'>
                    <p className='font-serif'>
                      <span className='font-medium'>Yayımlanma tarixi:</span> {formatDate(document.publishedAt)}
                    </p>
                    <p className='font-serif'>
                      <span className='font-medium'>Müəllif:</span> {document.author.name}
                    </p>
                    <p className='font-serif'>
                      <span className='font-medium'>Son dəyişdirilmə tarixi:</span> {formatDate(document.updatedAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className='font-medium text-gray-900 font-serif mb-2'>Sənəd məlumatları</h3>
                  <div className='space-y-1'>
                    <p className='font-serif'>
                      <span className='font-medium'>Kateqoriya:</span>{' '}
                      {getDocumentCategoryDisplayName(document.category)}
                    </p>
                    {document.effectiveDate && (
                      <p className='font-serif'>
                        <span className='font-medium'>Effektivdir:</span> {formatDate(document.effectiveDate)}
                      </p>
                    )}
                    <p className='font-serif'>
                      <span className='font-medium'>Klassifikasiya:</span>{' '}
                      {getClassificationDisplayName(document.classification)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {document.tags.length > 0 && (
                <div className='mt-6'>
                  <h3 className='font-medium text-gray-900 font-serif mb-2'>Taqlar</h3>
                  <div className='flex flex-wrap gap-2'>
                    {document.tags.map((tag, index) => (
                      <span key={index} className='bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-serif'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className='bg-white rounded-lg border shadow-sm'>
          <div className='mdx-document p-8'>
            <div className='prose prose-lg max-w-none font-serif'>
              <div
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(extractMDXContent(document.content)),
                }}
              />
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className='mt-8 bg-gray-50 rounded-lg p-6 border'>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-medium text-gray-900 font-serif mb-3'>Sənəd Məlumatları</h3>
              <div className='space-y-2 text-sm'>
                <p className='font-serif'>
                  <span className='font-medium text-gray-700'>Sənədin ID-si:</span> {document.id}
                </p>
                <p className='font-serif'>
                  <span className='font-medium text-gray-700'>Yaradılma tarixi:</span> {formatDate(document.createdAt)}
                </p>
                <p className='font-serif'>
                  <span className='font-medium text-gray-700'>Son dəyişdirilmə tarixi:</span>{' '}
                  {formatDate(document.updatedAt)}
                </p>
                {document.version && (
                  <p className='font-serif'>
                    <span className='font-medium text-gray-700'>Versiya:</span> {document.version}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className='text-lg font-medium text-gray-900 font-serif mb-3'>Əlaqəli Əməllər</h3>
              <DocumentActions
                documentTitle={document.title}
                documentSlug={document.slug}
                authorId={document.authorId}
                currentUserId={session.user.id}
                currentUserRoles={session.user.roles as UserRole[]}
              />
            </div>
          </div>
        </div>

        {/* Author Information */}
        <div className='mt-8 bg-blue-50 rounded-lg p-6 border'>
          <h3 className='text-lg font-medium text-gray-900 font-serif mb-3'>Müəllif haqqında</h3>
          <div className='flex items-start gap-4'>
            <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center'>
              <span className='text-white font-serif font-bold text-lg'>
                {document.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 font-serif'>{document.author.name}</h4>
              <div className='flex flex-wrap gap-1 mt-1'>
                {document.author.roles.map((role) => (
                  <span
                    key={role}
                    className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium font-serif'
                  >
                    {role}
                  </span>
                ))}
              </div>
              <p className='text-sm text-gray-600 font-serif mt-2'>
                Bu sənəd haqqında suallarınız varsa, lütfən, &quot;Müəllifə əlaqə saxla&quot; düyməsini istifadə edin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
