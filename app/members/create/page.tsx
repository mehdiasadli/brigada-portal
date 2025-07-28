import { auth } from '@/auth';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import CreateMemberForm from '@/components/CreateMemberForm';

type CreateMemberPageProps = {
  searchParams?: Promise<{
    userId?: string;
    name?: string;
    email?: string;
  }>;
};

export default async function CreateMemberPage({ searchParams }: CreateMemberPageProps) {
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (!session.user.roles.includes(UserRole.ADMIN)) {
    redirect('/members');
  }

  const { userId, name, email } = (await searchParams) ?? {};

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 font-serif mb-4'>Yeni Üzv Əlavə Et</h1>
          <p className='text-xl text-gray-700 font-serif'>İcma üzvlərinin siyahısına yeni üzv əlavə edin.</p>
        </div>

        {/* Form */}
        <CreateMemberForm userId={userId} name={name} email={email} />
      </div>
    </div>
  );
}
