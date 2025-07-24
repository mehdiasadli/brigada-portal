import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { sendRoleAssignmentEmail } from '@/lib/email';

// Validation schema for role updates
const updateRolesSchema = z.object({
  roles: z.array(
    z.enum([UserRole.USER, UserRole.EDITOR, UserRole.JOURNALIST, UserRole.OFFICIAL, UserRole.MODERATOR, UserRole.ADMIN])
  ),
});

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

// PUT - Update user roles (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can change user roles
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      return NextResponse.json({ message: 'Forbidden: Only administrators can change user roles' }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = updateRolesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.issues }, { status: 400 });
    }

    const { roles } = validationResult.data;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: resolvedParams.userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent admins from changing their own roles
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ message: 'Cannot change your own roles' }, { status: 400 });
    }

    // Update user roles
    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.userId },
      data: {
        roles: roles,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
      },
    });

    // Send email notification to the user about role changes
    try {
      await sendRoleAssignmentEmail({
        userName: updatedUser.name,
        userEmail: updatedUser.email,
        roles: updatedUser.roles,
        assignedBy: session.user.name || session.user.email || 'Administrator',
      });
    } catch (emailError) {
      console.error('Failed to send role assignment email:', emailError);
      // Don't fail the API call if email sending fails
    }

    return NextResponse.json({
      message: 'User roles updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
