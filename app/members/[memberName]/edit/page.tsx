import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import UpdateMemberForm from '@/components/UpdateMemberForm';

interface PageProps {
  params: Promise<{
    memberName: string;
  }>;
}

// Generate member slug from name (same logic as in members page)
const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

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

export default async function EditMemberPage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Find all members to match by slug
  const members = await prisma.member.findMany({
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

  // Find the member whose name generates the same slug as the URL parameter
  const member = members.find((m) => generateSlug(m.name) === resolvedParams.memberName);

  if (!member) {
    notFound();
  }

  // Check if user can edit this member
  if (!canEditMember(member, session.user.roles as UserRole[], session.user.id)) {
    redirect('/members');
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 font-serif mb-2'>Üzvü yenilə</h1>
          <p className='text-gray-600 font-serif'>&quot;{member.name}&quot; üzv profilinə dəyişikliklər edin</p>
        </div>

        <UpdateMemberForm member={member} />
      </div>
    </div>
  );
}
