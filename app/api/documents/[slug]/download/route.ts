import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ContentStatus, DocumentClassification, UserRole } from '@prisma/client';

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

// Extract content from MDX wrapper
const extractMDXContent = (mdxContent: string): string => {
  const lines = mdxContent.split('\n');
  const contentStart = lines.findIndex((line) => line.trim() === '>');
  const contentEnd = lines.lastIndexOf('</MDXLayout>');

  if (contentStart !== -1 && contentEnd !== -1) {
    return lines
      .slice(contentStart + 1, contentEnd)
      .join('\n')
      .trim();
  }

  return mdxContent;
};

// Convert markdown to plain text
const markdownToText = (markdown: string): string => {
  let text = markdown;

  // Remove headers markers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove formatting
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/_(.*?)_/g, '$1');
  text = text.replace(/<u>(.*?)<\/u>/g, '$1');
  text = text.replace(/~~(.*?)~~/g, '$1');
  text = text.replace(/`(.*?)`/g, '$1');

  // Convert links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // Clean up lists
  text = text.replace(/^[-*+]\s+/gm, '• ');
  text = text.replace(/^\d+\.\s+/gm, '');

  // Remove quotes
  text = text.replace(/^>\s+/gm, '');

  // Clean up horizontal rules
  text = text.replace(/^---+$/gm, '');

  return text;
};

// Generate safe filename
const generateFilename = (title: string, format: string): string => {
  const safeName = title
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase()
    .substring(0, 50); // Limit length

  return `${safeName}.${format}`;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'md';

    if (!['md', 'txt', 'pdf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported formats: md, txt, pdf' }, { status: 400 });
    }

    // Find document by slug
    const document = await prisma.document.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check access permissions
    if (!hasDocumentAccess(document.classification, session.user.roles as UserRole[])) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if user can access non-published documents
    const isOfficial = session.user.roles.includes(UserRole.OFFICIAL);
    if (document.status !== ContentStatus.PUBLISHED && !isOfficial) {
      return NextResponse.json({ error: 'Document not available' }, { status: 403 });
    }

    const filename = generateFilename(document.title, format);
    const extractedContent = extractMDXContent(document.content);

    let fileContent: string;
    let mimeType: string;

    switch (format) {
      case 'md':
        // Add document metadata as frontmatter
        fileContent = `---
title: ${document.title}
author: ${document.author.name}
created: ${document.createdAt.toISOString().split('T')[0]}
version: ${document.version || '1.0'}
classification: ${document.classification}
---

${extractedContent}`;
        mimeType = 'text/markdown';
        break;

      case 'txt':
        fileContent = `${document.title}
Author: ${document.author.name}
Created: ${document.createdAt.toLocaleDateString()}
Version: ${document.version || '1.0'}
Classification: ${document.classification}

${markdownToText(extractedContent)}`;
        mimeType = 'text/plain';
        break;

      case 'pdf':
        // Return JSON data that the client will use to generate PDF
        const pdfData = {
          title: document.title,
          author: document.author.name,
          created: document.createdAt.toLocaleDateString(),
          version: document.version || '1.0',
          classification: document.classification,
          content: extractedContent,
        };
        fileContent = JSON.stringify(pdfData);
        mimeType = 'application/json';
        break;

      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    // Create response with proper headers for file download
    const response = new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
