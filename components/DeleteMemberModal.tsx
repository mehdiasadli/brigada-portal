'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
}

export default function DeleteMemberModal({ isOpen, onClose, memberName, memberId }: DeleteMemberModalProps) {
  const router = useRouter();
  const [nameConfirmation, setNameConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Handle modal close
  const handleClose = () => {
    if (!isDeleting) {
      setNameConfirmation('');
      setError('');
      onClose();
    }
  };

  // Handle member deletion
  const handleDelete = async () => {
    if (!nameConfirmation) {
      setError('Please enter the member name to confirm deletion');
      return;
    }

    if (nameConfirmation !== memberName) {
      setError('Name confirmation does not match. Please type the exact member name.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameConfirmation,
        }),
      });

      if (response.ok) {
        router.push('/members');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to delete member');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('An error occurred while deleting the member');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isDeleting) {
      handleClose();
    }
    if (e.key === 'Enter' && nameConfirmation === memberName && !isDeleting) {
      handleDelete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black bg-opacity-50' onClick={handleClose} />

      {/* Modal */}
      <div
        className='relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4'
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-bold text-red-600 font-serif'>Üzvü sil</h3>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className='p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Warning */}
        <div className='mb-6'>
          <div className='flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <svg
              className='w-6 h-6 text-red-600 flex-shrink-0 mt-0.5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
            <div>
              <h4 className='font-medium text-red-800 font-serif mb-1'>Xəbərdarlıq: Bu əməliyyat təkrarlana bilməz</h4>
              <p className='text-sm text-red-700 font-serif'>
                Bu əməliyyat üzv profilini və bütün məlumatlarını bir dəfəlik siləcək. Bu əməliyyat geri qaytarıla
                bilməz.
              </p>
            </div>
          </div>
        </div>

        {/* Member Info */}
        <div className='mb-6'>
          <p className='text-sm text-gray-600 font-serif mb-2'>Silinəcək üzv:</p>
          <div className='p-3 bg-gray-50 border border-gray-200 rounded-lg'>
            <p className='font-medium text-gray-900 font-serif'>{memberName}</p>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className='mb-6'>
          <label htmlFor='nameConfirmation' className='block text-sm font-medium text-gray-700 font-serif mb-2'>
            Silinməyin təsdiqini vermək üçün üzv adını tam olaraq aşağıdakı kimi daxil edin:
          </label>
          <input
            type='text'
            id='nameConfirmation'
            value={nameConfirmation}
            onChange={(e) => {
              setNameConfirmation(e.target.value);
              setError('');
            }}
            onPaste={(e) => e.preventDefault()}
            disabled={isDeleting}
            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg font-serif focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='Üzv adını daxil edin'
            autoFocus
          />

          {/* Match indicator */}
          {nameConfirmation && (
            <div className='mt-2'>
              {nameConfirmation === memberName ? (
                <div className='flex items-center text-green-600 text-sm font-serif'>
                  <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Ad uyğundur
                </div>
              ) : (
                <div className='flex items-center text-red-600 text-sm font-serif'>
                  <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                  Ad uyğun deyil
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-700 font-serif'>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className='flex items-center justify-end space-x-3'>
          <button
            type='button'
            onClick={handleClose}
            disabled={isDeleting}
            className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-serif hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Ləğv et
          </button>
          <button
            type='button'
            onClick={handleDelete}
            disabled={isDeleting || nameConfirmation !== memberName}
            className='px-4 py-2 bg-red-600 text-white rounded-lg font-serif hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
          >
            {isDeleting ? (
              <span className='flex items-center'>
                <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Silinir...
              </span>
            ) : (
              'Üzvü sil'
            )}
          </button>
        </div>

        {/* Footer note */}
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <p className='text-xs text-gray-500 font-serif text-center'>
            Bu əməliyyat admin səlahiyyətləri tələb edir və geri qaytarıla bilməz.
          </p>
        </div>
      </div>
    </div>
  );
}
