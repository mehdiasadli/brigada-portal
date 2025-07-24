'use client';

import { useState } from 'react';

interface UserDeleteManagerProps {
  userId: string;
  userEmail: string;
  userName: string;
  currentUserIsTargetUser: boolean;
  isAdmin: boolean;
}

export default function UserDeleteManager({
  userId,
  userEmail,
  userName,
  currentUserIsTargetUser,
  isAdmin,
}: UserDeleteManagerProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (emailConfirmation !== userEmail) {
      alert('E-poçt təsdiqi uyğun gəlmir. Dəqiq e-poçt ünvanını yazın.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailConfirmation }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('İstifadəçi uğurla silindi.');
        // Refresh the page to show updated user list
        window.location.reload();
      } else {
        if (result.contentSummary) {
          // User has content that needs to be handled
          const contentDetails = [];
          if (result.contentSummary.documents > 0) {
            contentDetails.push(`${result.contentSummary.documents} sənəd`);
          }
          if (result.contentSummary.articles > 0) {
            contentDetails.push(`${result.contentSummary.articles} məqalə`);
          }
          if (result.contentSummary.news > 0) {
            contentDetails.push(`${result.contentSummary.news} xəbər`);
          }

          alert(
            `İstifadəçini silmək mümkün deyil. Onun ${contentDetails.join(', ')} var. Əvvəlcə məzmunu köçürün və ya silin.`
          );
        } else {
          alert(`Xəta: ${result.message || 'İstifadəçi silinə bilmədi'}`);
        }
        setEmailConfirmation(''); // Reset confirmation field
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Xəta baş verdi. Yenidən cəhd edin.');
      setEmailConfirmation(''); // Reset confirmation field
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setEmailConfirmation('');
    setShowConfirmation(false);
  };

  // Don't allow deleting own account
  if (currentUserIsTargetUser) {
    return <span className='text-gray-400 text-sm font-serif'>Öz hesabınızı silə bilməzsiniz</span>;
  }

  // Don't allow deleting other admins
  if (isAdmin) {
    return <span className='text-gray-400 text-sm font-serif'>Admin hesabı silinə bilməz</span>;
  }

  if (!showConfirmation) {
    return (
      <button
        onClick={() => setShowConfirmation(true)}
        className='text-red-600 hover:text-red-800 text-sm font-medium font-serif'
      >
        İstifadəçini sil
      </button>
    );
  }

  return (
    <div className='space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
      <div className='text-sm font-medium text-red-900 font-serif mb-2'>
        <strong>DİQQƏT:</strong> Bu əməliyyat geri qaytarıla bilməz!
      </div>

      <div className='text-sm text-red-800 font-serif'>
        <strong>{userName}</strong> istifadəçisini silmək üçün e-poçt ünvanını yazın:
      </div>

      <input
        type='email'
        value={emailConfirmation}
        onChange={(e) => setEmailConfirmation(e.target.value)}
        placeholder={userEmail}
        disabled={isLoading}
        className='w-full px-3 py-2 border border-red-300 rounded-md text-sm font-serif focus:ring-2 focus:ring-red-500 focus:border-transparent'
      />

      <div className='text-xs text-red-600 font-serif'>
        Yazın: <strong>{userEmail}</strong>
      </div>

      <div className='flex gap-2 pt-2'>
        <button
          onClick={handleDelete}
          disabled={isLoading || emailConfirmation !== userEmail}
          className='px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded font-serif transition-colors'
        >
          {isLoading ? 'Silinir...' : 'Təsdiq et və sil'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className='px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 text-sm font-medium rounded font-serif transition-colors'
        >
          Ləğv et
        </button>
      </div>
    </div>
  );
}
