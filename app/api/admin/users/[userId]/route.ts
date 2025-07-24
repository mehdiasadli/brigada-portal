import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

// DELETE - Delete user (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can delete users
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      return NextResponse.json({ message: 'Forbidden: Only administrators can delete users' }, { status: 403 });
    }

    // Get confirmation from request body
    const body = await request.json();
    const { emailConfirmation } = body;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: resolvedParams.userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        member: {
          select: {
            id: true,
            name: true,
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
          },
        },
        articles: {
          select: {
            id: true,
            title: true,
          },
        },
        news: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify email confirmation
    if (!emailConfirmation || emailConfirmation !== targetUser.email) {
      return NextResponse.json(
        {
          message: 'Email confirmation does not match. Please type the exact user email to confirm deletion.',
        },
        { status: 400 }
      );
    }

    // Prevent admins from deleting themselves
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 });
    }

    // Prevent deleting other admins (optional security measure)
    if (targetUser.roles.includes(UserRole.ADMIN)) {
      return NextResponse.json({ message: 'Cannot delete other administrator accounts' }, { status: 400 });
    }

    // Check if user has content that would be affected
    const hasContent = targetUser.documents.length > 0 || targetUser.articles.length > 0 || targetUser.news.length > 0;

    if (hasContent) {
      // Get content summary for the response
      const contentSummary = {
        documents: targetUser.documents.length,
        articles: targetUser.articles.length,
        news: targetUser.news.length,
      };

      return NextResponse.json(
        {
          message: 'Cannot delete user with existing content. Please transfer or delete their content first.',
          contentSummary,
          contentDetails: {
            documents: targetUser.documents.map((d) => d.title),
            articles: targetUser.articles.map((a) => a.title),
            news: targetUser.news.map((n) => n.title),
          },
        },
        { status: 400 }
      );
    }

    // Delete user (this will also delete related member profile due to cascade)
    await prisma.user.delete({
      where: { id: resolvedParams.userId },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        hadMemberProfile: !!targetUser.member,
      },
    });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
