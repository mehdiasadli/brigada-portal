import { prisma } from '@/lib/prisma';
import { ContentStatus, DocumentCategory, Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as ContentStatus | null;
    const category = searchParams.get('category') as DocumentCategory | null;
    const search = searchParams.get('search');

    // Build query conditions
    const whereConditions: Prisma.DocumentWhereInput = {};

    if (status && Object.values(ContentStatus).includes(status)) {
      whereConditions.status = status;
    }

    if (category) {
      whereConditions.category = category;
    }

    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documents = await prisma.document.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      orderBy: { updatedAt: 'desc' },
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

    return NextResponse.json({
      data: documents,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
