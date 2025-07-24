'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar only on login page
  // All other pages are protected and require authentication
  if (['/login', '/register'].includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
