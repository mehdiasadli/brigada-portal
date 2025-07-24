'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@prisma/client';
import DeleteMemberModal from './DeleteMemberModal';

interface MemberActionsProps {
  memberName: string;
  memberId: string;
  memberUserId: string | null;
  memberUserRoles: string[] | null;
  currentUserId: string;
  currentUserRoles: UserRole[];
}

// Check if user can edit this member
const canEditMember = (
  memberUserId: string | null,
  memberUserRoles: string[] | null,
  userRoles: UserRole[],
  userId: string
): boolean => {
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  const isModerator = userRoles.includes(UserRole.MODERATOR);
  const isOwnMember = memberUserId === userId;
  const memberUserIsAdmin = memberUserRoles?.includes(UserRole.ADMIN);

  // ADMIN can edit any member (except other ADMIN members)
  if (isAdmin && !memberUserIsAdmin) {
    return true;
  }

  // MODERATOR can edit any member except ADMIN members
  if (isModerator && !memberUserIsAdmin) {
    return true;
  }

  // Any user can edit their own member profile if they have one
  if (isOwnMember) {
    return true;
  }

  return false;
};

// Check if user can delete members
const canDeleteMember = (memberUserRoles: string[] | null, userRoles: UserRole[]): boolean => {
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  const memberUserIsAdmin = memberUserRoles?.includes(UserRole.ADMIN);

  // Only ADMIN can delete members, but not other ADMIN members
  return isAdmin && !memberUserIsAdmin;
};

export default function MemberActions({
  memberName,
  memberId,
  memberUserId,
  memberUserRoles,
  currentUserId,
  currentUserRoles,
}: MemberActionsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canEdit = canEditMember(memberUserId, memberUserRoles, currentUserRoles, currentUserId);
  const canDelete = canDeleteMember(memberUserRoles, currentUserRoles);

  const memberSlug = memberName.toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      <div className='space-y-2'>
        <Link href='/members' className='block text-blue-700 hover:text-blue-900 font-serif text-sm'>
          → Bütün üzvlərin siyahısını gör
        </Link>

        {/* Update Member Link - Only show if user can edit */}
        {canEdit && (
          <Link
            href={`/members/${memberSlug}/edit`}
            className='block text-green-700 hover:text-green-900 font-serif text-sm'
          >
            → Üzvü yenilə
          </Link>
        )}

        {/* Delete Member Button - Only show if user can delete */}
        {canDelete && (
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className='block text-red-700 hover:text-red-900 font-serif text-sm text-left'
          >
            → Üzvü sil
          </button>
        )}
      </div>

      {/* Delete Member Modal */}
      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        memberName={memberName}
        memberId={memberId}
      />
    </>
  );
}
