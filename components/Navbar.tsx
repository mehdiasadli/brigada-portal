'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { UserRole } from '@prisma/client';

const links = [
  {
    label: 'Əsas Səhifə',
    href: '/',
  },
  {
    label: 'Sənədlər',
    href: '/docs',
  },
  {
    label: 'Üzvlər',
    href: '/members',
  },
  // TODO: add news and articles later
  // {
  //   label: 'Xəbərlər',
  //   href: '/news',
  // },
  // {
  //   label: 'Məqalələr',
  //   href: '/articles',
  // },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getLinkClasses = (href: string, isMobile = false) => {
    const baseClasses = isMobile
      ? 'block px-3 py-2 rounded-md text-base font-medium font-serif transition-colors'
      : 'px-3 py-2 rounded-md text-sm font-medium font-serif transition-colors';

    const activeClasses = 'bg-gray-700 text-white';
    const inactiveClasses = 'text-gray-300 hover:bg-gray-700 hover:text-white';

    return `${baseClasses} ${isActive(href) ? activeClasses : inactiveClasses}`;
  };

  return (
    <nav className='bg-gray-900 border-b-4 border-blue-700 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo/Brand */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center space-x-3'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-blue-700 rounded flex items-center justify-center'>
                  <span className='text-white font-bold text-lg'>B</span>
                </div>
              </div>
              <div className='text-white font-serif'>
                <span className='text-lg font-bold'>Brigada Portal</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center space-x-4'>
            <div className='flex items-baseline space-x-4'>
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={getLinkClasses(link.href)}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Admin Section */}
            {session?.user && session.user.roles?.includes(UserRole.ADMIN) && (
              <div className='border-l border-gray-600 pl-6 flex items-center space-x-4'>
                <Link href='/admin/users' className={getLinkClasses('/admin/users')}>
                  İstifadəçilər
                </Link>
              </div>
            )}

            {/* Auth Section */}
            <div className='ml-6 border-l border-gray-600 pl-6 flex items-center space-x-4'>
              {status === 'loading' ? (
                <div className='text-gray-300 text-sm font-serif'>Loading...</div>
              ) : session?.user ? (
                <>
                  <Link href='/profile' className={getLinkClasses('/profile')}>
                    Profil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-serif transition-colors'
                  >
                    Çıxış
                  </button>
                </>
              ) : (
                <Link
                  href='/login'
                  className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-serif transition-colors'
                >
                  Daxil ol
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              type='button'
              onClick={toggleMenu}
              className='bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
              aria-controls='mobile-menu'
              aria-expanded={isOpen}
            >
              <span className='sr-only'>Open main menu</span>
              {isOpen ? (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              ) : (
                <svg
                  className='block h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className='md:hidden' id='mobile-menu'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800'>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={getLinkClasses(link.href, true)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Admin Section */}
            {session?.user && session.user.roles?.includes(UserRole.ADMIN) && (
              <div className='border-t border-gray-700 pt-4 pb-3'>
                <Link
                  href='/admin/users'
                  onClick={() => setIsOpen(false)}
                  className={getLinkClasses('/admin/users', true)}
                >
                  İstifadəçilər
                </Link>
              </div>
            )}

            {/* Mobile Auth Section */}
            {session?.user ? (
              <>
                <Link href='/profile' onClick={() => setIsOpen(false)} className={getLinkClasses('/profile', true)}>
                  Profil
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className='text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium font-serif'
                >
                  Çıxış
                </button>
              </>
            ) : (
              <Link
                href='/login'
                onClick={() => setIsOpen(false)}
                className='text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium font-serif'
              >
                Daxil ol
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
