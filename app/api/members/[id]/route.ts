import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { MemberStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema for member updates
const updateMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  status: z.enum([MemberStatus.ACTIVE, MemberStatus.INACTIVE, MemberStatus.BANNED]),
  email: z.email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  placeOfBirth: z.string().optional(),
  avatarUrl: z.url().optional().or(z.literal('')),
  mobileNumbers: z.array(z.string()).optional(),
  instagram: z.url().optional().or(z.literal('')),
  github: z.url().optional().or(z.literal('')),
  facebook: z.url().optional().or(z.literal('')),
  x: z.url().optional().or(z.literal('')),
  linkedin: z.url().optional().or(z.literal('')),
  title: z.string().optional(),
  organization: z.string().optional(),
});

// Check if user can edit this member
const canEditMember = (
  member: { userId: string | null; user?: { roles: string[] } | null },
  userRoles: UserRole[],
  userId: string
): boolean => {
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  const isModerator = userRoles.includes(UserRole.MODERATOR);
  const isOwnMember = member.userId === userId;
  const memberUserIsAdmin = member.user?.roles?.includes(UserRole.ADMIN);

  // ADMIN can edit any member (except other ADMIN members)
  if (isAdmin && !memberUserIsAdmin) {
    return true;
  }

  // MODERATOR can edit any member except ADMIN members
  if (isModerator && !memberUserIsAdmin) {
    return true;
  }

  // Any user can edit their own member profile if they have one
  if (isOwnMember) {
    return true;
  }

  return false;
};

// Check if user can delete members
const canDeleteMember = (member: { user?: { roles: string[] } | null }, userRoles: UserRole[]): boolean => {
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  const memberUserIsAdmin = member.user?.roles?.includes(UserRole.ADMIN);

  // Only ADMIN can delete members, but not other ADMIN members
  return isAdmin && !memberUserIsAdmin;
};

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT - Update member
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = updateMemberSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.issues }, { status: 400 });
    }

    const {
      name,
      bio,
      status,
      email,
      dateOfBirth,
      placeOfBirth,
      avatarUrl,
      mobileNumbers,
      instagram,
      github,
      facebook,
      x,
      linkedin,
      title,
      organization,
    } = validationResult.data;

    // Find existing member
    const existingMember = await prisma.member.findUnique({
      where: { id: resolvedParams.id },
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

    if (!existingMember) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    // Check permissions
    if (!canEditMember(existingMember, session.user.roles as UserRole[], session.user.id)) {
      return NextResponse.json(
        {
          message: 'Forbidden: You can only edit your own member profile or you need MODERATOR/ADMIN privileges',
        },
        { status: 403 }
      );
    }

    // Process optional date fields
    const processedDateOfBirth = dateOfBirth && dateOfBirth !== '' ? new Date(dateOfBirth) : undefined;

    // Process optional string fields (convert empty strings to undefined for Prisma)
    const processOptionalString = (value?: string) => (value && value !== '' ? value : undefined);

    // Update member
    const updatedMember = await prisma.member.update({
      where: { id: resolvedParams.id },
      data: {
        name,
        bio: processOptionalString(bio),
        status,
        email,
        dateOfBirth: processedDateOfBirth,
        placeOfBirth: processOptionalString(placeOfBirth),
        avatarUrl: processOptionalString(avatarUrl),
        mobileNumbers: mobileNumbers || undefined,
        instagram: processOptionalString(instagram),
        github: processOptionalString(github),
        facebook: processOptionalString(facebook),
        x: processOptionalString(x),
        linkedin: processOptionalString(linkedin),
        title: processOptionalString(title),
        organization: processOptionalString(organization),
        updatedAt: new Date(),
      },
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

    // Revalidate relevant paths
    revalidatePath('/members');
    const memberSlug = name.toLowerCase().replace(/\s+/g, '-');
    revalidatePath(`/members/${memberSlug}`);

    return NextResponse.json({
      message: 'Member updated successfully',
      member: updatedMember,
    });
  } catch (error) {
    console.error('Member update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only ADMIN can delete
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      return NextResponse.json({ message: 'Forbidden: Only administrators can delete members' }, { status: 403 });
    }

    // Find existing member
    const existingMember = await prisma.member.findUnique({
      where: { id: resolvedParams.id },
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

    if (!existingMember) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    // Check if member can be deleted (not ADMIN)
    if (!canDeleteMember(existingMember, session.user.roles as UserRole[])) {
      return NextResponse.json(
        {
          message: 'Forbidden: Cannot delete administrator members',
        },
        { status: 403 }
      );
    }

    // Get name confirmation from request body
    const body = await request.json();
    const { nameConfirmation } = body;

    if (!nameConfirmation || nameConfirmation !== existingMember.name) {
      return NextResponse.json(
        {
          message: 'Name confirmation does not match. Please type the exact member name to confirm deletion.',
        },
        { status: 400 }
      );
    }

    // Delete member
    await prisma.member.delete({
      where: { id: resolvedParams.id },
    });

    // Revalidate relevant paths
    revalidatePath('/members');
    const memberSlug = existingMember.name.toLowerCase().replace(/\s+/g, '-');
    revalidatePath(`/members/${memberSlug}`);

    return NextResponse.json({
      message: 'Member deleted successfully',
    });
  } catch (error) {
    console.error('Member deletion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
