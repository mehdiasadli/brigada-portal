import React from 'react';

interface MDXLayoutProps {
  children: React.ReactNode;
  title?: string;
  date?: string;
  description?: string;
}

export function MDXLayout({ children, title, date, description }: MDXLayoutProps) {
  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        {/* Document Header */}
        <header className='mb-8 sm:mb-12 text-center border-b-2 border-gray-800 pb-4 sm:pb-6'>
          {title && (
            <h1 className='font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wide'>
              {title}
            </h1>
          )}
          {description && (
            <div className='font-serif text-sm sm:text-base text-gray-700 italic mb-2 sm:mb-3'>{description}</div>
          )}
          {date && <div className='font-serif text-sm sm:text-base text-gray-700'>Date: {date}</div>}
        </header>

        {/* Document Body */}
        <main className='mdx-document'>{children}</main>
      </div>
    </div>
  );
}
