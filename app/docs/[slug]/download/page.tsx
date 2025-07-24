import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ContentStatus, DocumentClassification, UserRole } from '@prisma/client';
import DownloadClient from '@/components/DownloadClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Check if user has access to the document based on classification
const hasDocumentAccess = (classification: DocumentClassification, userRoles: UserRole[]): boolean => {
  switch (classification) {
    case DocumentClassification.PUBLIC:
      return true;
    case DocumentClassification.INTERNAL:
      return userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.MODERATOR);
    case DocumentClassification.RESTRICTED:
      return userRoles.includes(UserRole.ADMIN);
    default:
      return false;
  }
};

export default async function DocumentDownloadPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Find document by slug
  const document = await prisma.document.findUnique({
    where: { slug: resolvedParams.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      classification: true,
      status: true,
    },
  });

  if (!document) {
    notFound();
  }

  // Check if user has access to this document
  if (!hasDocumentAccess(document.classification, session.user.roles as UserRole[])) {
    redirect('/docs');
  }

  // Only show published documents to non-officials
  const isOfficial = session.user.roles.includes(UserRole.OFFICIAL);
  if (document.status !== ContentStatus.PUBLISHED && !isOfficial) {
    redirect('/docs');
  }

  return <DownloadClient document={document} />;
}
