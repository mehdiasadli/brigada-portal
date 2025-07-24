'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@prisma/client';
import DeleteDocumentModal from './DeleteDocumentModal';

interface DocumentActionsProps {
  documentTitle: string;
  documentSlug: string;
  authorId: string;
  currentUserId: string;
  currentUserRoles: UserRole[];
}

// Check if user can edit this document
const canEditDocument = (authorId: string, userRoles: UserRole[], userId: string): boolean => {
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  const isOfficial = userRoles.includes(UserRole.OFFICIAL);
  const isAuthor = authorId === userId;

  // ADMIN can edit any document
  if (isAdmin) {
    return true;
  }

  // OFFICIAL can only edit their own documents
  if (isOfficial && isAuthor) {
    return true;
  }

  return false;
};

// Check if user can delete documents
const canDeleteDocument = (userRoles: UserRole[]): boolean => {
  // Only ADMIN can delete documents
  return userRoles.includes(UserRole.ADMIN);
};

export default function DocumentActions({
  documentTitle,
  documentSlug,
  authorId,
  currentUserId,
  currentUserRoles,
}: DocumentActionsProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canEdit = canEditDocument(authorId, currentUserRoles, currentUserId);
  const canDelete = canDeleteDocument(currentUserRoles);

  return (
    <>
      <div className='space-y-2'>
        <Link href='/docs' className='block text-blue-700 hover:text-blue-900 font-serif text-sm'>
          → Bütün sənədləri görüntülə
        </Link>
        <Link
          href={`/docs/${documentSlug}/download`}
          className='block text-blue-700 hover:text-blue-900 font-serif text-sm'
        >
          → Sənədi yüklə
        </Link>

        {/* Update Document Link - Only show if user can edit */}
        {canEdit && (
          <Link
            href={`/docs/${documentSlug}/edit`}
            className='block text-green-700 hover:text-green-900 font-serif text-sm'
          >
            → Sənədi yenilə
          </Link>
        )}

        {/* Delete Document Button - Only show if user can delete */}
        {canDelete && (
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className='block text-red-700 hover:text-red-900 font-serif text-sm text-left'
          >
            → Sənədi sil
          </button>
        )}
      </div>

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        documentTitle={documentTitle}
        documentSlug={documentSlug}
      />
    </>
  );
}
