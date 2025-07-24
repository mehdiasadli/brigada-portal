// GET /api/members
// Description: Get the list of members

import { prisma } from '@/lib/prisma';
import { MemberStatus, Prisma } from '@prisma/client';
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
    const status = searchParams.get('status') as MemberStatus | null;
    const search = searchParams.get('search');

    // Build query conditions
    const whereConditions: Prisma.MemberWhereInput = {};

    if (status && Object.values(MemberStatus).includes(status)) {
      whereConditions.status = status;
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const members = await prisma.member.findMany({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      orderBy: { name: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            roles: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: members,
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
