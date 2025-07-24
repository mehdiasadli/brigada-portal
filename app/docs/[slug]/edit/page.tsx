import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { DocumentClassification, UserRole } from '@prisma/client';
import UpdateDocumentForm from '@/components/UpdateDocumentForm';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Check if user has permission to edit this document
const canEditDocument = (document: { authorId: string }, userRoles: UserRole[], userId: string): boolean => {
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  const isOfficial = userRoles.includes(UserRole.OFFICIAL);
  const isAuthor = document.authorId === userId;

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

// Check document access based on classification
const hasDocumentAccess = (classification: DocumentClassification, userRoles: UserRole[]): boolean => {
  switch (classification) {
    case DocumentClassification.PUBLIC:
      return true;
    case DocumentClassification.INTERNAL:
      return userRoles.includes(UserRole.OFFICIAL) || userRoles.includes(UserRole.ADMIN);
    case DocumentClassification.RESTRICTED:
      return userRoles.includes(UserRole.ADMIN);
    default:
      return false;
  }
};

export default async function EditDocumentPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch the document with author information
  const document = await prisma.document.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          roles: true,
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  // Check if user has access to view this document
  if (!hasDocumentAccess(document.classification, session.user.roles as UserRole[])) {
    redirect('/docs');
  }

  // Check if user can edit this document
  if (!canEditDocument(document, session.user.roles as UserRole[], session.user.id)) {
    redirect('/docs');
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 font-serif mb-2'>Sənədi yenilə</h1>
          <p className='text-gray-600 font-serif'>Sənədin &quot;{document.title}&quot; məzmununu dəyişin</p>
        </div>

        <UpdateDocumentForm document={document} />
      </div>
    </div>
  );
}
