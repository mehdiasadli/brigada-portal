import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

// GET - Fetch users for member linking
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create members (ADMIN only)
    const userRoles = session.user.roles as UserRole[];
    if (!userRoles.includes(UserRole.ADMIN)) {
      return NextResponse.json(
        {
          message: 'Forbidden: Only administrators can access user list',
        },
        { status: 403 }
      );
    }

    // Fetch users that don't already have a member profile
    const users = await prisma.user.findMany({
      where: {
        member: null, // Only users without existing member profiles
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
