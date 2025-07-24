import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Headings
    h1: ({ children, ...props }) => (
      <h1 className='text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 font-serif' {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className='text-2xl font-bold text-gray-900 mb-4 mt-6 font-serif' {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className='text-xl font-bold text-gray-900 mb-3 mt-5 font-serif' {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className='text-lg font-bold text-gray-900 mb-2 mt-4 font-serif' {...props}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className='text-base font-bold text-gray-900 mb-2 mt-3 font-serif' {...props}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className='text-sm font-bold text-gray-900 mb-1 mt-2 font-serif' {...props}>
        {children}
      </h6>
    ),

    // Typography
    p: ({ children, ...props }) => (
      <p className='text-gray-800 leading-relaxed mb-4 font-serif' {...props}>
        {children}
      </p>
    ),
    strong: ({ children, ...props }) => (
      <strong className='font-bold text-gray-900' {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className='italic' {...props}>
        {children}
      </em>
    ),
    u: ({ children, ...props }) => (
      <u className='underline' {...props}>
        {children}
      </u>
    ),
    s: ({ children, ...props }) => (
      <s className='line-through text-gray-600' {...props}>
        {children}
      </s>
    ),
    del: ({ children, ...props }) => (
      <del className='line-through text-gray-600' {...props}>
        {children}
      </del>
    ),

    // Lists
    ul: ({ children, ...props }) => (
      <ul className='list-disc list-inside mb-4 text-gray-800 space-y-1 font-serif' {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className='list-decimal list-inside mb-4 text-gray-800 space-y-1 font-serif' {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className='leading-relaxed' {...props}>
        {children}
      </li>
    ),

    // Links
    a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const linkClasses = 'text-blue-700 underline hover:text-blue-900 transition-colors font-serif';

      if (!href) return null;

      if (href.startsWith('/')) {
        return (
          <Link href={href} className={linkClasses} {...props}>
            {children}
          </Link>
        );
      }

      if (href.startsWith('#')) {
        return (
          <a href={href} className={linkClasses} {...props}>
            {children}
          </a>
        );
      }

      return (
        <a href={href} target='_blank' rel='noopener noreferrer' className={linkClasses} {...props}>
          {children}
        </a>
      );
    },

    // Other elements
    blockquote: ({ children, ...props }) => (
      <blockquote className='border-l-4 border-gray-400 pl-4 ml-4 italic text-gray-700 mb-4 font-serif' {...props}>
        {children}
      </blockquote>
    ),
    hr: ({ ...props }) => <hr className='border-gray-400 my-6' {...props} />,
  };
}
