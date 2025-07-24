'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const handleLogout = () => {
    signOut({
      callbackUrl: '/login',
    });
  };

  return (
    <button
      onClick={handleLogout}
      className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors font-serif'
    >
      Çıxış et
    </button>
  );
}
