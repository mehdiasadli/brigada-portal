import { prisma } from '@/lib/prisma';
import { MemberStatus, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.coerce.date(),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  bio: z.string().optional(),
  status: z.enum([MemberStatus.ACTIVE, MemberStatus.INACTIVE, MemberStatus.BANNED]).optional(),
  email: z.string().email('Invalid email address'),
  mobileNumbers: z.array(z.string()).optional(),
  instagram: z.string().optional(),
  github: z.string().optional(),
  facebook: z.string().optional(),
  x: z.string().optional(),
  linkedin: z.string().optional(),
  title: z.string().optional(),
  organization: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!session.user.roles.includes(UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createMemberSchema.parse(body);

    // Check if email already exists
    const existingMember = await prisma.member.findUnique({
      where: { email: validatedData.email },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Member with this email already exists' }, { status: 400 });
    }

    // Check if userId is already linked to another member (if provided)
    if (validatedData.userId) {
      const existingUserMember = await prisma.member.findUnique({
        where: { userId: validatedData.userId },
      });

      if (existingUserMember) {
        return NextResponse.json({ error: 'This user is already linked to another member' }, { status: 400 });
      }

      // Verify the user exists
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'Selected user does not exist' }, { status: 400 });
      }
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        ...validatedData,
        status: validatedData.status || MemberStatus.ACTIVE,
        mobileNumbers: validatedData.mobileNumbers || [],
      },
    });

    // Revalidate the members page
    revalidatePath('/members');

    return NextResponse.json(
      {
        message: 'Member created successfully',
        data: member,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create member error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
