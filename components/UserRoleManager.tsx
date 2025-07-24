'use client';

import { useState } from 'react';
import { UserRole } from '@prisma/client';

interface UserRoleManagerProps {
  userId: string;
  currentRoles: UserRole[];
  userName: string;
  currentUserIsTargetUser: boolean;
}

const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case UserRole.USER:
      return 'İstifadəçi';
    case UserRole.EDITOR:
      return 'Redaktor';
    case UserRole.JOURNALIST:
      return 'Jurnalist';
    case UserRole.OFFICIAL:
      return 'Rəsmi';
    case UserRole.MODERATOR:
      return 'Moderator';
    case UserRole.ADMIN:
      return 'Administrator';
    default:
      return role;
  }
};

export default function UserRoleManager({
  userId,
  currentRoles,
  userName,
  currentUserIsTargetUser,
}: UserRoleManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(currentRoles);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (response.ok) {
        setIsEditing(false);
        // Refresh the page to show updated roles
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Xəta: ${error.message || 'Rollar yenilənə bilmədi'}`);
        setSelectedRoles(currentRoles); // Reset to original roles
      }
    } catch (error) {
      console.error('Error updating roles:', error);
      alert('Xəta baş verdi. Yenidən cəhd edin.');
      setSelectedRoles(currentRoles); // Reset to original roles
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedRoles(currentRoles);
    setIsEditing(false);
  };

  // Don't allow editing own roles
  if (currentUserIsTargetUser) {
    return <span className='text-gray-400 text-sm font-serif'>Öz rolunuzu dəyişə bilməzsiniz</span>;
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className='text-blue-600 hover:text-blue-800 text-sm font-medium font-serif'
      >
        Rolları dəyişdir
      </button>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='text-sm font-medium text-gray-900 font-serif mb-2'>{userName} üçün rollar:</div>

      <div className='space-y-2'>
        {Object.values(UserRole).map((role) => (
          <label key={role} className='flex items-center'>
            <input
              type='checkbox'
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleToggle(role)}
              disabled={isLoading}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <span className='ml-2 text-sm text-gray-700 font-serif'>{getRoleDisplayName(role)}</span>
          </label>
        ))}
      </div>

      <div className='flex gap-2 pt-2'>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className='px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-medium rounded font-serif transition-colors'
        >
          {isLoading ? 'Yadda saxlanır...' : 'Yadda saxla'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className='px-3 py-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 text-xs font-medium rounded font-serif transition-colors'
        >
          Ləğv et
        </button>
      </div>
    </div>
  );
}
