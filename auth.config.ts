import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const hasRoles = auth?.user?.roles && auth.user.roles.length > 0;
      const isOnLogin = nextUrl.pathname === '/login';
      const isOnRegister = nextUrl.pathname === '/register';
      const isOnPendingApproval = nextUrl.pathname === '/pending-approval';

      // Allow login and register pages for unauthenticated users
      if (isOnLogin || isOnRegister) {
        // If already logged in, redirect appropriately
        if (isLoggedIn) {
          if (!hasRoles) {
            return Response.redirect(new URL('/pending-approval', nextUrl));
          }
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Allow pending approval page for logged in users without roles
      if (isOnPendingApproval) {
        if (isLoggedIn && !hasRoles) {
          return true;
        }
        // Redirect to home if user has roles or to login if not authenticated
        return Response.redirect(new URL(isLoggedIn ? '/' : '/login', nextUrl));
      }

      // All other pages require authentication
      if (!isLoggedIn) {
        return false; // This will redirect to login page
      }

      // Users without roles should only access pending approval page
      if (!hasRoles) {
        return Response.redirect(new URL('/pending-approval', nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.roles = user.roles;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
            include: {
              member: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
