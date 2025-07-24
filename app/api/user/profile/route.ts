import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  bio: z.string().optional(),
  // Member fields (if the user has a member profile)
  member: z
    .object({
      dateOfBirth: z.string().optional().or(z.literal('')),
      placeOfBirth: z.string().optional(),
      title: z.string().optional(),
      organization: z.string().optional(),
      avatarUrl: z.string().url().optional().or(z.literal('')),
      instagram: z.string().url().optional().or(z.literal('')),
      github: z.string().url().optional().or(z.literal('')),
      facebook: z.string().url().optional().or(z.literal('')),
      x: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
});

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data with member information
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        member: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.issues }, { status: 400 });
    }

    const { name, email, bio, member } = validationResult.data;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.id,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email is already taken' }, { status: 400 });
    }

    // Process optional string fields (convert empty strings to undefined for Prisma)
    const processOptionalString = (value?: string) => (value && value !== '' ? value : undefined);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        updatedAt: new Date(),
      },
    });

    // Update member profile if provided and user has a member
    if (member) {
      const existingMember = await prisma.member.findUnique({
        where: { userId: session.user.id },
      });

      if (existingMember) {
        // Process optional date fields
        const processedDateOfBirth =
          member.dateOfBirth && member.dateOfBirth !== '' ? new Date(member.dateOfBirth) : undefined;

        await prisma.member.update({
          where: { userId: session.user.id },
          data: {
            bio: processOptionalString(bio),
            dateOfBirth: processedDateOfBirth,
            placeOfBirth: processOptionalString(member.placeOfBirth),
            title: processOptionalString(member.title),
            organization: processOptionalString(member.organization),
            avatarUrl: processOptionalString(member.avatarUrl),
            instagram: processOptionalString(member.instagram),
            github: processOptionalString(member.github),
            facebook: processOptionalString(member.facebook),
            x: processOptionalString(member.x),
            linkedin: processOptionalString(member.linkedin),
            updatedAt: new Date(),
          },
        });
      }
    }

    // Revalidate profile pages
    revalidatePath('/profile');
    revalidatePath('/profile/edit');

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
