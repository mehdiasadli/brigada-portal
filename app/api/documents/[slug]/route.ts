import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { DocumentCategory, DocumentClassification, ContentStatus, UserRole } from '@prisma/client';
import { z } from 'zod';
import { sendDocumentNotificationToAllUsers } from '@/lib/email';

// Validation schema for document updates
const updateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.nativeEnum(DocumentCategory),
  classification: z.nativeEnum(DocumentClassification),
  status: z.nativeEnum(ContentStatus),
  tags: z.string().optional(),
  version: z.string().optional(),
});

// Check if user can edit this document
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

// Check if user can delete documents
const canDeleteDocument = (userRoles: UserRole[]): boolean => {
  // Only ADMIN can delete documents
  return userRoles.includes(UserRole.ADMIN);
};

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

// PUT - Update document
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = updateDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.issues }, { status: 400 });
    }

    const { title, description, content, category, classification, status, tags, version } = validationResult.data;

    // Find existing document
    const existingDocument = await prisma.document.findUnique({
      where: { slug: resolvedParams.slug },
      select: {
        id: true,
        title: true,
        slug: true,
        authorId: true,
        status: true,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Check permissions
    if (!canEditDocument(existingDocument, session.user.roles as UserRole[], session.user.id)) {
      return NextResponse.json({ message: 'Forbidden: You can only edit your own documents' }, { status: 403 });
    }

    // Generate new slug if title changed
    let newSlug = existingDocument.slug;
    if (title !== existingDocument.title) {
      newSlug = generateSlug(title);

      // Check if new slug already exists (excluding current document)
      const existingSlug = await prisma.document.findFirst({
        where: {
          slug: newSlug,
          id: { not: existingDocument.id },
        },
      });

      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
    }

    // Check if status is changing to PUBLISHED
    const isStatusChangingToPublished =
      existingDocument.status !== ContentStatus.PUBLISHED && status === ContentStatus.PUBLISHED;

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id: existingDocument.id },
      data: {
        title,
        description,
        content,
        category,
        classification,
        status,
        tags: tags
          ? tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : [],
        version: version || undefined,
        slug: newSlug,
        updatedAt: new Date(),
        publishedAt: status === ContentStatus.PUBLISHED && !existingDocument.status ? new Date() : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send email notifications if status changed to published
    if (isStatusChangingToPublished) {
      try {
        await sendDocumentNotificationToAllUsers({
          documentTitle: updatedDocument.title,
          documentSlug: updatedDocument.slug,
          documentCategory: updatedDocument.category,
          authorName: updatedDocument.author.name,
          authorId: updatedDocument.authorId,
          isNewDocument: false, // This is a status change, not a new document
        });
      } catch (emailError) {
        console.error('Failed to send document notification emails:', emailError);
        // Don't fail the API call if email sending fails
      }
    }

    // Revalidate relevant paths
    revalidatePath('/docs');
    revalidatePath(`/docs/${resolvedParams.slug}`);
    if (newSlug !== resolvedParams.slug) {
      revalidatePath(`/docs/${newSlug}`);
    }

    return NextResponse.json({
      message: 'Document updated successfully',
      document: updatedDocument,
      newSlug: newSlug !== resolvedParams.slug ? newSlug : undefined,
    });
  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only ADMIN can delete
    if (!canDeleteDocument(session.user.roles as UserRole[])) {
      return NextResponse.json({ message: 'Forbidden: Only administrators can delete documents' }, { status: 403 });
    }

    // Find existing document
    const existingDocument = await prisma.document.findUnique({
      where: { slug: resolvedParams.slug },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!existingDocument) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Get title confirmation from request body
    const body = await request.json();
    const { titleConfirmation } = body;

    if (!titleConfirmation || titleConfirmation !== existingDocument.title) {
      return NextResponse.json(
        {
          message: 'Title confirmation does not match. Please type the exact document title to confirm deletion.',
        },
        { status: 400 }
      );
    }

    // Delete document
    await prisma.document.delete({
      where: { id: existingDocument.id },
    });

    // Revalidate relevant paths
    revalidatePath('/docs');
    revalidatePath(`/docs/${resolvedParams.slug}`);

    return NextResponse.json({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
