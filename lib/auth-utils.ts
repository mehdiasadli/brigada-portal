import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  roles?: string[];
  bio?: string;
  mobileNumber?: string;
}) {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      roles: (data.roles || ['USER']) as UserRole[],
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { member: true },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { member: true },
  });
}
