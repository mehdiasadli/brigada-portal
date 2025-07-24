import { z } from 'zod';

export const userRole = z.enum(['USER', 'EDITOR', 'JOURNALIST', 'OFFICIAL', 'MODERATOR', 'ADMIN'] as const);

export const userEntity = z.object({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  email: z.email('Email is invalid'),
  roles: z.array(userRole),
  name: z.string({
    error(issue) {
      if (issue.code === 'invalid_type') {
        return 'Name must be a string';
      }

      return 'Name is required';
    },
  }),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
