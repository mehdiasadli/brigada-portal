import { prisma } from '@/lib/prisma';
import { ContentStatus, DocumentCategory, DocumentClassification, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { sendDocumentNotificationToAllUsers } from '@/lib/email';

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  category: z
    .enum([
      DocumentCategory.CODE,
      DocumentCategory.CONSTITUTION,
      DocumentCategory.DECREE,
      DocumentCategory.LAW,
      DocumentCategory.REGULATION,
      DocumentCategory.RESOLUTION,
      DocumentCategory.OTHER,
    ])
    .optional(),
  version: z.string().optional(),
  effectiveDate: z.coerce.date().optional(),
  classification: z
    .enum([DocumentClassification.PUBLIC, DocumentClassification.INTERNAL, DocumentClassification.RESTRICTED])
    .optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum([ContentStatus.DRAFT, ContentStatus.PUBLISHED, ContentStatus.ARCHIVED]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!session.user.roles.includes(UserRole.OFFICIAL)) {
      return NextResponse.json({ error: 'Official access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingDocument = await prisma.document.findUnique({
      where: { slug },
    });

    if (existingDocument) {
      return NextResponse.json({ error: 'A document with this title already exists' }, { status: 400 });
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        ...validatedData,
        slug,
        status: validatedData.status || ContentStatus.DRAFT,
        tags: validatedData.tags || [],
        authorId: session.user.id,
        publishedAt: validatedData.status === ContentStatus.PUBLISHED ? new Date() : null,
      },
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

    // Send email notifications if document is published
    if (document.status === ContentStatus.PUBLISHED) {
      try {
        await sendDocumentNotificationToAllUsers({
          documentTitle: document.title,
          documentSlug: document.slug,
          documentCategory: document.category,
          authorName: document.author.name,
          authorId: document.authorId,
          isNewDocument: true,
        });
      } catch (emailError) {
        console.error('Failed to send document notification emails:', emailError);
        // Don't fail the API call if email sending fails
      }
    }

    // Revalidate the documents page
    revalidatePath('/docs');

    return NextResponse.json(
      {
        message: 'Document created successfully',
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create document error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
