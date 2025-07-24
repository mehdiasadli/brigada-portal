import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { createUserSchema } from '@/schemas/user.schema';
import { ZodError } from 'zod';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user (no roles assigned - requires admin approval)
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        roles: [], // No roles - requires admin approval
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        createdAt: true,
      },
    });

    // Send welcome email to the new user
    try {
      await sendWelcomeEmail(user.name, user.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the registration if email sending fails
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
