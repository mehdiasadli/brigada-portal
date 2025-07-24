'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ContentStatus, DocumentClassification } from '@prisma/client';

interface DocumentInfo {
  id: string;
  title: string;
  slug: string;
  classification: DocumentClassification;
  status: ContentStatus;
}

interface DownloadClientProps {
  document: DocumentInfo;
}

const downloadFormats = [
  {
    format: 'md',
    label: 'Markdown (.md)',
    description: 'Bütün tekst formatların qorunduğu "Markdown" faylı',
    icon: '📝',
  },
  {
    format: 'txt',
    label: 'Tekst (.txt)',
    description: 'Formatsız, sadə tekst faylı',
    icon: '📄',
  },
];

export default function DownloadClient({ document: docInfo }: DownloadClientProps) {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (format: string) => {
    setIsDownloading(format);

    try {
      // Handle MD and TXT downloads as before
      const response = await fetch(`/api/documents/${docInfo.slug}/download?format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Yükləmə uğursuz oldu');
      }

      // Get the filename from response headers or generate one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${docInfo.title}.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Yükləmə uğursuz oldu. Lütfən, bir daha yoxlayın.');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Back Navigation */}
        <div className='mb-8'>
          <Link
            href={`/docs/${docInfo.slug}`}
            className='inline-flex items-center text-blue-700 hover:text-blue-900 font-serif'
          >
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Sənədə qayıt
          </Link>
        </div>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 font-serif mb-4'>Sənədi yüklə</h1>
          <p className='text-xl text-gray-700 font-serif leading-relaxed'>
            &quot;{docInfo.title}&quot; sənədini yükləmək üçün istədiyiniz formatı seçin.
          </p>
        </div>

        {/* Download Options */}
        <div className='space-y-4'>
          {downloadFormats.map((option) => (
            <div key={option.format} className='bg-gray-50 rounded-lg p-6 border hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-4'>
                  <div className='text-2xl'>{option.icon}</div>
                  <div>
                    <h3 className='text-lg font-medium text-gray-900 font-serif mb-1'>{option.label}</h3>
                    <p className='text-gray-600 font-serif text-sm'>{option.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(option.format)}
                  disabled={isDownloading !== null}
                  className={`px-4 py-2 rounded-lg font-serif transition-colors ${
                    isDownloading === option.format
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isDownloading === option.format ? (
                    <div className='flex items-center'>
                      <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      Yüklənir...
                    </div>
                  ) : (
                    'Yüklə'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Information */}
        <div className='mt-8 bg-blue-50 rounded-lg p-6 border'>
          <h3 className='text-lg font-medium text-gray-900 font-serif mb-3'>Yükləmə məlumatı</h3>
          <div className='space-y-2 text-sm text-gray-700 font-serif'>
            <p>
              • <strong>Markdown (.md)</strong>: Formatın qorunduğu &quot;Markdown&quot; faylı.
            </p>
            <p>
              • <strong>Text (.txt)</strong>: İstənilən tekst redaktoru və ya &quot;word&quot; prosessoru ilə açıla
              bilən universal tekst fayl formatı.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-500 font-serif'>
            Yükləmə problemi var? Dəstək ilə əlaqə saxlayın və ya fərqli formatı yoxlayın.
          </p>
        </div>
      </div>
    </div>
  );
}
